import type { Metadata } from 'next';
import './tailwind.css';
import { ThemeProvider } from '../context/ThemeContext';

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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('talkstock-theme')||(window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light');if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased selection:bg-blue-100 selection:text-blue-900">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
