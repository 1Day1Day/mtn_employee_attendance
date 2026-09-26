"use client";

import { useState } from "react";
import Link from "next/link";

type NavLink = { href: string; label: string };

export default function Navbar({
  title,
  links,
  rightSlot,
}: {
  title: string;
  links: NavLink[];
  rightSlot?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-mtn-black text-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="font-bold text-mtn-yellow text-lg tracking-tight">
          {title}
        </Link>

        {/* Full link row on medium screens and up */}
        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-white/90 hover:text-mtn-yellow transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {rightSlot}
        </nav>

        {/* Hamburger button only on small screens; icons/links hide behind it */}
        <button
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-white/10"
        >
          {open ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Collapsed mobile menu */}
      {open && (
        <nav className="md:hidden border-t border-white/10 bg-mtn-charcoal px-4 py-3 flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="py-2 text-sm font-medium text-white/90 hover:text-mtn-yellow"
            >
              {link.label}
            </Link>
          ))}
          {rightSlot && <div className="pt-2 border-t border-white/10 mt-2">{rightSlot}</div>}
        </nav>
      )}
    </header>
  );
}
