import './globals.css';
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Calyra Calendar',
  description: 'Calyra Calendar - Plan it. Track it. Graph it.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body>
        <MantineProvider>
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
