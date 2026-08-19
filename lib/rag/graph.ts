import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { buildChunksFromDocuments } from "@/lib/rag/chunking";
import { sampleDocuments } from "@/lib/rag/documents";
import { embedText, embedTexts } from "@/lib/rag/embeddings";
import { generateWithGoogleLlm } from "@/lib/rag/googleApi";
import { getUploadedDocument } from "@/lib/rag/uploads";
import { InMemoryVectorStore } from "@/lib/rag/vector-store";

// Cache the workflow and vector store so subsequent requests reuse the same in-memory graph.
let workflow: ReturnType<any> | null = null;
const stores = new Map<string, InMemoryVectorStore>();
const storePromises = new Map<string, Promise<InMemoryVectorStore>>();

async function getOrCreateStore(documentId: string) {
  const existingStore = stores.get(documentId);
  if (existingStore) return existingStore;

  const existingPromise = storePromises.get(documentId);
  if (existingPromise) return existingPromise;

  const storePromise = (async () => {
    const document = documentId === "sample" ? null : getUploadedDocument(documentId);
    if (documentId !== "sample" && !document) {
      throw new Error("The uploaded document could not be found. Please upload it again.");
    }

    const vectorStore = new InMemoryVectorStore();
    const chunks = buildChunksFromDocuments(document ? [document] : sampleDocuments);
    const chunkEmbeddings = await embedTexts(chunks.map((chunk) => chunk.content));
    vectorStore.addDocuments(chunks, chunkEmbeddings);
    stores.set(documentId, vectorStore);
    return vectorStore;
  })();

  storePromises.set(documentId, storePromise);
  try {
    return await storePromise;
  } finally {
    storePromises.delete(documentId);
  }
}

const RagAnnotation = Annotation.Root({
  query: Annotation<string>({
    value: (left: string | undefined, right: string | undefined) =>
      right ?? left ?? "",
    default: () => "",
  }),
  context: Annotation<string>({
    value: (left: string | undefined, right: string | undefined) =>
      right ?? left ?? "",
    default: () => "",
  }),
  answer: Annotation<string>({
    value: (left: string | undefined, right: string | undefined) =>
      right ?? left ?? "",
    default: () => "",
  }),
  documentId: Annotation<string>({
    value: (left: string | undefined, right: string | undefined) =>
      right ?? left ?? "sample",
    default: () => "sample",
  }),
});

function buildContextPrompt(query: string, context: string) {
  if (!context.trim()) {
    return `Answer briefly.\n\nQ: ${query}`;
  }

  return `Answer briefly using this context.\n\nQ: ${query}\n\nContext: ${context}`;
}

export async function getOrCreateRagWorkflow() {
  if (workflow) return workflow;

  const graph = new StateGraph(RagAnnotation) as any;

  graph.addNode("retrieve", async (state: typeof RagAnnotation.State) => {
    const vectorStore = await getOrCreateStore(state.documentId);
    const queryEmbedding = await embedText(state.query);
    const scoredChunks = await vectorStore.similaritySearchWithScores(
      queryEmbedding,
      2,
    );
    const bestScore = scoredChunks[0]?.score ?? 0;
    const relevantChunks =
      bestScore >= 0.2
        ? scoredChunks.filter((entry) => entry.score >= 0.2)
        : [];

    const context = relevantChunks
      .map(({ chunk }) => {
        return `${chunk.content}`;
      })
      .join("\n");

    return { context };
  });

  graph.addNode("generate", async (state: typeof RagAnnotation.State) => {
    const prompt = buildContextPrompt(state.query, state.context);
    const answer = await generateWithGoogleLlm(prompt);
    return { answer };
  });

  graph.addEdge(START, "retrieve");
  graph.addEdge("retrieve", "generate");
  graph.addEdge("generate", END);

  workflow = graph.compile();
  return workflow;
}

export async function runRagWorkflow(query: string, documentId = "sample") {
  const app = await getOrCreateRagWorkflow();
  return app.invoke({ query, documentId });
}
