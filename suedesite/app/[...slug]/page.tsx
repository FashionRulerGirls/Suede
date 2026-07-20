import App from '@/components/App';

/* The shopper site is a single-page app that now uses real URL paths
   (/lookbook, /brand/<slug>, /review/<id>, …). This catch-all serves that same
   app for any non-root path so deep links load and refresh works. More
   specific routes (/admin, /portal, /api, /auth) take precedence over this. */
export const dynamic = 'force-dynamic';

export default function CatchAllPage() {
  return <App />;
}
