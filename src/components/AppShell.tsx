import { ReactNode } from "react";
import { CuraLogo } from "./CuraLogo";
import { LanguageToggle } from "./LanguageToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LogOut } from "lucide-react";

export function AppShell({ title, children }: { title?: string; children: ReactNode }) {
  const { signOut, profile } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
          <CuraLogo size="md" />
          {title && (
            <h1 className="hidden text-sm font-semibold text-muted-foreground md:block">{title}</h1>
          )}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            {profile && (
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">{t("signOut")}</span>
              </Button>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-6 md:py-10">{children}</main>
    </div>
  );
}
