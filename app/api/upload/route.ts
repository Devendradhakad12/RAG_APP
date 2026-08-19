import { NextRequest, NextResponse } from "next/server";
import { registerPdf } from "@/lib/rag/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A PDF file is required." }, { status: 400 });
    }

    const document = await registerPdf(file);
    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        category: document.category,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The PDF could not be uploaded.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}