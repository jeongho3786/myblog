"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { HamburgerIcon, CloseIcon } from "@/components/ui/icons";

const SidebarShell = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAsideClick = (event: MouseEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("a")) setIsOpen(false);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-3 border-b border-border bg-background px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "메뉴 닫기" : "메뉴 열기"}
          className="cursor-pointer text-foreground"
        >
          {isOpen ? (
            <CloseIcon className="h-5 w-5" />
          ) : (
            <HamburgerIcon className="h-5 w-5" />
          )}
        </button>

        <span className="text-base font-bold -tracking-tight text-foreground">
          jeong-ho blog
        </span>
      </header>

      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        onClick={handleAsideClick}
        className={`fixed top-14 bottom-0 left-0 z-40 w-65 shrink-0 overflow-y-auto border-r border-border bg-background px-7 py-12 transition-transform duration-200 lg:sticky lg:top-0 lg:bottom-auto lg:left-auto lg:h-screen lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {children}
      </aside>
    </>
  );
};

export default SidebarShell;
