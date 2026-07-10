import { useListPosts } from "@workspace/api-client-react";
import { PostCard } from "@/components/post-card";
import { Layout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { TerminalSquare } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: posts, isLoading } = useListPosts({ publishedOnly: true });

  return (
    <Layout>
      <div className="mb-12 md:mb-16 border-b border-primary/30 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 uppercase flex items-center gap-3">
          <TerminalSquare className="text-primary" size={32} />
          ~/published_logs
        </h1>
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
          Public database records. Access level: Everyone.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border border-primary/20 bg-background/50">
              <Skeleton className="h-4 w-48 mb-4 bg-primary/20 rounded-none" />
              <Skeleton className="h-6 w-3/4 mb-4 bg-primary/20 rounded-none" />
              <Skeleton className="h-16 w-full bg-primary/20 rounded-none" />
            </div>
          ))}
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="flex flex-col">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center border border-primary/30 bg-primary/5 p-8 relative">
          <div className="absolute top-0 left-0 bg-primary text-black text-[10px] px-2 py-0.5 font-bold uppercase">
            WARNING: EMPTY_DIR
          </div>
          <div className="w-16 h-16 text-primary flex items-center justify-center mb-4">
            <TerminalSquare size={48} />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-2 uppercase">NO_RECORDS_FOUND</h2>
          <p className="text-primary/70 mb-8 max-w-sm font-mono text-sm uppercase">
            Directory is empty. No public logs have been written to the database.
          </p>
          <Link href="/new" className="bg-primary text-black px-6 py-2 font-bold hover:bg-primary/80 transition-none uppercase">
            &gt; INITIALIZE_NEW_LOG
          </Link>
        </div>
      )}
    </Layout>
  );
}
