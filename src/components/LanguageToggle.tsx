import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  return (
    <div className={cn("inline-flex items-center rounded-full border border-border bg-card p-0.5 shadow-card", className)}>
      <button
        onClick={() => setLang("en")}
        className={cn(
          "px-3 py-1 text-xs font-semibold rounded-full transition-base",
          lang === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLang("es")}
        className={cn(
          "px-3 py-1 text-xs font-semibold rounded-full transition-base",
          lang === "es" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
      >
        ES
      </button>
    </div>
  );
}
