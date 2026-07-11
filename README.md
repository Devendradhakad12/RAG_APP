# Retrieval-Augmented Generation (RAG) Web App

## Introduction

This is a modern, full-stack Retrieval-Augmented Generation (RAG) application that combines document retrieval with generative AI to answer user queries with context-aware responses. Built with cutting-edge technologies, it provides a seamless chat experience where users can interact with their documents through an intelligent assistant powered by Google's Gemini API.

The application intelligently retrieves relevant document chunks based on user queries and uses them to generate accurate, contextual answers, ensuring responses are grounded in the actual document content.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 15.3.3 - React 19 with server and client components
- **Language**: TypeScript 5.7.3 - for type-safe development
- **Styling**: Tailwind CSS 3.4.15 - utility-first CSS framework
- **CSS Processing**: PostCSS 8.4.49, Autoprefixer - for vendor prefixing and CSS optimization

### Backend
- **Runtime**: Node.js (via Next.js)
- **API Routes**: Next.js API routes for serverless backend functions
- **Request Handling**: Next.js Server Request/Response APIs

### AI & Machine Learning
- **LLM Framework**: LangChain 1.5.3 - orchestration framework for AI applications
- **Core Components**: @langchain/core 1.2.2 - base abstractions and utilities
- **Workflow Orchestration**: @langchain/langgraph 1.4.7 - for building multi-step AI workflows
- **AI Provider**: @langchain/google-genai 2.2.0 - integration with Google Generative AI (Gemini)
- **Generative AI Model**: Google Gemini API - state-of-the-art language model

### Data Processing & Storage
- **Vector Store**: In-memory custom implementation for semantic search
- **Embeddings**: Google Generative AI embeddings for semantic vector representation
- **Document Processing**: Custom chunking and embedding pipeline

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint 9.16.0 with Next.js configuration
- **Build Tool**: Next.js built-in Webpack bundling

---

## Key Features

### 1. **Document Management**
   - Support for multiple documents with metadata (ID, title, category, content)
   - Local in-memory document storage with sample data
   - Document categorization for better organization

### 2. **Intelligent Document Processing**
   - **Document Chunking**: Splits large documents into manageable chunks while preserving context
   - **Semantic Embeddings**: Converts text to vector representations for similarity-based retrieval
   - **Metadata Preservation**: Maintains document metadata through the processing pipeline

### 3. **Retrieval-Augmented Generation (RAG) Workflow**
   - **Multi-Step LangGraph Workflow**:
     - Query processing and embedding
     - Semantic similarity search against document chunks
     - Context extraction from relevant documents
     - Answer generation using retrieved context
   - **In-Memory Vector Store**: Fast similarity search without external dependencies

### 4. **Advanced Chat Interface**
   - **Real-Time Streaming**: Responses stream to the user with character-by-character animation
   - **Conversational UI**: Clean, intuitive chat panel with message history
   - **Document Sidebar**: Browse and view available documents with categorization
   - **Loading States**: Clear visual feedback during query processing
   - **Error Handling**: Graceful error messages for failed queries

### 5. **Streaming Responses**
   - Non-blocking response streaming using ReadableStream API
   - Chunked delivery of AI-generated text for responsive UX
   - Smooth character-by-character animation for natural feel

### 6. **Responsive Design**
   - Mobile-first layout with Tailwind CSS
   - Sidebar and chat panel adapt to different screen sizes
   - Dark theme interface (slate-950 background)

### 7. **API-Driven Architecture**
   - RESTful API endpoint for chat queries (/api/chat)
   - POST requests accept query parameters
   - Streaming text responses with proper headers
   - Validation and error handling

## Environment setup

1. Copy [.env.example](.env.example) to .env.local.
2. Provide your Gemini API key:

```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

## Installation

```bash
npm install
```

## Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## Build

```bash
npm run build
```
