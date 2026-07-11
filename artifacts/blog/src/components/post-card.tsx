import { Link } from "wouter";
import { format } from "date-fns";
import type { Post } from "@workspace/api-client-react";
import { Lock, Unlock, ShieldAlert } from "lucide-react";

interface PostCardProps {
  post: Post;
  isDraft?: boolean;
}

export function PostCard({ post, isDraft = false }: PostCardProps) {
  return (
    <Link href={isDraft ? `/posts/${post.slug}/edit` : `/posts/${post.slug}`} className="group block mb-6">
      <article className="p-4 border border-primary/20 bg-background transition-none hover:border-primary hover:bg-primary/5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground uppercase tracking-widest mb-1 font-bold flex-wrap">
            <span>&gt; DATE:</span>
            <time dateTime={post.createdAt} className="text-primary/70">
              {format(new Date(post.createdAt), "yyyy-MM-dd HH:mm:ss")}
            </time>
            
            <span className={`px-1.5 py-0.5 ml-2 border ${
              post.status === 'published' ? 'text-black bg-primary border-primary' : 
              post.status === 'archived' ? 'text-muted-foreground border-muted-foreground' : 
              'text-primary border-primary'
            }`}>
              [{post.status.toUpperCase()}]
            </span>

            <span className={`flex items-center gap-1 px-1.5 py-0.5 border ${
              post.encryptionLevel === 'classified' ? 'text-destructive border-destructive bg-destructive/10' :
              post.encryptionLevel === 'encrypted' ? 'text-amber-500 border-amber-500 bg-amber-500/10' :
              'text-primary border-primary bg-primary/10'
            }`}>
              {post.encryptionLevel === 'classified' ? <ShieldAlert size={10} /> :
               post.encryptionLevel === 'encrypted' ? <Lock size={10} /> : <Unlock size={10} />}
              {post.encryptionLevel.toUpperCase()}
            </span>
            
            <span className="ml-auto">AUTHOR: {post.authorName}</span>
          </div>
          
          {post.coverImageUrl && (
            <div className="w-full h-32 sm:h-48 border border-primary/30 overflow-hidden relative my-2">
              <div className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none"></div>
              <img 
                src={`/api/storage${post.coverImageUrl}`} 
                alt="" 
                className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" 
              />
            </div>
          )}
          
          <h2 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-none uppercase">
            {post.title}
          </h2>
          
          {post.excerpt && (
            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}
          
          <div className="mt-2 flex items-center text-xs font-bold text-primary/0 group-hover:text-primary transition-none">
            <span className="mr-2">&gt;</span>
            {isDraft ? "EXECUTE: EDIT_DRAFT" : "EXECUTE: READ_FILE"}
            <span className="cursor-blink"></span>
          </div>
        </div>
      </article>
    </Link>
  );
}
