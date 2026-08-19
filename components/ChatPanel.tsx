'use client';

import { ChangeEvent, FormEvent, useMemo, useState } from 'react';
import { ChatMessage } from '@/components/ChatMessage';

interface ChatMessageModel {
    role: 'user' | 'assistant';
    content: string;
}

const starterMessages: ChatMessageModel[] = [
    {
        role: 'assistant',
        content: 'Hello! Ask me something about Devendra Dhakad and I will answer with retrieved context.',
    },
];

export function ChatPanel() {
    const [messages, setMessages] = useState<ChatMessageModel[]>(starterMessages);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [documentId, setDocumentId] = useState('sample');
    const [documentTitle, setDocumentTitle] = useState('Sample documents');
    const [error, setError] = useState('');

    const trimmedInput = input.trim();
    const canSend = Boolean(trimmedInput) && !isStreaming;

    // Stream the assistant reply back into the UI as the server emits chunks.
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!canSend) return;

        const query = trimmedInput;
        setMessages((previous) => [...previous, { role: 'user', content: query }]);
        setInput('');
        setError('');
        setIsStreaming(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, documentId }),
            });

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                throw new Error(payload.error ?? 'The server could not generate an answer.');
            }

            if (!response.body) {
                throw new Error('The response stream was empty.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let assistantText = '';
            let renderedText = '';
            let typingTimer: number | null = null;

            setMessages((previous) => [...previous, { role: 'assistant', content: '' }]);

            const updateAssistantMessage = (content: string) => {
                setMessages((previous) => {
                    const next = [...previous];
                    next[next.length - 1] = { role: 'assistant', content };
                    return next;
                });
            };

            const startTypingAnimation = () => {
                if (typingTimer) return;

                const revealNextCharacter = () => {
                    if (renderedText.length < assistantText.length) {
                        renderedText = assistantText.slice(0, renderedText.length + 1);
                        updateAssistantMessage(renderedText);
                        typingTimer = window.setTimeout(revealNextCharacter, 16);
                    } else {
                        typingTimer = null;
                    }
                };

                revealNextCharacter();
            };

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunkText = decoder.decode(value, { stream: true });
                assistantText += chunkText;
                startTypingAnimation();
            }

            const tail = decoder.decode();
            if (tail) {
                assistantText += tail;
                startTypingAnimation();
            }
        } catch (requestError) {
            const message = requestError instanceof Error ? requestError.message : 'Unexpected error';
            setError(message);
            setMessages((previous) => [...previous, { role: 'assistant', content: `Sorry, I could not answer that request. ${message}` }]);
        } finally {
            setIsStreaming(false);
        }
    };

    const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        setError('');
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            const payload = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(payload.error ?? 'The PDF could not be uploaded.');
            }

            setDocumentId(payload.document.id);
            setDocumentTitle(payload.document.title);
            setMessages([
                {
                    role: 'assistant',
                    content: `I am ready to answer questions from “${payload.document.title}”.`,
                },
            ]);
        } catch (uploadError) {
            setError(uploadError instanceof Error ? uploadError.message : 'The PDF could not be uploaded.');
        } finally {
            setIsUploading(false);
        }
    };

    const statusLabel = useMemo(() => {
        if (error) return 'Unable to answer';
        if (isUploading) return 'Uploading PDF…';
        if (isStreaming) return 'Streaming answer…';
        return 'Ready';
    }, [error, isStreaming]);

    return (
        <div className="flex h-full flex-col rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">RAG chat</p>
                    <h2 className="mt-1 text-xl font-semibold text-white">Ask your document</h2>
                    <p className="mt-1 max-w-sm truncate text-xs text-slate-400" title={documentTitle}>
                        Using: {documentTitle}
                    </p>
                </div>
                <div className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-sm text-cyan-300">
                    {statusLabel}
                </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl bg-slate-950/70 p-3">
                {messages.map((message, index) => (
                    <ChatMessage key={`${message.role}-${index}`} role={message.role} content={message.content} />
                ))}
            </div>

            {error ? (
                <div className="mt-3 rounded-2xl border border-rose-700/50 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                    {error}
                </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/20">
                    {isUploading ? 'Uploading…' : 'Upload PDF'}
                    <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={handleUpload}
                        disabled={isUploading || isStreaming}
                        className="sr-only"
                    />
                </label>
                <span className="text-xs text-slate-500">PDF only, up to 10 MB</span>
            </div>

            <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3 md:flex-row">
                <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="Ask a question about this PDF"
                    className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none ring-0 transition focus:border-cyan-400"
                    disabled={isStreaming || isUploading}
                />
                <button
                    type="submit"
                    disabled={!canSend || isUploading}
                    className="rounded-2xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                    {isStreaming ? 'Thinking…' : 'Send'}
                </button>
            </form>
        </div>
    );
}
