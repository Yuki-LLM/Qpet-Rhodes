"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const navItems = [
  { label: "Home", href: "/", key: "home" },
  { label: "Sale", href: "/products?stock=In+Stock", key: "sale" },
  { label: "Dog", href: "/products?petType=Dog", key: "dog" },
  { label: "Cat", href: "/products?petType=Cat", key: "cat" },
  { label: "Others", href: "/products?category=Freeze-dried+treats", key: "others" },
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
  if (params.get("category") === "Freeze-dried treats") return "others";
  return "";
}

export function HeaderNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeKey = getActiveKey(pathname, searchParams);

  return (
    <nav className="container-shell flex min-h-14 items-center justify-center gap-3 overflow-x-auto text-sm font-medium text-ink md:gap-8">
      {navItems.map((item) => {
        const active = item.key === activeKey;

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`whitespace-nowrap rounded-full px-7 py-2.5 transition ${
              active ? "bg-qpet text-white shadow-sm" : "text-ink hover:bg-qpet-soft hover:text-qpet-dark"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
