import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Terminal, SquareTerminal, Settings as SettingsIcon } from "lucide-react";
import { useGetPostsSummary, useGetSiteSettings } from "@workspace/api-client-react";
import { Skeleton } from "./ui/skeleton";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: summary, isLoading: isLoadingSummary } = useGetPostsSummary();
  const { data: settings, isLoading: isLoadingSettings } = useGetSiteSettings();

  const isRoute = (path: string) => location === path;
  const siteTitle = settings?.title || "Journal";

  useEffect(() => {
    document.title = siteTitle;
  }, [siteTitle]);

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-primary selection:text-black">
      <header className="sticky top-0 z-50 w-full border-b border-primary/30 bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group hover:text-primary transition-none">
            <Terminal size={18} className="text-primary" />
            <span className="font-mono font-bold tracking-tight text-lg cursor-blink">{siteTitle}</span>
          </Link>

          <nav className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-bold mr-4">
              <Link 
                href="/" 
                className={`transition-none uppercase hover:text-primary ${isRoute("/") ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              >
                ./published
                {summary && !isLoadingSummary && (
                  <span className="ml-2 text-xs border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-primary">
                    {summary.publishedCount}
                  </span>
                )}
              </Link>
              <Link 
                href="/drafts" 
                className={`transition-none uppercase hover:text-primary ${isRoute("/drafts") ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              >
                ./drafts
                {summary && !isLoadingSummary && summary.draftCount > 0 && (
                  <span className="ml-2 text-xs border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-primary">
                    {summary.draftCount}
                  </span>
                )}
              </Link>
            </div>

            <Link 
              href="/settings" 
              className={`flex items-center justify-center w-8 h-8 transition-none hover:text-primary ${isRoute("/settings") ? "text-primary border-b-2 border-primary" : "text-muted-foreground"}`}
              title="Settings"
            >
              <SettingsIcon size={18} />
            </Link>

            <Link 
              href="/new" 
              className="flex items-center gap-2 text-sm font-bold bg-primary text-black px-4 py-1.5 uppercase hover:bg-primary/80 transition-none active:scale-95"
            >
              <SquareTerminal size={16} />
              <span className="hidden sm:inline">Write</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 md:px-8 max-w-5xl py-12 md:py-20 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-primary/30 py-6 mt-auto bg-background">
        <div className="container mx-auto px-4 md:px-8 max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-mono uppercase">
          <p className="flex items-center gap-2">
            <span className="w-2 h-2 bg-primary inline-block animate-pulse"></span>
            SYSTEM ONLINE
          </p>
          <div className="flex gap-4">
            {isLoadingSummary ? (
              <Skeleton className="w-24 h-4 bg-primary/20" />
            ) : summary ? (
              <span>DB_RECORDS: {summary.totalPosts}</span>
            ) : null}
          </div>
        </div>
      </footer>
    </div>
  );
}
