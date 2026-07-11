import { ChatPanel } from '@/components/ChatPanel';
import { Sidebar } from '@/components/Sidebar';
import { sampleDocuments } from '@/lib/rag/documents';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:flex-row lg:px-6">
                <aside className="w-full lg:w-80">
                    <Sidebar documents={sampleDocuments} />
                </aside>
                <section className="flex-1">
                    <ChatPanel />
                </section>
            </div>
        </main>
    );
}
