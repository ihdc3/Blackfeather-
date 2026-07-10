import { Link } from "wouter";
import { format } from "date-fns";
import type { Post } from "@workspace/api-client-react";

interface PostCardProps {
  post: Post;
  isDraft?: boolean;
}

export function PostCard({ post, isDraft = false }: PostCardProps) {
  return (
    <Link href={isDraft ? `/posts/${post.slug}/edit` : `/posts/${post.slug}`} className="group block mb-6">
      <article className="p-4 border border-primary/20 bg-background transition-none hover:border-primary hover:bg-primary/5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-widest mb-2 font-bold">
            <span>&gt; DATE:</span>
            <time dateTime={post.createdAt} className="text-primary/70">
              {format(new Date(post.createdAt), "yyyy-MM-dd HH:mm:ss")}
            </time>
            {isDraft && (
              <span className="text-black bg-primary px-1.5 py-0.5 ml-2">[DRAFT]</span>
            )}
            <span className="ml-auto">AUTHOR: {post.authorName}</span>
          </div>
          
          <h2 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-none uppercase">
            {post.title}
          </h2>
          
          {post.excerpt && (
            <p className="text-muted-foreground text-sm leading-relaxed mt-2 line-clamp-3">
              {post.excerpt}
            </p>
          )}
          
          <div className="mt-4 flex items-center text-xs font-bold text-primary/0 group-hover:text-primary transition-none">
            <span className="mr-2">&gt;</span>
            {isDraft ? "EXECUTE: EDIT_DRAFT" : "EXECUTE: READ_FILE"}
            <span className="cursor-blink"></span>
          </div>
        </div>
      </article>
    </Link>
  );
}
