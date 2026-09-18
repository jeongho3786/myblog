import type { Metadata } from "next";
import localFont from "next/font/local";
import Sidebar from "@/components/layout/sidebar";
import SidebarShell from "@/components/layout/sidebar-shell";
import "./globals.css";

const d2coding = localFont({
  src: [
    {
      path: "./fonts/D2Coding-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/D2Coding-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-d2coding",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jeong-ho blog",
  description: "Jeong-ho blog",
};

const RootLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <html
      lang="ko"
      className={`${d2coding.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <div className="flex min-h-screen bg-background">
          <SidebarShell>
            <Sidebar />
          </SidebarShell>

          <div className="flex min-w-0 flex-1 pt-14 lg:pt-0">{children}</div>
        </div>
      </body>
    </html>
  )
}

export default RootLayout;
