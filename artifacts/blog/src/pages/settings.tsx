import { useState, useEffect, useRef } from "react";
import { Layout } from "@/components/layout";
import { RequireSignedIn } from "@/components/require-signed-in";
import { useGetSiteSettings, useUpdateSiteSettings } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ObjectUploader } from "@workspace/object-storage-web";
import { useToast } from "@/hooks/use-toast";
import { Settings as SettingsIcon, Image as ImageIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Settings() {
  const { data: settings, isLoading } = useGetSiteSettings();
  const updateSettings = useUpdateSiteSettings();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const filePathsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    if (settings?.title) {
      setTitle(settings.title);
    }
  }, [settings?.title]);

  const handleSaveTitle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    updateSettings.mutate({ data: { title } }, {
      onSuccess: () => {
        toast({ title: "SUCCESS: TITLE_UPDATED", description: "Global configuration applied." });
      },
      onError: () => {
        toast({ title: "ERROR: UPDATE_FAILED", description: "Failed to apply configuration.", variant: "destructive" });
      }
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
      headers: {
        "Content-Type": file.type || "application/octet-stream"
      }
    };
  };

  const onUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const fileId = result.successful[0].id;
      const objectPath = filePathsRef.current[fileId];
      if (objectPath) {
        updateSettings.mutate({ data: { bannerImageUrl: objectPath } }, {
          onSuccess: () => {
            toast({ title: "SUCCESS: BANNER_UPDATED", description: "Cover visual applied to system." });
          },
          onError: () => {
            toast({ title: "ERROR: UPLOAD_FAILED", description: "Failed to link uploaded object.", variant: "destructive" });
          }
        });
      }
    }
  };

  const removeBanner = () => {
    updateSettings.mutate({ data: { bannerImageUrl: null } }, {
      onSuccess: () => {
        toast({ title: "SUCCESS: BANNER_PURGED", description: "Cover visual removed." });
      }
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto w-full pt-10 animate-pulse space-y-8">
          <Skeleton className="h-10 bg-primary/20 w-3/4 rounded-none" />
          <Skeleton className="h-64 bg-primary/20 w-full rounded-none" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <RequireSignedIn>
      <div className="max-w-2xl mx-auto w-full pb-16">
        <div className="mb-12 border-b border-primary/30 pb-6">
          <h1 className="text-3xl font-bold text-primary mb-2 uppercase flex items-center gap-3">
            <SettingsIcon className="text-primary" size={28} />
            ~/system_config
          </h1>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
            Modify global operational parameters.
          </p>
        </div>

        <div className="space-y-12">
          {/* Site Title */}
          <section className="border border-primary/20 bg-background/50 p-6 relative">
            <div className="absolute top-0 left-0 bg-primary/20 text-primary text-[10px] px-2 py-0.5 border-b border-r border-primary/20 uppercase font-bold">
              SYS_IDENTIFIER
            </div>
            <form onSubmit={handleSaveTitle} className="mt-4 flex flex-col gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-xs uppercase font-bold text-muted-foreground">DISPLAY_NAME</Label>
                <div className="flex gap-4">
                  <Input 
                    id="title" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="Journal"
                    className="font-mono rounded-none border-primary/50 bg-transparent text-primary focus-visible:ring-primary focus-visible:ring-1 h-10 uppercase font-bold"
                    required
                  />
                  <Button 
                    type="submit" 
                    disabled={updateSettings.isPending || title === settings?.title} 
                    className="rounded-none bg-primary text-black hover:bg-primary/80 uppercase text-xs font-bold h-10 px-6 disabled:opacity-50"
                  >
                    {updateSettings.isPending ? "APPLYING..." : "APPLY"}
                  </Button>
                </div>
              </div>
            </form>
          </section>

          {/* Site Banner */}
          <section className="border border-primary/20 bg-background/50 p-6 relative">
            <div className="absolute top-0 left-0 bg-primary/20 text-primary text-[10px] px-2 py-0.5 border-b border-r border-primary/20 uppercase font-bold flex items-center gap-2">
              <ImageIcon size={10} /> SYS_COVER_VISUAL
            </div>
            <div className="mt-4 space-y-6">
              {settings?.bannerImageUrl ? (
                <div className="space-y-4">
                  <div className="relative border border-primary/30 w-full overflow-hidden">
                    <img src={`/api/storage${settings.bannerImageUrl}`} alt="Site Banner" className="w-full h-auto object-cover max-h-64 filter grayscale" />
                    <Button 
                      type="button"
                      variant="outline" 
                      onClick={removeBanner}
                      disabled={updateSettings.isPending}
                      className="absolute top-2 right-2 bg-black border-destructive text-destructive hover:bg-destructive hover:text-black uppercase text-[10px] font-bold h-7 rounded-none"
                    >
                      PURGE_COVER
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Cover visual active. It will be displayed at root index.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground uppercase font-bold">No cover visual present. Upload an image to set a global banner.</p>
                  <div className="border border-primary/30 p-1 bg-black">
                    <ObjectUploader 
                      onGetUploadParameters={onGetUploadParameters}
                      onComplete={onUploadComplete}
                    >
                      <span className="flex items-center gap-2">
                        UPLOAD_BANNER
                      </span>
                    </ObjectUploader>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
      </RequireSignedIn>
    </Layout>
  );
}
