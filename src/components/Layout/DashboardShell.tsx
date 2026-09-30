import { useState, type ReactNode } from "react";
import { useHideGlobalHeader } from "./ShellContext";
import DashboardTopBar from "./DashboardTopBar";

export default function DashboardShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  useHideGlobalHeader();

  // Open by default on wide screens, closed by default on phones/tablets.
  const [open, setOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 1024
  );

  return (
    <div className="flex">
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="bg-white overflow-y-auto flex-shrink-0 max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40 lg:sticky lg:top-0 lg:h-screen">
            {sidebar}
          </div>
        </>
      )}
      <div className="flex-1 min-w-0">
        <DashboardTopBar onMenuClick={() => setOpen((v) => !v)} />
        {children}
      </div>
    </div>
  );
}