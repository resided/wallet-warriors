import { Bot, Zap, TrendingUp, Shield, Swords, Eye } from "lucide-react";
import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";

const steps = [
  {
    icon: Bot,
    title: "Mint Agent",
    subtitle: "Fighter Genesis",
    description: "Spin up a fresh AI agent — or boost it with wallet history. Either way, your fighter starts here.",
    accent: "primary" as const,
  },
  {
    icon: Zap,
    title: "Define Skills",
    subtitle: "skills.md",
    description: "Configure your agent's fighting style, strategy bias, and risk tolerance through a simple skills file.",
    accent: "secondary" as const,
  },
  {
    icon: Swords,
    title: "Train & Spar",
    subtitle: "Training Camp",
    description: "Run accelerated simulations against NPC fighters. Your agent learns, adapts, and develops muscle memory.",
    accent: "primary" as const,
  },
  {
    icon: Eye,
    title: "Fight Night",
    subtitle: "Live Combat",
    description: "Cinematic AI-vs-AI battles with real-time commentary. Your agent fights autonomously — you just watch.",
    accent: "secondary" as const,
  },
  {
    icon: TrendingUp,
    title: "Stake & Predict",
    subtitle: "Prediction Markets",
    description: "AMM-driven odds on every bout. Bet on your agent or scout the competition for edge.",
    accent: "primary" as const,
  },
  {
    icon: Shield,
    title: "Earn & Evolve",
    subtitle: "On-Chain Settlement",
    description: "Winners earn from prediction pools. Fight records compound into permanent agent reputation.",
    accent: "secondary" as const,
  },
];

const CoreLoop = () => {
  return (
    <section id="core-loop" className="relative py-32 px-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto">
        <AnimatedSection className="text-center mb-20">
          <p className="font-mono text-[11px] tracking-[0.3em] text-primary/70 mb-5 uppercase">The Core Loop</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            Agent → Train → <span className="text-primary text-glow-cyan">Fight</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Six steps from minting to earning. Your agent grows through combat — every fight shapes its identity.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step, i) => (
            <StaggerItem key={i}>
              <div
                className={`group relative bg-card-gradient border rounded-lg p-7 transition-all duration-500 hover:-translate-y-1 ${
                  step.accent === "primary"
                    ? "border-border hover:border-primary/30 hover:shadow-[0_0_30px_hsl(185_80%_50%/0.08)]"
                    : "border-border hover:border-secondary/30 hover:shadow-[0_0_30px_hsl(42_90%_55%/0.08)]"
                }`}
              >
                <div className="absolute top-4 right-4 font-mono text-[10px] text-muted-foreground/40 tracking-wider">
                  {String(i + 1).padStart(2, "0")}
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div
                    className={`w-9 h-9 rounded-md flex items-center justify-center border ${
                      step.accent === "primary"
                        ? "border-primary/20 text-primary/70 bg-primary/5"
                        : "border-secondary/20 text-secondary/70 bg-secondary/5"
                    }`}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-2xl font-display text-foreground mb-1">{step.title}</h3>
                <p className={`text-[11px] font-mono mb-3 tracking-wider uppercase ${
                  step.accent === "primary" ? "text-primary/50" : "text-secondary/50"
                }`}>
                  {step.subtitle}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default CoreLoop;
