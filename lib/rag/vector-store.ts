import type { DocumentChunk } from "@/lib/rag/types";

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((acc, value, index) => acc + value * (b[index] ?? 0), 0);
  const magnitudeA = Math.sqrt(
    a.reduce((acc, value) => acc + value * value, 0),
  );
  const magnitudeB = Math.sqrt(
    b.reduce((acc, value) => acc + value * value, 0),
  );

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dot / (magnitudeA * magnitudeB);
}

export interface ScoredChunk {
  chunk: DocumentChunk;
  score: number;
}

export class InMemoryVectorStore {
  private chunks: DocumentChunk[] = [];
  private embeddings: number[][] = [];

  addDocuments(chunks: DocumentChunk[], embeddings: number[][]) {
    this.chunks = chunks;
    this.embeddings = embeddings;
  }

  async similaritySearch(
    queryEmbedding: number[],
    topK = 3,
  ): Promise<DocumentChunk[]> {
    const scored = await this.similaritySearchWithScores(queryEmbedding, topK);
    return scored.map((entry) => entry.chunk).filter(Boolean);
  }

  async similaritySearchWithScores(
    queryEmbedding: number[],
    topK = 3,
  ): Promise<ScoredChunk[]> {
    const scored = this.embeddings.map((embedding, index) => ({
      chunk: this.chunks[index],
      score: cosineSimilarity(embedding, queryEmbedding),
    }));

    scored.sort((left, right) => right.score - left.score);
    return scored.slice(0, topK).filter((entry) => Boolean(entry.chunk));
  }
}
