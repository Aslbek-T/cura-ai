import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CuraLogo } from "@/components/CuraLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Sparkles, Car, MessageSquare, Globe, Hospital, Bot, Smartphone,
  CheckCircle2, ArrowRight, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Landing() {
  const { t } = useLanguage();

  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/85 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <CuraLogo variant="inline" size="md" />
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button asChild variant="outline" size="sm" className="border-primary/40 text-primary hover:bg-primary-soft hover:text-primary">
              <Link to="/login">{t("nav_signIn")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" aria-hidden />
        <div className="absolute inset-0 pattern-grid opacity-60" aria-hidden />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" aria-hidden />

        <div className="container relative mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-20 text-center">
          <Badge className="mb-6 gap-1.5 rounded-full border-0 bg-accent-soft px-4 py-1.5 text-xs font-semibold text-accent hover:bg-accent-soft animate-fade-in-up">
            <Sparkles className="h-3.5 w-3.5" />
            {t("hero_badge")}
          </Badge>

          <h1 className="max-w-4xl text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up">
            {t("hero_headline")}
          </h1>

          <p className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl animate-fade-in-up">
            {t("hero_subheadline")}
          </p>

          <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center animate-fade-in-up">
            <Button
              size="lg"
              onClick={scrollToFeatures}
              className="gradient-primary text-primary-foreground shadow-floating hover:opacity-95 gap-2 px-7 h-12 text-base"
            >
              {t("hero_cta_primary")}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary-soft hover:text-primary px-7 h-12 text-base"
            >
              <Link to="/login">{t("hero_cta_secondary")}</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5"><Hospital className="h-4 w-4 text-primary" /> {t("hero_trust1")}</span>
            <span className="inline-flex items-center gap-1.5"><Bot className="h-4 w-4 text-accent" /> {t("hero_trust2")}</span>
            <span className="inline-flex items-center gap-1.5"><Smartphone className="h-4 w-4 text-orange" /> {t("hero_trust3")}</span>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="bg-dark-surface py-20 text-dark-surface-foreground md:py-28">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-5xl">
            {t("prob_title")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard num={t("prob_stat1_num")} desc={t("prob_stat1_desc")} accentClass="text-orange" />
            <StatCard num={t("prob_stat2_num")} desc={t("prob_stat2_desc")} accentClass="text-accent" />
            <StatCard num={t("prob_stat3_num")} desc={t("prob_stat3_desc")} accentClass="text-orange" />
          </div>
          <p className="mx-auto mt-12 max-w-3xl text-center text-base leading-relaxed text-white/70 md:text-lg">
            {t("prob_paragraph")}
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-background py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl">{t("feat_title")}</h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">{t("feat_subtitle")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FeatureCard
              icon={<Brain className="h-6 w-6" />}
              iconBg="bg-primary text-primary-foreground"
              borderClass="border-l-primary"
              title={t("feat1_title")}
              desc={t("feat1_desc")}
              tags={["Personalized Advice", "Pre-Appointment Briefs", "Patient Summaries"]}
            />
            <FeatureCard
              icon={<Car className="h-6 w-6" />}
              iconBg="bg-accent text-accent-foreground"
              borderClass="border-l-accent"
              title={t("feat2_title")}
              desc={t("feat2_desc")}
              tags={["SMS Booking", "Credit Rewards", "Leaderboard"]}
            />
            <FeatureCard
              icon={<MessageSquare className="h-6 w-6" />}
              iconBg="bg-orange text-orange-foreground"
              borderClass="border-l-orange"
              title={t("feat3_title")}
              desc={t("feat3_desc")}
              tags={["Any Phone", "Twilio Powered", "Bilingual"]}
            />
            <FeatureCard
              icon={<Globe className="h-6 w-6" />}
              iconBg="bg-primary text-primary-foreground"
              borderClass="border-l-primary"
              title={t("feat4_title")}
              desc={t("feat4_desc")}
              tags={["Auto-Detection", "Culturally Adapted", "Inclusive"]}
            />
          </div>
        </div>
      </section>

      {/* USER JOURNEY */}
      <section className="bg-secondary/40 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t("journey_title")}</h2>
            <p className="mt-3 text-base text-muted-foreground md:text-lg">{t("journey_subtitle")}</p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="hidden md:block absolute left-0 right-0 top-7 mx-auto h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <div className="grid gap-6 md:grid-cols-5">
              <JourneyStep n={1} emoji="📱" text={t("step1")} />
              <JourneyStep n={2} emoji="🤖" text={t("step2")} />
              <JourneyStep n={3} emoji="👩‍⚕️" text={t("step3")} />
              <JourneyStep n={4} emoji="🚗" text={t("step4")} />
              <JourneyStep n={5} emoji="⭐" text={t("step5")} />
            </div>
          </div>
        </div>
      </section>

      {/* INTEGRATION */}
      <section className="bg-muted/40 py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">{t("integ_title")}</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{t("integ_desc")}</p>
          </div>

          <Card className="mx-auto mt-10 max-w-2xl p-7 shadow-elevated">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Banner Health Portal</p>
                <p className="mt-1 text-lg font-bold text-foreground">healthtrioconnect.com</p>
              </div>
              <Badge className="gap-1.5 rounded-full border-0 bg-success/15 px-3 py-1.5 text-sm font-semibold text-success hover:bg-success/15">
                <CheckCircle2 className="h-4 w-4" />
                {t("integ_ready")}
              </Badge>
            </div>
          </Card>

          <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-3">
            {[t("integ_pt1"), t("integ_pt2"), t("integ_pt3")].map((pt) => (
              <li key={pt} className="flex items-start gap-2 rounded-xl bg-card p-4 shadow-card">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                <span className="text-sm font-medium">{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-dark-surface py-12 text-dark-surface-foreground">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 md:items-start">
            <div>
              <CuraLogo variant="inline" size="md" className="text-white" />
              <p className="mt-3 text-sm text-white/60">{t("footer_track")}</p>
            </div>
            <div className="text-center text-sm text-white/70 md:text-base">
              {t("footer_team")}
            </div>
            <div className="text-sm text-white/60 md:text-right">
              {t("footer_powered")}
            </div>
          </div>
          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
            {t("footer_franke")}
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ num, desc, accentClass }: { num: string; desc: string; accentClass: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm transition-base hover:border-white/20 hover:bg-white/[0.07]">
      <p className={cn("text-4xl font-bold tracking-tight md:text-5xl", accentClass)}>{num}</p>
      <p className="mt-3 text-sm leading-relaxed text-white/75 md:text-base">{desc}</p>
    </div>
  );
}

function FeatureCard({
  icon, iconBg, borderClass, title, desc, tags,
}: {
  icon: React.ReactNode; iconBg: string; borderClass: string; title: string; desc: string; tags: string[];
}) {
  return (
    <Card className={cn("group relative overflow-hidden border-l-4 p-7 shadow-card transition-base hover:shadow-elevated hover:-translate-y-0.5", borderClass)}>
      <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-floating", iconBg)}>
        {icon}
      </div>
      <h3 className="mt-5 text-xl font-bold tracking-tight text-foreground">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">{desc}</p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span key={tag} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-foreground/70">
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
}

function JourneyStep({ n, emoji, text }: { n: number; emoji: string; text: string }) {
  return (
    <div className="relative flex flex-col items-center text-center">
      <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-card text-2xl shadow-elevated">
        <span aria-hidden>{emoji}</span>
      </div>
      <span className="mt-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{n}</span>
      <p className="mt-3 text-sm leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
