import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

let embeddingsModel: GoogleGenerativeAIEmbeddings | null = null;

function getEmbeddingsModel() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error(
      "Set GEMINI_API_KEY in your environment before using the RAG app.",
    );
  }

  if (!embeddingsModel) {
    embeddingsModel = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-embedding-001",
    });
  }

  return embeddingsModel;
}

export async function embedText(text: string): Promise<number[]> {
  const model = getEmbeddingsModel();
  return model.embedQuery(text);
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const model = getEmbeddingsModel();
  return model.embedDocuments(texts);
}
