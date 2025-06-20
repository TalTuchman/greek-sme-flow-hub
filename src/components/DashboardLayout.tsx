
import { PropsWithChildren } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNav } from "./MobileNav";

const DashboardNav = () => {
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
    <nav className="hidden md:flex items-center gap-4 text-sm lg:gap-6">
      {links.map((link) => (
        <Link
          key={link.href}
          to={link.href}
          className={cn(
            "transition-colors hover:text-foreground",
            location.pathname === link.href
              ? "text-foreground font-semibold"
              : "text-muted-foreground"
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export const DashboardLayout = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate("/auth");
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <MobileNav />
        <DashboardNav />
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <LanguageSwitcher />
          <Button onClick={handleLogout} variant="outline" size="sm">
            {t("dashboard.logout")}
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
    </div>
  );
};
