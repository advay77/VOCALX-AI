/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";

interface FeedbackRequest {
  conversation: { type: "user" | "assistant"; content: string }[];
}

// --- Zod Schema (loose enough for LLM errors) ---
const feedbackSchema = z.object({
  feedback: z.object({
    rating: z.object({
      technicalSkills: z.number().min(0).max(10).optional(),
      communication: z.number().min(0).max(10).optional(),
      problemSolving: z.number().min(0).max(10).optional(),
      experience: z.number().min(0).max(10).optional(),
    }),
    summary: z.string().describe("3-line summary of the conversation").optional(),
    recommendation: z.enum(["Yes", "No"]).optional(),
    recommendationMessage: z.string().optional(),
  }),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parser = StructuredOutputParser.fromZodSchema(feedbackSchema as any);

// --- Prompt Template ---
const promptTemplate = PromptTemplate.fromTemplate(`
Conversation between Assistant and User:
{conversation}

Based on the above interview conversation, provide structured feedback.

Your task:
- Rate technicalSkills, communication, problemSolving, and experience (0-10 scale).
- Provide a concise summary in 3 lines.
- Provide a recommendation (Yes/No) and a recommendationMessage.

Return ONLY JSON in this format:
{format_instructions}
`);

// --- LLM ---
const llm = new ChatGroq({
  model: "meta-llama/llama-4-scout-17b-16e-instruct",
  temperature: 0.3,
  maxTokens: 600,
});

// --- Chain ---
const chain = promptTemplate.pipe(llm).pipe(parser);

export async function POST(request: Request) {
  try {
    const body: FeedbackRequest = await request.json();
    const { conversation } = body;

    if (!conversation || conversation.length === 0) {
      return NextResponse.json(
        { isError: true, error: "Missing conversation data" },
        { status: 400 }
      );
    }

    // Format conversation into readable string for the LLM
    const conversationString = conversation
      .map((m) => `${m.type === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const input = {
      conversation: conversationString,
      format_instructions: parser.getFormatInstructions(),
    };

    const result = await chain.invoke(input) as z.infer<typeof feedbackSchema>;

    // --- Normalize response (so frontend never breaks) ---
    const finalResult = {
      feedback: {
        rating: {
          technicalSkills: result?.feedback?.rating?.technicalSkills ?? 0,
          communication: result?.feedback?.rating?.communication ?? 0,
          problemSolving: result?.feedback?.rating?.problemSolving ?? 0,
          experience: result?.feedback?.rating?.experience ?? 0,
        },
        summary: result?.feedback?.summary ?? "",
        recommendation: result?.feedback?.recommendation ?? "No",
        recommendationMessage:
          result?.feedback?.recommendationMessage ??
          "Not recommended based on insufficient data.",
      },
    };

    return NextResponse.json({ data: finalResult });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate feedback';
    console.error("❌ FEEDBACK ERROR:", error);
    return NextResponse.json(
      { isError: true, error: errorMessage },
      { status: 500 }
    );
  }
}
