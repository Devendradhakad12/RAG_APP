import type { ReactNode } from 'react';

interface ChatMessageProps {
    role: 'user' | 'assistant';
    content: string;
    children?: ReactNode;
}

export function ChatMessage({ role, content, children }: ChatMessageProps) {
    const isUser = role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${isUser
                        ? 'bg-cyan-600 text-white'
                        : 'border border-slate-700 bg-slate-900/90 text-slate-200'
                    }`}
            >
                <div className="mb-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    {isUser ? 'You' : 'Assistant'}
                </div>
                <div className="whitespace-pre-wrap">{content}</div>
                {children}
            </div>
        </div>
    );
}
