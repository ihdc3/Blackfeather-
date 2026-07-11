import { useRoute, useLocation } from "wouter";
import { useListPosts, useGetPost, useDeletePost } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { format } from "date-fns";
import { ChevronLeft, Edit2, Trash2, Terminal, Lock, Unlock, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { getListPostsQueryKey, getGetPostsSummaryQueryKey } from "@workspace/api-client-react";

export default function PostView() {
  const [match, params] = useRoute("/posts/:slug");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts, isLoading: isLoadingPosts } = useListPosts();
  
  const postInfo = posts?.find(p => p.slug === params?.slug);
  const postId = postInfo?.id;

  const { data: post, isLoading: isLoadingPost } = useGetPost(postId as number, { 
    query: { 
      enabled: !!postId,
      queryKey: ["getPost", postId]
    } 
  });

  const deletePost = useDeletePost();

  const handleDelete = () => {
    if (!postId) return;
    
    deletePost.mutate({ id: postId }, {
      onSuccess: () => {
        toast({
          title: "SUCCESS: RECORD_DELETED",
          description: "The data block has been permanently erased from the database.",
        });
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPostsSummaryQueryKey() });
        setLocation("/");
      },
      onError: () => {
        toast({
          title: "ERROR: DELETION_FAILED",
          description: "Access denied or database error encountered.",
          variant: "destructive",
        });
      }
    });
  };

  const isLoading = isLoadingPosts || (!!postId && isLoadingPost);

  if (!match) return null;

  if (!isLoading && !post && !postInfo) {
    return (
      <Layout>
        <div className="py-20 text-center flex flex-col items-center border border-primary/30 bg-primary/5 p-8 relative max-w-2xl mx-auto">
          <div className="absolute top-0 left-0 bg-primary text-black text-[10px] px-2 py-0.5 font-bold uppercase">
            ERROR: 404
          </div>
          <h1 className="text-2xl font-bold text-primary mb-4 uppercase">RECORD_NOT_FOUND</h1>
          <p className="text-primary/70 mb-8 font-mono text-sm uppercase">The requested data block does not exist or has been purged.</p>
          <Button asChild variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-black uppercase text-xs font-bold">
            <Link href="/">&lt; RETURN_TO_ROOT</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const displayPost = post || postInfo;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto w-full pb-16">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-none uppercase mb-8">
            <ChevronLeft size={16} className="mr-1" />
            [BACK]
          </Link>

          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-primary/20 w-48 rounded-none"></div>
              <div className="h-12 md:h-16 bg-primary/20 w-full rounded-none mt-6"></div>
              <div className="h-6 bg-primary/20 w-full rounded-none mt-8"></div>
              <div className="h-6 bg-primary/20 w-3/4 rounded-none mt-2"></div>
              <div className="h-6 bg-primary/20 w-5/6 rounded-none mt-2"></div>
            </div>
          ) : displayPost ? (
            <article className="border border-primary/20 bg-black p-6 md:p-8 relative">
              <div className="absolute top-0 left-0 bg-primary/20 text-primary text-[10px] px-2 py-0.5 border-b border-r border-primary/20 flex items-center gap-2 font-bold uppercase">
                <Terminal size={10} />
                VIEWER: {displayPost.slug}.log
              </div>

              <header className="mb-10 mt-4 border-b border-primary/30 pb-8">
                {displayPost.coverImageUrl && (
                  <div className="mb-8 border border-primary/30 w-full relative">
                    <div className="absolute inset-0 bg-primary/10 pointer-events-none mix-blend-overlay"></div>
                    <img src={`/api/storage${displayPost.coverImageUrl}`} alt="Cover" className="w-full h-auto object-cover max-h-[400px] filter grayscale" />
                  </div>
                )}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-primary/70 font-bold uppercase tracking-widest">
                    <span>&gt; TIMESTAMP:</span>
                    <time dateTime={displayPost.createdAt}>
                      {format(new Date(displayPost.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </time>
                    
                    <span className={`px-1.5 py-0.5 border ${
                      displayPost.status === 'published' ? 'text-black bg-primary border-primary' : 
                      displayPost.status === 'archived' ? 'text-muted-foreground border-muted-foreground' : 
                      'text-primary border-primary'
                    }`}>
                      [{displayPost.status.toUpperCase()}]
                    </span>

                    <span className={`flex items-center gap-1 px-1.5 py-0.5 border ${
                      displayPost.encryptionLevel === 'classified' ? 'text-destructive border-destructive bg-destructive/10' :
                      displayPost.encryptionLevel === 'encrypted' ? 'text-amber-500 border-amber-500 bg-amber-500/10' :
                      'text-primary border-primary bg-primary/10'
                    }`}>
                      {displayPost.encryptionLevel === 'classified' ? <ShieldAlert size={10} /> :
                       displayPost.encryptionLevel === 'encrypted' ? <Lock size={10} /> : <Unlock size={10} />}
                      {displayPost.encryptionLevel.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild className="rounded-none border-primary/50 text-primary hover:bg-primary/20 hover:text-primary uppercase text-xs font-bold h-8">
                      <Link href={`/posts/${displayPost.slug}/edit`}>
                        <Edit2 size={14} className="mr-2" />
                        EDIT
                      </Link>
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="rounded-none border-destructive/50 text-destructive hover:bg-destructive/20 hover:text-destructive uppercase text-xs font-bold h-8 px-3">
                          <Trash2 size={14} />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-none border-primary bg-black">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-mono text-xl font-bold uppercase text-primary border-b border-primary/30 pb-2 mb-2">CONFIRM_PURGE</AlertDialogTitle>
                          <AlertDialogDescription className="font-mono text-sm text-primary/70 uppercase">
                            WARNING: This action is irreversible. The record "{displayPost.title}" will be permanently erased.
                            Proceed with deletion?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-6 border-t border-primary/30 pt-4">
                          <AlertDialogCancel className="rounded-none border-primary/50 text-primary hover:bg-primary/20 hover:text-primary uppercase text-xs font-bold">ABORT</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} className="rounded-none bg-destructive text-black hover:bg-destructive/80 uppercase text-xs font-bold">
                            {deletePost.isPending ? "EXECUTING..." : "EXECUTE_PURGE"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-6 uppercase">
                  {displayPost.title}
                </h1>
                
                <div className="flex flex-col md:flex-row md:items-center gap-4 text-xs font-bold uppercase text-primary/70 mt-6 bg-primary/5 p-3 border border-primary/10">
                  <span>USER_ID: {displayPost.authorName}</span>
                  {displayPost.excerpt && (
                    <>
                      <span className="hidden md:inline text-primary/30">|</span>
                      <span>SUMMARY: {displayPost.excerpt}</span>
                    </>
                  )}
                </div>
              </header>
              
              <div className="prose-custom whitespace-pre-wrap">
                {displayPost.content}
              </div>
              
              <div className="mt-12 pt-4 border-t border-primary/30 text-xs font-bold uppercase text-primary/50 text-right">
                EOF<span className="cursor-blink"></span>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </Layout>
  );
}
