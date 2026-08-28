import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MM System - Maria Morena',
  description: 'Sistema de gestão e vitrine digital',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/index.css" />
      </head>
      <body className="bg-[#dcded0] text-[#2c3e1c] antialiased min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}