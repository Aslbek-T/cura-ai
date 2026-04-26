import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CuraLogo } from "@/components/CuraLogo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LandingPage() {
  const { t } = useLanguage();
  const scrollToFeatures = () => {
    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] text-slate-900">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" aria-label="Cura AI Home">
            <CuraLogo variant="inline" size="md" className="text-[#1A6B8A]" />
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button asChild className="h-9 bg-[#1A6B8A] text-white hover:bg-[#155a73]">
              <Link to="/login">{t("nav_signIn")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative">
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
            {t("hero_badge")}
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            {t("hero_headline")}
          </h1>

          <p className="mt-6 max-w-3xl text-balance text-base leading-relaxed text-slate-700 sm:text-lg md:text-xl">
            {t("hero_subheadline")}
          </p>

          <div className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button
              type="button"
              onClick={scrollToFeatures}
              className="h-12 bg-[#2A9D8F] px-7 text-base font-semibold text-white hover:bg-[#238679]"
            >
              {t("hero_cta_primary")}
            </Button>
            <Button asChild variant="outline" className="h-12 border-[#1A6B8A]/40 px-7 text-base font-semibold text-[#1A6B8A] hover:bg-white">
              <Link to="/login">{t("hero_cta_secondary")}</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-sm text-slate-700">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">🏥 {t("hero_trust1")}</span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">🤖 {t("hero_trust2")}</span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">📱 {t("hero_trust3")}</span>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-[#1A202C] py-20 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-5xl">{t("prob_title")}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <StatCard num={t("prob_stat1_num")} desc={t("prob_stat1_desc")} />
            <StatCard num={t("prob_stat2_num")} desc={t("prob_stat2_desc")} />
            <StatCard num={t("prob_stat3_num")} desc={t("prob_stat3_desc")} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-5xl">{t("feat_title")}</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <FeatureCard
              title={t("feat1_title")}
              desc={t("feat1_desc")}
            />
            <FeatureCard
              title={t("feat2_title")}
              desc={t("feat2_desc")}
            />
            <FeatureCard
              title={t("feat3_title")}
              desc={t("feat3_desc")}
            />
            <FeatureCard
              title={t("feat4_title")}
              desc={t("feat4_desc")}
            />
          </div>
        </div>
      </section>

      {/* MARIA */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-5xl">{t("journey_title")}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed text-slate-700 md:text-lg">
            {t("journey_subtitle")}
          </p>

          <div className="mt-12">
            <div className="hidden md:block mx-auto h-px max-w-5xl bg-slate-200" />
            <div className="mt-8 grid gap-6 md:grid-cols-5">
              <JourneyStep emoji="📱" text={t("step1")} />
              <JourneyStep emoji="🤖" text={t("step2")} />
              <JourneyStep emoji="👩‍⚕️" text={t("step3")} />
              <JourneyStep emoji="🚗" text={t("step4")} />
              <JourneyStep emoji="⭐" text={t("step5")} />
            </div>
          </div>
        </div>
      </section>

      {/* BANNER INTEGRATION */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-extrabold tracking-tight md:text-5xl">{t("integ_title")}</h2>
          <p className="mx-auto mt-4 max-w-3xl text-center text-base leading-relaxed text-slate-700 md:text-lg">
            {t("integ_desc")}
          </p>
          <ul className="mx-auto mt-10 grid max-w-4xl gap-3 md:grid-cols-3">
            <CheckItem text={t("integ_pt1")} />
            <CheckItem text={t("integ_pt2")} />
            <CheckItem text={t("integ_pt3")} />
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1A202C] py-12 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-6 md:grid-cols-3 md:items-start">
            <div className="font-semibold">{t("footer_track")}</div>
            <div className="text-white/80 md:text-center">{t("footer_team")}</div>
            <div className="text-white/70 md:text-right">{t("footer_powered")}</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ num, desc }: { num: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-7 backdrop-blur-sm">
      <div className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">{num}</div>
      <div className="mt-3 text-sm leading-relaxed text-white/80">{desc}</div>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
      <h3 className="text-xl font-bold tracking-tight text-slate-900">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">{desc}</p>
    </div>
  );
}

function JourneyStep({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-[#F0F4F8] text-2xl shadow-sm">
        <span aria-hidden>{emoji}</span>
      </div>
      <p className="mt-4 text-sm leading-relaxed text-slate-800">{text}</p>
    </div>
  );
}

function CheckItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className="mt-0.5 text-[#2A9D8F]">✓</span>
      <span className="text-sm font-medium text-slate-800">{text}</span>
    </li>
  );
}

