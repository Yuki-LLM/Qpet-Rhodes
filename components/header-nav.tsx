"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";

const navItems = [
  { label: "Home", href: "/", key: "home" },
  { label: "Sale", href: "/products?stock=In+Stock", key: "sale" },
  {
    label: "Dog",
    href: "/products?petType=Dog",
    key: "dog",
    menu: [
      { label: "Dog Food", href: "/products?petType=Dog&category=Food" },
      { label: "Dog Treat", href: "/products?petType=Dog&category=Treats" },
      { label: "Collar, Harness & Leash", href: "/products?petType=Dog&category=Collar%2C+Harness+%26+Leash" }
    ]
  },
  {
    label: "Cat",
    href: "/products?petType=Cat",
    key: "cat",
    menu: [
      { label: "Cat Food", href: "/products?petType=Cat&category=Food" },
      { label: "Cat Treat", href: "/products?petType=Cat&category=Treats" },
      { label: "Cat Litter", href: "/products?petType=Cat&category=Cat+Litter+%26+Toilet" }
    ]
  },
  {
    label: "Others",
    href: "/products?category=Treats",
    key: "others",
    menu: [
      { label: "Accessories", href: "/products?category=Accessories" },
      { label: "Cleaning", href: "/products?category=Cleaning+%26+Odour+Control" },
      { label: "Dental Care", href: "/products?category=Dental+Care" },
      { label: "Grooming", href: "/products?category=Grooming+%26+Coat+Care" },
      { label: "Health Care", href: "/products?category=Health+Care" },
      { label: "Supplement", href: "/products?category=Supplements" },
      { label: "Toy", href: "/products?category=Toys" }
    ]
  },
  { label: "Brands", href: "/brands", key: "brands" }
];

function getActiveKey(pathname: string, params: URLSearchParams) {
  if (pathname === "/brands") return "brands";
  if (pathname === "/") return "home";
  if (pathname !== "/products") return "";
  if (params.get("brand")) return "brands";
  if (params.get("stock") === "In Stock") return "sale";
  if (params.get("petType") === "Dog") return "dog";
  if (params.get("petType") === "Cat") return "cat";
  if (params.get("category")) return "others";
  return "";
}

export function HeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeKey = getActiveKey(pathname, searchParams);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const activeMenu = navItems.find((item) => item.key === openMenuKey && "menu" in item);
  const mobileMenu = activeMenu && "menu" in activeMenu ? activeMenu.menu : null;

  return (
    <>
      <nav className="container-shell flex min-h-14 items-center justify-start gap-4 overflow-x-auto text-sm font-medium text-ink md:justify-center md:gap-12 md:overflow-visible">
        {navItems.map((item) => {
          const active = item.key === activeKey;
          const menu = "menu" in item ? item.menu : undefined;

          return (
            <div key={item.key} className="group relative">
              {menu ? (
                <button
                  type="button"
                  className={`inline-flex whitespace-nowrap rounded-full px-7 py-2.5 transition md:hidden ${
                    active || openMenuKey === item.key ? "bg-qpet text-white shadow-sm" : "text-ink hover:bg-qpet-soft hover:text-qpet-dark"
                  }`}
                  aria-expanded={openMenuKey === item.key}
                  onClick={() => setOpenMenuKey(openMenuKey === item.key ? null : item.key)}
                >
                  {item.label}
                </button>
              ) : null}
              <Link
                href={item.href}
                className={`whitespace-nowrap rounded-full px-7 py-2.5 transition ${
                  menu ? "hidden md:inline-flex" : "inline-flex"
                } ${active ? "bg-qpet text-white shadow-sm" : "text-ink hover:bg-qpet-soft hover:text-qpet-dark"}`}
                onClick={() => setOpenMenuKey(null)}
              >
                {item.label}
              </Link>
              {menu ? (
                <div className="pointer-events-none absolute left-1/2 top-full z-50 hidden w-52 -translate-x-1/2 pt-3 opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 md:block">
                  <div className="grid gap-1 rounded-2xl border border-line bg-white p-2 text-sm shadow-[0_16px_40px_rgba(16,24,50,0.12)]">
                    {menu.map((menuItem) => (
                      <Link
                        key={menuItem.href}
                        href={menuItem.href}
                        className="rounded-xl px-4 py-2.5 text-slate-600 transition hover:bg-qpet-soft hover:text-qpet-dark"
                      >
                        {menuItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
      {mobileMenu ? (
        <div className="border-t border-line bg-white px-5 py-3 md:hidden">
          <div className="container-shell grid grid-cols-2 gap-2">
            {mobileMenu.map((menuItem) => (
              <Link
                key={menuItem.href}
                href={menuItem.href}
                className="rounded-xl bg-qpet-soft px-4 py-2.5 text-center text-sm font-semibold text-qpet-dark"
                onClick={() => setOpenMenuKey(null)}
              >
                {menuItem.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
