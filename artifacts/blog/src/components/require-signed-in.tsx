import { Link } from "wouter";
import { Show } from "@clerk/react";
import { Lock } from "lucide-react";

/**
 * Gates write-only pages (new post, edit post, settings) behind sign-in.
 * The backend independently enforces that only the configured admin account
 * can actually perform writes -- this is a UX convenience, not the security
 * boundary.
 */
export function RequireSignedIn({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Show when="signed-in">{children}</Show>
      <Show when="signed-out">
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
      </Show>
    </>
  );
}
