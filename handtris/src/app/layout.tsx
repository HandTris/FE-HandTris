import { Nanum_Gothic_Coding } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import ReactQueryProviders from "@/hook/useReactQuery";
import React from "react";
import { MusicProvider } from "@/components/MusicProvider";
import { Toaster } from "@/components/ui/toaster";
import { BackNavigationBlocker } from "@/components/BackNavigationBlocker";
import dynamic from "next/dynamic";
const HeaderComponent = dynamic(() => import("@/components/Header"));
const nanum = Nanum_Gothic_Coding({
  weight: "700",
  subsets: ["latin"],
});

export const metadata = {
  title: "HANDTRIS",
  description: "Experience HANDTRIS, Tetris with hand motion capture",
  icons: {
    icon: "/image/logos.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={nanum.className}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      <body className="select-none">
        <div className="mx-auto flex h-[100vh] w-full max-w-[1400px] flex-col">
          <ReactQueryProviders>
            <MusicProvider>
              <HeaderComponent />
              <main className="grow flex flex-col flex-1 overflow-hidden">
                <BackNavigationBlocker />
                {children}
                <Toaster />
              </main>
              <Footer />
            </MusicProvider>
          </ReactQueryProviders>
        </div>
      </body>
    </html>
  );
}
