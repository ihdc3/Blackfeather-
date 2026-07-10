import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, Terminal, Settings } from "lucide-react";
import { Link } from "wouter";
import type { PostInput } from "@workspace/api-client-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PostEditorProps {
  initialData?: {
    id: number;
    slug: string;
    title: string;
    content: string;
    excerpt: string;
    authorName: string;
    published: boolean;
  };
  onSave: (data: PostInput) => void;
  isSaving: boolean;
  title: string;
}

export function PostEditor({ initialData, onSave, isSaving, title: pageTitle }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [authorName, setAuthorName] = useState(initialData?.authorName || "sysadmin");
  const [published, setPublished] = useState(initialData?.published || false);
  const [showSettings, setShowSettings] = useState(false);

  // Auto-resize textarea
  const contentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = "auto";
      contentRef.current.style.height = contentRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !authorName.trim()) return;

    onSave({
      title,
      content,
      excerpt,
      authorName,
      published,
    });
  };

  const handlePublishToggle = (checked: boolean) => {
    setPublished(checked);
    // Auto save on publish toggle if we already have content
    if (initialData && title.trim() && content.trim() && authorName.trim()) {
      onSave({
        title,
        content,
        excerpt,
        authorName,
        published: checked,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto w-full pb-32">
      <header className="flex items-center justify-between mb-8 border-b border-primary/30 pb-4">
        <div className="flex items-center gap-4">
          <Link href={initialData?.slug ? `/posts/${initialData.slug}` : "/"} className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-none uppercase">
            <ChevronLeft size={16} className="mr-1" />
            [ESC]
          </Link>
          <div className="text-sm font-bold text-primary uppercase flex items-center gap-2">
            <Terminal size={14} />
            {pageTitle}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden sm:block">
            STATUS: {isSaving ? "WRITING..." : initialData ? "SAVED" : "NEW"}
          </div>
          
          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-none border-primary/50 text-primary hover:bg-primary/20 hover:text-primary uppercase text-xs font-bold h-8">
                <Settings size={14} className="mr-2" />
                CONFIG
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-none border-primary bg-black p-4" align="end">
              <div className="space-y-4">
                <div className="border-b border-primary/30 pb-2 mb-2">
                  <h4 className="font-bold text-primary uppercase text-sm">&gt; FILE_METADATA</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="authorName" className="text-xs uppercase font-bold text-muted-foreground">USER_ID</Label>
                  <Input 
                    id="authorName" 
                    value={authorName} 
                    onChange={(e) => setAuthorName(e.target.value)} 
                    placeholder="root"
                    className="font-mono rounded-none border-primary/50 bg-transparent text-primary focus-visible:ring-primary focus-visible:ring-1 h-8"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt" className="text-xs uppercase font-bold text-muted-foreground">SUMMARY_BLOCK</Label>
                  <Textarea 
                    id="excerpt" 
                    value={excerpt} 
                    onChange={(e) => setExcerpt(e.target.value)} 
                    placeholder="Enter summary..."
                    className="resize-none font-mono text-xs rounded-none border-primary/50 bg-transparent text-primary focus-visible:ring-primary focus-visible:ring-1 min-h-[80px]"
                  />
                </div>
                
                <div className="pt-2 border-t border-primary/30 flex items-center justify-between">
                  <Label htmlFor="published" className="text-xs uppercase font-bold text-muted-foreground cursor-pointer">MAKE_PUBLIC</Label>
                  <Switch 
                    id="published" 
                    checked={published} 
                    onCheckedChange={handlePublishToggle}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button 
            type="submit" 
            disabled={isSaving || !title.trim() || !content.trim()} 
            className="rounded-none bg-primary text-black hover:bg-primary/80 uppercase text-xs font-bold h-8 px-6 disabled:opacity-50 disabled:bg-primary/20 disabled:text-primary"
          >
            {published ? "COMMIT" : "SAVE_TMP"}
          </Button>
        </div>
      </header>

      <div className="space-y-6 bg-black border border-primary/20 p-6 relative">
        <div className="absolute top-0 left-0 bg-primary/20 text-primary text-[10px] px-2 py-0.5 border-b border-r border-primary/20">
          BUFFER: main.txt
        </div>
        
        <div className="pt-4">
          <Textarea
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
            placeholder="[ENTER_TITLE]"
            className="w-full resize-none border-none p-0 bg-transparent text-2xl md:text-3xl font-bold uppercase text-primary placeholder:text-primary/30 focus-visible:ring-0 shadow-none overflow-hidden rounded-none"
            rows={1}
            required
            autoFocus
          />
        </div>
        
        <div className="h-px bg-primary/20 w-full mb-6"></div>

        <div>
          <Textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
            className="w-full resize-none border-none p-0 bg-transparent text-sm md:text-base text-primary/90 placeholder:text-primary/30 focus-visible:ring-0 shadow-none min-h-[50vh] rounded-none"
            required
          />
        </div>
      </div>
    </form>
  );
}
