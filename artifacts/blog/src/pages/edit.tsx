import { useRoute, useLocation } from "wouter";
import { useUpdatePost, useListPosts, useGetPost } from "@workspace/api-client-react";
import { PostEditor } from "@/components/post-editor";
import { Layout } from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import type { PostInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListPostsQueryKey, getGetPostsSummaryQueryKey } from "@workspace/api-client-react";

export default function EditPost() {
  const [match, params] = useRoute("/posts/:slug/edit");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const updatePost = useUpdatePost();
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

  const isLoading = isLoadingPosts || (!!postId && isLoadingPost);
  const displayPost = post || postInfo;

  const handleSave = (data: PostInput) => {
    if (!postId) return;
    
    updatePost.mutate({ id: postId, data }, {
      onSuccess: (updatedPost) => {
        toast({
          title: "SUCCESS: RECORD_UPDATED",
          description: data.status === "published"
            ? "Modifications committed to public database." 
            : "Local buffer updated successfully.",
        });
        
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPostsSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: ["getPost", postId] });
        
        if (data.status === "published") {
          setLocation(`/posts/${updatedPost.slug}`);
        } else {
          setLocation("/drafts");
        }
      },
      onError: () => {
        toast({
          title: "ERROR: UPDATE_FAILED",
          description: "Database write error. Check your connection.",
          variant: "destructive",
        });
      }
    });
  };

  if (!match) return null;

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto w-full pt-10">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-primary/20 w-3/4 rounded-none"></div>
            <div className="h-96 bg-primary/20 w-full rounded-none"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!displayPost) {
    return (
      <Layout>
        <div className="py-20 text-center flex flex-col items-center border border-primary/30 bg-primary/5 p-8 relative max-w-2xl mx-auto">
          <div className="absolute top-0 left-0 bg-primary text-black text-[10px] px-2 py-0.5 font-bold uppercase">
            ERROR: 404
          </div>
          <h1 className="text-2xl font-bold text-primary mb-4 uppercase">RECORD_NOT_FOUND</h1>
          <p className="text-primary/70 font-mono text-sm uppercase">Unable to locate the specified data block for editing.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PostEditor
        title={`EDIT_BUFFER: ${displayPost.slug}`}
        initialData={{
          ...displayPost,
          coverImageUrl: displayPost.coverImageUrl || null,
        }}
        onSave={handleSave}
        isSaving={updatePost.isPending}
      />
    </Layout>
  );
}
