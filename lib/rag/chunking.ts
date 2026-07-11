import type { DocumentChunk, SampleDocument } from "@/lib/rag/types";

// Split a document into smaller chunks with a short overlap so retrieval keeps context.
function splitIntoChunks(
  text: string,
  chunkSize = 260,
  overlap = 40,
): string[] {
  if (!text.trim()) return [];

  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];

  for (let start = 0; start < words.length; start += chunkSize - overlap) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(" ");
    if (chunk.trim()) {
      chunks.push(chunk);
    }
    if (end === words.length) break;
  }

  return chunks;
}

export function buildChunksFromDocuments(
  documents: SampleDocument[],
): DocumentChunk[] {
  return documents.flatMap((document) => {
    const chunks = splitIntoChunks(document.content);
    return chunks.map((chunk, index) => ({
      id: `${document.id}-chunk-${index + 1}`,
      documentId: document.id,
      content: chunk,
      metadata: {
        title: document.title,
        category: document.category,
      },
    }));
  });
}
