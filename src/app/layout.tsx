import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/figtree';
import '@fontsource/barlow-semi-condensed/500.css';
import '@fontsource/barlow-semi-condensed/600.css';
import '@fontsource/barlow-semi-condensed/700.css';
import '@fontsource/barlow-semi-condensed/800.css';
import './globals.css';
import { Providers } from '@/components/providers/providers';

export const metadata: Metadata = {
  title: 'YANA MOTORS OS',
  description: 'Automate the Customer Lifecycle — YANA MOTORS demo CRM (Phase 1, demo data only).',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
