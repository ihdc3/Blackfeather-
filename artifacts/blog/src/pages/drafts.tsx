import { useListPosts } from "@workspace/api-client-react";
import { PostCard } from "@/components/post-card";
import { Layout } from "@/components/layout";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCode2, Archive } from "lucide-react";
import { Link } from "wouter";

export default function Drafts() {
  const { data: drafts, isLoading: isDraftsLoading } = useListPosts({ status: "draft" });
  const { data: archived, isLoading: isArchivedLoading } = useListPosts({ status: "archived" });
  
  const isLoading = isDraftsLoading || isArchivedLoading;

  return (
    <Layout>
      <div className="mb-12 border-b border-primary/30 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 uppercase flex items-center gap-3">
          <FileCode2 className="text-primary" size={32} />
          ~/local_buffers
        </h1>
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
          Drafts and archived records. Pending or suspended state.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="p-4 border border-primary/20 bg-background/50">
              <Skeleton className="h-4 w-48 mb-4 bg-primary/20 rounded-none" />
              <Skeleton className="h-6 w-3/4 mb-4 bg-primary/20 rounded-none" />
              <Skeleton className="h-16 w-full bg-primary/20 rounded-none" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-16">
          <section>
            <h2 className="text-xl font-bold text-primary mb-6 uppercase flex items-center gap-2 border-b border-primary/20 pb-2">
              <span className="text-black bg-primary px-2 py-0.5">DRAFTS</span>
            </h2>
            
            {drafts && drafts.length > 0 ? (
              <div className="flex flex-col">
                {drafts.map((post) => (
                  <PostCard key={post.id} post={post} isDraft={true} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center flex flex-col items-center justify-center border border-primary/30 bg-primary/5 p-8 relative">
                <p className="text-primary/70 font-mono text-sm uppercase">No active draft buffers found.</p>
                <Link href="/new" className="mt-4 text-primary hover:bg-primary hover:text-black px-4 py-1 border border-primary transition-none text-xs font-bold uppercase">
                  &gt; OPEN_NEW_BUFFER
                </Link>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold text-muted-foreground mb-6 uppercase flex items-center gap-2 border-b border-primary/20 pb-2">
              <Archive size={18} />
              ARCHIVED
            </h2>
            
            {archived && archived.length > 0 ? (
              <div className="flex flex-col opacity-80 hover:opacity-100 transition-opacity">
                {archived.map((post) => (
                  <PostCard key={post.id} post={post} isDraft={true} />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center flex flex-col items-center justify-center border border-primary/10 bg-black p-8 relative">
                <p className="text-muted-foreground font-mono text-sm uppercase">Archive is empty.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}
