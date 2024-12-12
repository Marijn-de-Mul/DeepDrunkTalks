import '@mantine/core/styles.css';
import 'app/assets/css/styles.css';  

import { MantineProvider } from '@mantine/core';
import { Links, Meta, Outlet, ScrollRestoration, Scripts } from '@remix-run/react';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-title" content="MovieList" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/public/icon-192x192.png" />
        <Meta />
        <Links />
      </head>
      <body>
        <MantineProvider>
          {children}
        </MantineProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
