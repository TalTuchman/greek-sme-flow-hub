
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";

export const MobileNav = () => {
  const [open, setOpen] = React.useState(false);
  const location = useLocation();
  const { t } = useTranslation();
  
  const links = [
    { href: "/", label: t("dashboard.nav_dashboard") },
    { href: "/bookings", label: t("dashboard.nav_bookings") },
    { href: "/campaigns", label: t("dashboard.nav_campaigns") },
    { href: "/customers", label: t("dashboard.nav_customers") },
    { href: "/services", label: t("dashboard.nav_services") },
    { href: "/staff", label: t("dashboard.nav_staff") },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center py-2 px-3 rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                location.pathname === link.href
                  ? "bg-accent text-accent-foreground font-semibold"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
};
