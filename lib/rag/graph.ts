import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { buildChunksFromDocuments } from "@/lib/rag/chunking";
import { sampleDocuments } from "@/lib/rag/documents";
import { embedText, embedTexts } from "@/lib/rag/embeddings";
import { generateWithGoogleLlm } from "@/lib/rag/googleApi";
import { InMemoryVectorStore } from "@/lib/rag/vector-store";

// Cache the workflow and vector store so subsequent requests reuse the same in-memory graph.
let workflow: ReturnType<any> | null = null;
let store: InMemoryVectorStore | null = null;

function getOrCreateStore() {
  if (!store) {
    store = new InMemoryVectorStore();
  }
  return store;
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
});

async function initializeStore() {
  const vectorStore = getOrCreateStore();
  const chunks = buildChunksFromDocuments(sampleDocuments);
  const chunkTexts = chunks.map((chunk) => chunk.content);
  const chunkEmbeddings = await embedTexts(chunkTexts);
  vectorStore.addDocuments(chunks, chunkEmbeddings);
  return vectorStore;
}

function buildContextPrompt(query: string, context: string) {
  if (!context.trim()) {
    return `Answer briefly.\n\nQ: ${query}`;
  }

  return `Answer briefly using this context.\n\nQ: ${query}\n\nContext: ${context}`;
}

export async function getOrCreateRagWorkflow() {
  if (workflow) return workflow;

  const vectorStore = await initializeStore();

  const graph = new StateGraph(RagAnnotation) as any;

  graph.addNode("retrieve", async (state: typeof RagAnnotation.State) => {
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

export async function runRagWorkflow(query: string) {
  const app = await getOrCreateRagWorkflow();
  return app.invoke({ query });
}
