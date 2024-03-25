import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

// css?url supported in vite 5.x onwards
import tailwindCSS from './css/index.css?url';
import hljsCSS from './css/google.css?url';
import { LinksFunction } from "@remix-run/node";


//export const links: LinksFunction = () => [{ rel: 'stylesheet', href: tailwindCSS }];

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: tailwindCSS },
    {rel: 'stylesheet',href: hljsCSS},
  ];
};

// TailwindCSS - vite overrides remix's approach to css (brcoktho 02/05/24 on Discord)
// instead do a side effect import.
//import './css/index.css';


export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet></Outlet>;
}

export function HydrateFallback() {
  return <p className="p-10 text-blue-700 text-2xl"><span className="loading loading spinner text-primary">{" "}</span>Loading...</p>;
}
