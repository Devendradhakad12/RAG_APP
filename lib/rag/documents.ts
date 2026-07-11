import type { SampleDocument } from "@/lib/rag/types";

export const sampleDocuments: SampleDocument[] = [
  {
    id: "doc-1",
    title: "Next.js App Router overview",
    category: "Framework",
    content:
      "Next.js uses the App Router to organize routes in the app directory. Server components by default improve data fetching and reduce client-side JavaScript. Route handlers can respond to API requests without needing a separate backend server.",
  },
  {
    id: "doc-2",
    title: "Building a simple RAG workflow",
    category: "AI",
    content:
      "Retrieval-augmented generation combines vector search with a language model. The system retrieves relevant snippets from documents before asking Gemini to answer the user question with grounded context.",
  },
  {
    id: "doc-3",
    title: "LangChain and LangGraph basics",
    category: "Orchestration",
    content:
      "LangChain provides reusable building blocks for prompts, models, and tool use. LangGraph adds stateful workflows so you can create explicit retrieval and generation steps for structured AI applications.",
  },
  {
    id: "doc-4",
    title: "Using Gemini with TypeScript",
    category: "Model API",
    content:
      "Gemini can be used from TypeScript with the Google GenAI SDK. A concise system prompt, relevant retrieved chunks, and a clear task description usually produce better answers for domain-specific questions.",
  },
];
