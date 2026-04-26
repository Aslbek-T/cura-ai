import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { CuraLogo } from "@/components/CuraLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { seedDemoData, DEMO_ACCOUNTS } from "@/lib/seedDemo";

export default function Login() {
  const { t, lang } = useLanguage();
  const { session, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  if (!authLoading && session) {
    return <Navigate to="/app" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("errInvalid"));
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(lang === "es" ? "¡Bienvenido!" : "Welcome!");
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    const res = await seedDemoData();
    setSeeding(false);
    if (res.ok) {
      toast.success(t("demoCreated"));
    } else {
      toast.error(res.message);
    }
  };

  const fillDemo = (which: keyof typeof DEMO_ACCOUNTS) => {
    setEmail(DEMO_ACCOUNTS[which].email);
    setPassword(DEMO_ACCOUNTS[which].password);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full gradient-soft blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full gradient-soft blur-3xl opacity-70" />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between p-4">
        <Button asChild variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Link>
        </Button>
        <LanguageToggle />
      </div>

      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Card className="border-border/60 p-7 shadow-elevated">
            <div className="mb-6 flex flex-col items-center text-center">
              <CuraLogo size="md" />
              <h1 className="mt-5 text-2xl font-bold tracking-tight">{t("welcomeBack")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{t("signInSubtitle")}</p>
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("password")}
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? t("hidePassword") : t("showPassword")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-base"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground hover:opacity-95 h-11" disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : t("signIn")}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs uppercase tracking-wide text-muted-foreground">{t("demoAccounts")}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <DemoButton label={t("demoPatient")} onClick={() => fillDemo("patient")} />
                <DemoButton label={t("demoDoctor")} onClick={() => fillDemo("doctor")} />
                <DemoButton label={t("demoDriver")} onClick={() => fillDemo("driver")} />
              </div>
              <Button onClick={handleSeed} variant="ghost" className="w-full gap-2 text-xs text-muted-foreground hover:text-foreground" disabled={seeding} size="sm">
                {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-accent" />}
                {t("loadDemo")}
              </Button>
            </div>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            HIPAA-conscious design · Built for rural Arizona communities
          </p>
        </div>
      </div>
    </div>
  );
}

function DemoButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-border bg-background px-2 py-2.5 text-xs font-medium text-foreground transition-base hover:border-primary hover:bg-primary-soft hover:text-primary"
    >
      {label}
    </button>
  );
}
