import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ToastProvider from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Fireflies Clone — Meeting Notes & Transcripts",
  description: "A functional clone of the Fireflies.ai meeting assistant workspace.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ToastProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="min-w-0 flex-1">{children}</main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
