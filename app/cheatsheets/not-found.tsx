import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheatsheetNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="text-6xl mb-6">📚</div>
        <h1 className="text-3xl font-bold text-white mb-4">
          Cheatsheet Not Found
        </h1>
        <p className="text-slate-400 mb-6">
          The cheatsheet you&apos;re looking for doesn&apos;t exist or
          couldn&apos;t be loaded.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cheatsheets">
            <Button className="w-full sm:w-auto">Browse All Cheatsheets</Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-slate-700/50 text-slate-400 hover:text-slate-300 hover:border-slate-600/50"
            >
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
