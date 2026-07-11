import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';

import Home from '@/pages/home';
import Drafts from '@/pages/drafts';
import PostView from '@/pages/post';
import NewPost from '@/pages/new';
import EditPost from '@/pages/edit';
import SettingsPage from '@/pages/settings';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/drafts" component={Drafts} />
      <Route path="/new" component={NewPost} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/posts/:slug/edit" component={EditPost} />
      <Route path="/posts/:slug" component={PostView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
