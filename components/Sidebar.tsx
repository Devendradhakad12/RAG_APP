import { DocumentCard } from '@/components/DocumentCard';
import type { SampleDocument } from '@/lib/rag/types';

interface SidebarProps {
    documents: SampleDocument[];
}

export function Sidebar({ documents }: SidebarProps) {
    return (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-2xl shadow-black/40">
            <div className="mb-4">
                <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">Knowledge base</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Sample documents</h2>
                <p className="mt-2 text-sm text-slate-400">
                    These local snippets are chunked, embedded, and used as context for the RAG answer.
                </p>
            </div>
            <div className="space-y-3">
                {documents.map((document) => (
                    <DocumentCard key={document.id} document={document} />
                ))}
            </div>
        </div>
    );
}
