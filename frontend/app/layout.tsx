import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GOTA AERO FLOW TIA',
  description: 'MVP car counting web app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
