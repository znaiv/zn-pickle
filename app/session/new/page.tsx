import { NewSessionForm } from "@/components/session/new-session-form";
import { ResumeLastSession } from "@/components/session/resume-last-session";
import { Navbar } from "@/components/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start Session",
};

export default function NewSessionPage() {
  return (
    <>
      <Navbar />
      <main className="bg-surface mx-auto max-w-6xl px-4 py-28 sm:px-6 lg:px-8">
        <NewSessionForm />
        <ResumeLastSession />
      </main>
    </>
  );
}
