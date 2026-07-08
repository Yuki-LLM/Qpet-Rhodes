import Link from "next/link";
import { Boxes, ClipboardList, HeartPulse, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/wishlist", label: "Wishlist", icon: HeartPulse }
];

export function AdminNav() {
  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link key={link.href} href={link.href} className="btn-secondary">
            <Icon size={17} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
