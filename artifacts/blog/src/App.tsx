import { useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ClerkProvider, SignIn, SignUp, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadesOfPurple } from '@clerk/themes';

import Home from '@/pages/home';
import Drafts from '@/pages/drafts';
import PostView from '@/pages/post';
import NewPost from '@/pages/new';
import EditPost from '@/pages/edit';
import SettingsPage from '@/pages/settings';

const queryClient = new QueryClient();

// REQUIRED — copy verbatim. Resolves the key from window.location.hostname so the
// same build serves multiple Clerk custom domains. Do not inline the env var, leave
// publishableKey undefined, or replace publishableKeyFromHost with anything else.
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

// REQUIRED — copy verbatim. Empty in dev (Clerk hits dev FAPI directly), auto-set
// in prod. Do NOT gate on import.meta.env.PROD / NODE_ENV — the empty dev value
// is intentional, and any branching breaks the prod proxy.
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

// Clerk passes full paths to routerPush/routerReplace, but wouter's
// setLocation prepends the base — strip it to avoid doubling.
function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadesOfPurple,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: 'hsl(135 100% 50%)',
    colorForeground: 'hsl(135 100% 50%)',
    colorMutedForeground: 'hsl(135 100% 35%)',
    colorDanger: 'hsl(0 100% 50%)',
    colorBackground: 'hsl(0 0% 3%)',
    colorInput: 'hsl(0 0% 6%)',
    colorInputForeground: 'hsl(135 100% 50%)',
    colorNeutral: 'hsl(135 100% 15%)',
    fontFamily: "'Fira Code', monospace",
    borderRadius: '0px',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-[hsl(0_0%_3%)] border border-primary/30 w-[440px] max-w-full overflow-hidden',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'text-primary uppercase font-bold tracking-tight',
    headerSubtitle: 'text-muted-foreground',
    socialButtonsBlockButtonText: 'text-primary uppercase text-sm',
    formFieldLabel: 'text-primary uppercase text-xs',
    footerActionLink: 'text-primary hover:text-primary/80 font-bold',
    footerActionText: 'text-muted-foreground',
    dividerText: 'text-muted-foreground uppercase text-xs',
    identityPreviewEditButton: 'text-primary',
    formFieldSuccessText: 'text-primary',
    alertText: 'text-destructive',
    logoBox: 'flex justify-center py-2',
    logoImage: 'h-10 w-10',
    socialButtonsBlockButton: 'border border-primary/30 hover:bg-primary/10',
    formButtonPrimary: 'bg-primary text-black uppercase font-bold hover:bg-primary/80 !shadow-none',
    formFieldInput: 'bg-[hsl(0_0%_6%)] border border-primary/30 text-primary',
    footerAction: 'border-t border-primary/20 pt-4',
    dividerLine: 'bg-primary/20',
    alert: 'border border-destructive/40 bg-destructive/10',
    otpCodeFieldInput: 'bg-[hsl(0_0%_6%)] border border-primary/30 text-primary',
    formFieldRow: '',
    main: 'gap-4',
  },
};

function SignInPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </div>
  );
}

// Helps the webview stay up-to-date when the signed-in user changes by invalidating the QueryClient cache.
function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, qc]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/drafts" component={Drafts} />
      <Route path="/new" component={NewPost} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/posts/:slug/edit" component={EditPost} />
      <Route path="/posts/:slug" component={PostView} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: {
          start: {
            title: 'Access Terminal',
            subtitle: 'Authenticate to write and manage records',
          },
        },
        signUp: {
          start: {
            title: 'Create Access',
            subtitle: 'Register a new terminal account',
          },
        },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <ClerkQueryClientCacheInvalidator />
      <Router />
    </ClerkProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkProviderWithRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
