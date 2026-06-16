import { SessionPanel } from "@/components/session/session-panel";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Run Session",
};

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ view?: string }> };

export default async function SessionPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const readOnly = sp.view === "1";

  return (
    <>
      <Navbar />
      <main className="bg-surface mx-auto max-w-6xl px-4 py-28 sm:px-6 lg:px-8">
        <SessionPanel sessionId={id} readOnly={readOnly} />
      </main>
    </>
  );
}
