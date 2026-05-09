import { RouterProvider, isRouteErrorResponse, useRouteError } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import { Analytics } from '@vercel/analytics/react';

function ErrorBoundary() {
  let error = useRouteError();
  console.error(error);
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <h1 className="text-4xl font-bold mb-4">Oups !</h1>
      <p>Une erreur est survenue dans l'affichage.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="app-container min-h-screen">
      <Toaster richColors position="top-right" />
      <RouterProvider router={router} />
      <Analytics />
    </div>
  );
}
