import "./globals.css";

export const metadata = {
  title: "GCET Command Center",
  description: "Real-time campus sustainability",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

