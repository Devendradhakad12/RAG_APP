export interface SampleDocument {
  id: string;
  title: string;
  category: string;
  content: string;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  metadata: {
    title: string;
    category: string;
  };
}

export interface RagState {
  query: string;
  context: string;
  answer: string;
}
