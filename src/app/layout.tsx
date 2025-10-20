import './globals.css';
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Calyra Calendar',
  description: `Calyra Calendar. This is a tool for people who think in data, not dates. Calyra combines a calendar and spreadsheet so you can log your progress, visualize trends, and turn your data into insight.`,
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
