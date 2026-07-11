import { NextRequest, NextResponse } from "next/server";
import { runRagWorkflow } from "@/lib/rag/graph";

export async function GET() {
  return NextResponse.json({
    message: "Use POST to ask the RAG assistant a question.",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = typeof body.query === "string" ? body.query.trim() : "";

    if (!query) {
      return NextResponse.json(
        { error: "A question is required." },
        { status: 400 },
      );
    }

    // Run the LangGraph workflow and stream the answer back in small text chunks.
    const result = await runRagWorkflow(query);
    const answer =
      typeof result.answer === "string"
        ? result.answer
        : "No answer was produced.";

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const chunks = answer.match(/.{1,80}/g) ?? [answer];

        const writeChunk = async () => {
          for (const chunk of chunks) {
            controller.enqueue(encoder.encode(chunk));
            await new Promise((resolve) => setTimeout(resolve, 20));
          }
          controller.close();
        };

        void writeChunk();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "The assistant could not answer.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
