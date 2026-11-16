import type { Metadata } from 'next';
import './globals.css';
import './tailwind.css';

export const metadata: Metadata = {
  title: 'TalkStock - Smart Inventory, Powered by Voice',
  description: 'Manage your business inventory with the power of voice. Colloquial Hinglish & Multimodal AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-800 antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
