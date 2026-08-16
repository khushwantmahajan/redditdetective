import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto flex max-w-md flex-col items-center px-4 py-28 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-surface">
            <SearchX className="h-6 w-6 text-muted-foreground" aria-hidden />
          </div>
          <h1 className="mt-6 text-xl font-semibold text-foreground">Page not found</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            The page you&apos;re looking for doesn&apos;t exist or may have moved.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent-cyan hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
