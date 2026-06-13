import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, AudioWaveform, FileText, CheckSquare } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/20 blur-[120px] mix-blend-screen pointer-events-none" />
      
      <main className="container max-w-5xl mx-auto px-4 text-center z-10 flex flex-col items-center">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold mb-8 backdrop-blur-md bg-muted/50">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          AI-Powered Meeting Intelligence
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Turn your meetings into <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-500">
            clear action plans
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Upload audio, video, or text. Our AI extracts action items, decisions, and summaries automatically. Stop losing track of what matters.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-md h-12 px-8">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 w-full max-w-4xl mx-auto text-left">
          <div className="p-6 rounded-2xl bg-card border shadow-sm backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <AudioWaveform className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold mb-2">Automated Transcripts</h3>
            <p className="text-muted-foreground text-sm">Convert your meeting recordings into accurate text instantly.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border shadow-sm backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Smart Summaries</h3>
            <p className="text-muted-foreground text-sm">Get concise takeaways, decisions made, and key topics discussed.</p>
          </div>
          <div className="p-6 rounded-2xl bg-card border shadow-sm backdrop-blur-sm">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
              <CheckSquare className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold mb-2">Actionable Tasks</h3>
            <p className="text-muted-foreground text-sm">Automatically extract tasks, assignees, and deadlines.</p>
          </div>
        </div>
      </main>

      <footer className="absolute bottom-4 text-sm text-muted-foreground">
        Built by <a href="https://github.com/muhammadtaimoorajmal" className="hover:text-primary transition underline underline-offset-4">Muhammad Taimoor Ajmal</a>
        <span className="mx-2">|</span>
        <a href="https://www.linkedin.com/in/muhammadtaimoorajmal/" className="hover:text-primary transition underline underline-offset-4">LinkedIn</a>
      </footer>
    </div>
  );
}
