import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';
import { Layout } from '@/components/layout';

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center w-full min-h-[50vh]">
        <div className="border border-primary/30 bg-primary/5 p-8 relative max-w-2xl w-full text-center">
          <div className="absolute top-0 left-0 bg-primary text-black text-[10px] px-2 py-0.5 font-bold uppercase">
            ERROR: 404
          </div>
          
          <div className="flex justify-center mb-6">
            <AlertCircle className="h-16 w-16 text-primary" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4 uppercase">
            FATAL_ERROR: PAGE_NOT_FOUND
          </h1>

          <p className="text-primary/70 mb-8 font-mono text-sm uppercase">
            The requested path could not be resolved in the routing table.
            Check your syntax and try again.
          </p>
          
          <Link href="/" className="inline-block bg-primary text-black px-6 py-2 font-bold hover:bg-primary/80 transition-none uppercase">
            &gt; RETURN_TO_ROOT
          </Link>
        </div>
      </div>
    </Layout>
  );
}
