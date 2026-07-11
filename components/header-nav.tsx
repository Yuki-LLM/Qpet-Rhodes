"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const navItems = [
  { label: "Home", href: "/", key: "home" },
  { label: "Sale", href: "/products?stock=In+Stock", key: "sale" },
  {
    label: "Dog",
    href: "/products?petType=Dog",
    key: "dog",
    menu: [
      { label: "Dog Food", href: "/products?petType=Dog&category=Food" },
      { label: "Dog Treats", href: "/products?petType=Dog&category=Treats" },
      { label: "Dental Care", href: "/products?petType=Dog&category=Dental+Care" },
      { label: "Grooming", href: "/products?petType=Dog&category=Grooming+%26+Coat+Care" },
      { label: "Health Care", href: "/products?petType=Dog&category=Health+Care" }
    ]
  },
  {
    label: "Cat",
    href: "/products?petType=Cat",
    key: "cat",
    menu: [
      { label: "Cat Food", href: "/products?petType=Cat&category=Food" },
      { label: "Cat Treats", href: "/products?petType=Cat&category=Treats" },
      { label: "Cat Litter", href: "/products?petType=Cat&category=Cat+Litter+%26+Toilet" },
      { label: "Dental Care", href: "/products?petType=Cat&category=Dental+Care" },
      { label: "Supplements", href: "/products?petType=Cat&category=Supplements" }
    ]
  },
  {
    label: "Others",
    href: "/products?category=Treats",
    key: "others",
    menu: [
      { label: "Treats", href: "/products?category=Treats" },
      { label: "Grooming", href: "/products?category=Grooming+%26+Coat+Care" },
      { label: "Dental Care", href: "/products?category=Dental+Care" },
      { label: "Supplements", href: "/products?category=Supplements" },
      { label: "Cleaning", href: "/products?category=Cleaning+%26+Odour+Control" }
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

  return (
    <nav className="container-shell flex min-h-14 items-center justify-start gap-4 overflow-x-auto text-sm font-medium text-ink md:justify-center md:gap-12 md:overflow-visible">
      {navItems.map((item) => {
        const active = item.key === activeKey;
        const menu = "menu" in item ? item.menu : undefined;

        return (
          <div key={item.key} className="group relative">
            <Link
              href={item.href}
              className={`inline-flex whitespace-nowrap rounded-full px-7 py-2.5 transition ${
                active ? "bg-qpet text-white shadow-sm" : "text-ink hover:bg-qpet-soft hover:text-qpet-dark"
              }`}
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
  );
}
