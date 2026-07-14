import { Link } from "wouter";
import { Lock } from "lucide-react";
import { useIsAdmin } from "@/hooks/use-is-admin";

/**
 * Gates write-only pages (new post, edit post, settings, drafts) behind the
 * single admin/owner account -- not just "signed in", since sign-up is not
 * invite-only and anyone could create a Clerk account. The backend
 * independently enforces the same rule on every write endpoint -- this is a
 * UX convenience, not the security boundary.
 */
export function RequireSignedIn({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useIsAdmin();

  if (isLoading) return null;

  if (isAdmin) return <>{children}</>;

  return (
    <div className="py-20 text-center flex flex-col items-center border border-primary/30 bg-primary/5 p-8 relative max-w-2xl mx-auto">
      <div className="absolute top-0 left-0 bg-primary text-black text-[10px] px-2 py-0.5 font-bold uppercase">
        ACCESS_DENIED
      </div>
      <Lock className="text-primary mb-4" size={32} />
      <h1 className="text-2xl font-bold text-primary mb-4 uppercase">AUTHENTICATION_REQUIRED</h1>
      <p className="text-primary/70 font-mono text-sm uppercase mb-6">
        This terminal is owner-only. Sign in with an authorized account to continue.
      </p>
      <Link
        href="/sign-in"
        className="flex items-center gap-2 text-sm font-bold bg-primary text-black px-4 py-1.5 uppercase hover:bg-primary/80 transition-none active:scale-95"
      >
        SIGN_IN
      </Link>
    </div>
  );
}
