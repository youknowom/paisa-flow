import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { ConvexClientProvider } from "./providers";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "PaisaFlow — Track Spending. Split Trips. Settle Smarter.",
  description:
    "Premium personal finance and group trip expense app built for India. Track daily spending, split trip expenses with friends, and settle debts intelligently.",
  keywords: [
    "expense tracker",
    "trip splitter",
    "splitwise alternative",
    "personal finance India",
    "group expenses",
    "debt simplification",
  ],
  authors: [{ name: "PaisaFlow" }],
  openGraph: {
    title: "PaisaFlow — Track Spending. Split Trips. Settle Smarter.",
    description:
      "Premium personal finance and group trip expense app built for India.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${GeistMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-background text-text-primary"
        suppressHydrationWarning
      >
        <ConvexClientProvider>
          {children}
          <Analytics />
          <Toaster
            theme="light"
            position="bottom-center"
            className="md:!bottom-6 md:!right-6 md:!left-auto md:!translate-x-0"
            toastOptions={{
              classNames: {
                toast:
                  "rounded-xl border border-border-subtle shadow-lg font-body text-sm",
                success:
                  "!bg-white !text-text-primary !border-l-4 !border-l-accent",
                error: "!bg-white !text-text-primary !border-l-4 !border-l-red",
                warning:
                  "!bg-white !text-text-primary !border-l-4 !border-l-amber",
              },
            }}
            closeButton
            duration={4000}
          />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
