# Minimal RAG Web App

This project is a compact retrieval-augmented generation (RAG) web application built with Next.js 15, TypeScript, Tailwind CSS, LangChain, LangGraph, and the Gemini API.

## Features

- Local sample documents stored in memory.
- Document chunking and embedding generation.
- An in-memory vector store for similarity search.
- A LangGraph workflow with retrieval and generation steps.
- A chat UI with streaming responses, loading states, and error handling.

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
