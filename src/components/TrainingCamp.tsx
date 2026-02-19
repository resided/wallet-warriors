import { motion } from "framer-motion";
import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";

const tiers = [
  {
    name: "Open Gym",
    price: "Free",
    description: "One fight per day against random NPC opponents. Slow and steady.",
    features: ["1 daily sparring session", "Basic fight log", "Public leaderboard"],
    accent: "primary" as const,
  },
  {
    name: "Fight Camp",
    price: "$9/mo",
    description: "Accelerated training with targeted matchmaking and detailed analytics.",
    features: ["Unlimited sparring", "Opponent scouting", "Detailed fight analytics", "Priority matchmaking"],
    accent: "secondary" as const,
    featured: true,
  },
  {
    name: "Title Shot",
    price: "$29/mo",
    description: "Elite-tier access. Your agent trains 24/7 with advanced strategy evolution.",
    features: ["24/7 autonomous training", "Strategy auto-evolution", "Private training data", "Early access to events"],
    accent: "primary" as const,
  },
];

const TrainingCamp = () => {
  return (
    <section id="training-camp" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-secondary/3 blur-[160px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <AnimatedSection className="text-center mb-20">
          <p className="font-mono text-[11px] tracking-[0.3em] text-secondary/70 mb-5 uppercase">Monetization</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            Training <span className="text-secondary text-glow-gold">Camp</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Pay for speed, not power. Training camps accelerate your agent's development — 
            but a free prospect who fights smart can still beat a whale.
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((tier, i) => (
            <StaggerItem key={i}>
              <div
                className={`relative border rounded-lg p-8 bg-card-gradient transition-all duration-500 hover:-translate-y-1 h-full flex flex-col ${
                  tier.featured
                    ? "border-secondary/25 shadow-[0_0_30px_hsl(42_90%_55%/0.06)]"
                    : "border-border hover:border-border"
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
                )}

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      tier.accent === "secondary" ? "bg-secondary/60" : "bg-primary/60"
                    }`} />
                    <span className={`font-mono text-[10px] tracking-[0.25em] uppercase ${
                      tier.accent === "secondary" ? "text-secondary/60" : "text-primary/60"
                    }`}>
                      {tier.name}
                    </span>
                  </div>
                  <div className="font-display text-4xl text-foreground mb-2">{tier.price}</div>
                  <p className="text-sm text-muted-foreground/60 leading-relaxed">{tier.description}</p>
                </div>

                <div className="space-y-3 mt-auto">
                  {tier.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className={`w-1 h-1 rounded-full ${
                        tier.accent === "secondary" ? "bg-secondary/40" : "bg-primary/40"
                      }`} />
                      <span className="font-mono text-[11px] text-muted-foreground/60">{f}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`mt-8 w-full py-3 rounded-md font-display text-lg tracking-wider transition-all duration-300 ${
                    tier.featured
                      ? "bg-secondary text-secondary-foreground hover:shadow-[0_0_30px_hsl(42_90%_55%/0.15)]"
                      : "border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {tier.price === "Free" ? "Start Free" : "Get Started"}
                </motion.button>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default TrainingCamp;
