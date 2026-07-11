import type { SampleDocument } from '@/lib/rag/types';

interface DocumentCardProps {
    document: SampleDocument;
}

export function DocumentCard({ document }: DocumentCardProps) {
    return (
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white">{document.title}</h3>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                    {document.category}
                </span>
            </div>
            <p className="text-sm text-slate-400">{document.content}</p>
        </div>
    );
}
