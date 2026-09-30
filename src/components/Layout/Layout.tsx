import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ShellProvider, useShell } from "./ShellContext";

function LayoutFrame({ children }: { children: ReactNode }) {
  const { hideHeader } = useShell();
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!hideHeader && <Header />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <ShellProvider>
      <LayoutFrame>{children}</LayoutFrame>
    </ShellProvider>
  );
}

export default Layout;