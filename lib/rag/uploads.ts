import type { SampleDocument } from "@/lib/rag/types";

const pdf = require("pdf-parse/lib/pdf-parse.js") as (
  data: Buffer,
) => Promise<{ text: string }>;

const uploadedDocumentsKey = Symbol.for("rag.uploadedDocuments");
const globalState = globalThis as typeof globalThis & {
  [uploadedDocumentsKey]?: Map<string, SampleDocument>;
};
const uploadedDocuments =
  globalState[uploadedDocumentsKey] ?? new Map<string, SampleDocument>();
globalState[uploadedDocumentsKey] = uploadedDocuments;

export async function registerPdf(file: File): Promise<SampleDocument> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Please upload a PDF file.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("PDF files must be smaller than 10 MB.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const parsed = await pdf(buffer);
  const content = parsed.text.trim();

  if (!content) {
    throw new Error("This PDF does not contain extractable text.");
  }

  const document: SampleDocument = {
    id: `upload-${crypto.randomUUID()}`,
    title: file.name.replace(/\.pdf$/i, ""),
    category: "Uploaded PDF",
    content,
  };

  uploadedDocuments.set(document.id, document);
  return document;
}

export function getUploadedDocument(documentId: string) {
  return uploadedDocuments.get(documentId);
}