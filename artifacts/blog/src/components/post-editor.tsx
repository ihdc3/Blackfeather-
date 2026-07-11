import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Terminal, Settings, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";
import type { PostInput, PostStatus, EncryptionLevel } from "@workspace/api-client-react";
import { ObjectUploader } from "@workspace/object-storage-web";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PostEditorProps {
  initialData?: {
    id?: number;
    slug?: string;
    title: string;
    content: string;
    excerpt: string;
    authorName: string;
    status: PostStatus;
    encryptionLevel: EncryptionLevel;
    coverImageUrl: string | null;
  };
  onSave: (data: PostInput) => void;
  isSaving: boolean;
  title: string;
}

const STATUS_OPTIONS: PostStatus[] = ["draft", "published", "archived"];
const ENCRYPTION_OPTIONS: EncryptionLevel[] = ["plaintext", "encrypted", "classified"];

export function PostEditor({ initialData, onSave, isSaving, title: pageTitle }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [authorName, setAuthorName] = useState(initialData?.authorName || "sysadmin");
  const [status, setStatus] = useState<PostStatus>(initialData?.status || "draft");
  const [encryptionLevel, setEncryptionLevel] = useState<EncryptionLevel>(initialData?.encryptionLevel || "plaintext");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialData?.coverImageUrl || null);
  
  const [showSettings, setShowSettings] = useState(false);
  const filePathsRef = useRef<Record<string, string>>({});
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
      status,
      encryptionLevel,
      coverImageUrl,
    });
  };

  const onGetUploadParameters = async (file: any) => {
    const res = await fetch("/api/storage/uploads/request-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: file.name,
        size: file.size,
        contentType: file.type || "application/octet-stream",
      })
    });
    if (!res.ok) throw new Error("Failed to get upload URL");
    const data = await res.json();
    filePathsRef.current[file.id] = data.objectPath;
    return {
      method: "PUT" as const,
      url: data.uploadURL,
      headers: { "Content-Type": file.type || "application/octet-stream" }
    };
  };

  const onUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const fileId = result.successful[0].id;
      const objectPath = filePathsRef.current[fileId];
      if (objectPath) {
        setCoverImageUrl(objectPath);
      }
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
            STATE: {isSaving ? "WRITING..." : initialData ? "SAVED" : "NEW"}
          </div>
          
          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-none border-primary/50 text-primary hover:bg-primary/20 hover:text-primary uppercase text-xs font-bold h-8">
                <Settings size={14} className="mr-2" />
                METADATA
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 rounded-none border-primary bg-black p-4" align="end">
              <div className="space-y-5">
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
                  <Label className="text-xs uppercase font-bold text-muted-foreground">STATUS</Label>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map(opt => (
                      <Button
                        key={opt}
                        type="button"
                        variant={status === opt ? "default" : "outline"}
                        onClick={() => setStatus(opt)}
                        className={`h-8 text-[10px] font-bold uppercase rounded-none flex-1 px-0 ${status === opt ? 'bg-primary text-black' : 'border-primary/50 text-primary hover:bg-primary/20'}`}
                      >
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">SECURITY_LEVEL</Label>
                  <div className="flex gap-2">
                    {ENCRYPTION_OPTIONS.map(opt => (
                      <Button
                        key={opt}
                        type="button"
                        variant={encryptionLevel === opt ? "default" : "outline"}
                        onClick={() => setEncryptionLevel(opt)}
                        className={`h-8 text-[10px] font-bold uppercase rounded-none flex-1 px-0 ${
                          encryptionLevel === opt 
                            ? opt === 'classified' ? 'bg-destructive text-black' : opt === 'encrypted' ? 'bg-amber-500 text-black' : 'bg-primary text-black' 
                            : opt === 'classified' ? 'border-destructive/50 text-destructive hover:bg-destructive/20' : opt === 'encrypted' ? 'border-amber-500/50 text-amber-500 hover:bg-amber-500/20' : 'border-primary/50 text-primary hover:bg-primary/20'
                        }`}
                      >
                        {opt.substring(0, 3)}
                      </Button>
                    ))}
                  </div>
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
              </div>
            </PopoverContent>
          </Popover>

          <Button 
            type="submit" 
            disabled={isSaving || !title.trim() || !content.trim()} 
            className="rounded-none bg-primary text-black hover:bg-primary/80 uppercase text-xs font-bold h-8 px-6 disabled:opacity-50 disabled:bg-primary/20 disabled:text-primary"
          >
            {status === "published" ? "COMMIT" : "SAVE_TMP"}
          </Button>
        </div>
      </header>

      <div className="space-y-6 bg-black border border-primary/20 p-6 relative">
        <div className="absolute top-0 left-0 bg-primary/20 text-primary text-[10px] px-2 py-0.5 border-b border-r border-primary/20">
          BUFFER: main.txt
        </div>
        
        <div className="pt-4 space-y-6">
          {/* Cover Image Upload Area */}
          <div className="w-full">
            {coverImageUrl ? (
              <div className="relative border border-primary/30 w-full overflow-hidden">
                <img src={`/api/storage${coverImageUrl}`} alt="Cover" className="w-full h-auto object-cover max-h-64 filter grayscale" />
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setCoverImageUrl(null)}
                  className="absolute top-2 right-2 bg-black border-destructive text-destructive hover:bg-destructive hover:text-black uppercase text-[10px] font-bold h-7 rounded-none z-10"
                >
                  PURGE_IMAGE
                </Button>
              </div>
            ) : (
              <div className="border border-primary/30 border-dashed p-4 bg-primary/5">
                <div className="text-xs text-primary/50 font-bold uppercase mb-2 flex items-center gap-2">
                  <ImageIcon size={14} /> ATTACH_COVER_IMAGE
                </div>
                <div className="scale-90 origin-top-left w-[111%]">
                  <ObjectUploader 
                    onGetUploadParameters={onGetUploadParameters}
                    onComplete={onUploadComplete}
                  >
                    <span className="flex items-center gap-2">
                      <ImageIcon size={14} /> UPLOAD_FILE
                    </span>
                  </ObjectUploader>
                </div>
              </div>
            )}
          </div>

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
