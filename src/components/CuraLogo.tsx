import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export function CuraLogo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: "h-5 w-5", text: "text-lg" },
    md: { icon: "h-6 w-6", text: "text-xl" },
    lg: { icon: "h-9 w-9", text: "text-3xl" },
  };
  return (
    <div className={cn("inline-flex items-center gap-2 font-bold tracking-tight text-primary", className)}>
      <span className="relative inline-flex items-center justify-center rounded-lg gradient-primary p-1.5">
        <Heart className={cn("text-primary-foreground", sizes[size].icon)} fill="currentColor" />
      </span>
      <span className={sizes[size].text}>Cura AI</span>
    </div>
  );
}
