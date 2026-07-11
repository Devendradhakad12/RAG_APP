import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Minimal RAG Studio',
    description: 'A compact chat app that uses LangGraph and Gemini for retrieval-augmented generation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
