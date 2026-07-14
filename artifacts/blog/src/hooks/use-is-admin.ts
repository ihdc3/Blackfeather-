import { useUser } from "@clerk/react";
import { useGetAuthMe, getGetAuthMeQueryKey } from "@workspace/api-client-react";

/**
 * Whether the current visitor is the single owner/admin account. This is
 * the real gate for owner-only UI (write, edit, delete, settings, drafts) --
 * unlike a generic "signed in" check, it excludes any other Clerk account
 * that happens to sign up, since sign-up is not invite-only.
 *
 * The backend independently enforces this on every write endpoint -- this
 * hook only controls what's shown in the UI.
 */
export function useIsAdmin() {
  const { isSignedIn, isLoaded: isUserLoaded } = useUser();
  const { data, isLoading: isAuthMeLoading } = useGetAuthMe({
    query: { enabled: !!isSignedIn, queryKey: getGetAuthMeQueryKey() },
  });

  return {
    isAdmin: !!isSignedIn && !!data?.isAdmin,
    isLoading: !isUserLoaded || (!!isSignedIn && isAuthMeLoading),
  };
}
