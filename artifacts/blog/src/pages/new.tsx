import { useLocation } from "wouter";
import { useCreatePost } from "@workspace/api-client-react";
import { PostEditor } from "@/components/post-editor";
import { Layout } from "@/components/layout";
import { RequireSignedIn } from "@/components/require-signed-in";
import { useToast } from "@/hooks/use-toast";
import type { PostInput } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListPostsQueryKey, getGetPostsSummaryQueryKey } from "@workspace/api-client-react";

export default function NewPost() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createPost = useCreatePost();
  const queryClient = useQueryClient();

  const handleSave = (data: PostInput) => {
    createPost.mutate({ data }, {
      onSuccess: (post) => {
        toast({
          title: data.status === "published" ? "SUCCESS: RECORD_PUBLISHED" : "SUCCESS: BUFFER_SAVED",
          description: data.status === "published"
            ? "Data block successfully written to public database." 
            : "Local buffer saved. Awaiting commit.",
        });
        
        // Invalidate queries so lists update
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPostsSummaryQueryKey() });
        
        // Redirect
        if (data.status === "published") {
          setLocation(`/posts/${post.slug}`);
        } else {
          setLocation("/drafts");
        }
      },
      onError: (error: any) => {
        const status = error?.response?.status ?? error?.status;
        toast({
          title: status === 401 || status === 403 ? "ERROR: ACCESS_DENIED" : "ERROR: WRITE_FAILED",
          description: status === 401 || status === 403
            ? "This account is not authorized to write records."
            : "Permission denied or storage limit exceeded.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Layout>
      <RequireSignedIn>
        <PostEditor
          title="NEW_BUFFER"
          onSave={handleSave}
          isSaving={createPost.isPending}
        />
      </RequireSignedIn>
    </Layout>
  );
}
