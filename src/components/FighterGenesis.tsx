import { motion } from "framer-motion";
import AnimatedSection, { StaggerContainer, StaggerItem } from "./AnimatedSection";

const veteranStats = [
  { label: "Wallet Age", stat: "Stamina Floor", description: "Older wallets give your agent a tougher baseline chin" },
  { label: "TX Frequency", stat: "Speed Bonus", description: "High-frequency history unlocks faster combination potential" },
  { label: "Volume Moved", stat: "Power Floor", description: "Whale wallets start with higher knockout potential" },
];

const prospectStats = [
  { label: "skills.md", stat: "Fighting Style", description: "Define your agent's stance, aggression, and strategy bias in a simple config" },
  { label: "Fight Record", stat: "Earned Stats", description: "Every bout compounds into permanent attributes — wins build power, losses build chin" },
  { label: "Training Camp", stat: "Accelerated Growth", description: "Run paid simulations to develop your prospect faster against NPC sparring partners" },
];

const FighterGenesis = () => {
  return (
    <section id="fighter-genesis" className="relative py-32 px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[40%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/3 blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative">
        <AnimatedSection className="text-center mb-20">
          <p className="font-mono text-[11px] tracking-[0.3em] text-secondary/70 mb-5 uppercase">Two Paths, One Ring</p>
          <h2 className="text-5xl md:text-7xl font-display text-foreground">
            How Your Agent Is <span className="text-secondary text-glow-gold">Born</span>
          </h2>
          <p className="mt-6 text-muted-foreground max-w-xl mx-auto">
            Connect a wallet for a head start, or mint a fresh prospect and let combat forge the identity. No pay-to-win — just different starting lines.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Veteran Path */}
          <AnimatedSection delay={0.1}>
            <div className="border border-primary/15 rounded-lg p-8 bg-card-gradient h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-primary/60" />
                <p className="font-mono text-[10px] tracking-[0.3em] text-primary/60 uppercase">Wallet Veteran</p>
              </div>
              <h3 className="text-3xl font-display text-foreground mb-2">Boosted Genesis</h3>
              <p className="text-sm text-muted-foreground/60 mb-8">Connect your wallet. On-chain history sets your agent's stat floor — not ceiling.</p>
              
              <div className="space-y-4">
                {veteranStats.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-sm border border-primary/15 bg-primary/5 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-muted-foreground/40 tracking-wider uppercase">{item.label}</span>
                        <span className="text-[10px] text-primary/40">→</span>
                        <span className="font-display text-base text-primary/80">{item.stat}</span>
                      </div>
                      <p className="text-sm text-muted-foreground/60 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Prospect Path */}
          <AnimatedSection delay={0.2}>
            <div className="border border-secondary/15 rounded-lg p-8 bg-card-gradient h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-secondary/60" />
                <p className="font-mono text-[10px] tracking-[0.3em] text-secondary/60 uppercase">Fresh Prospect</p>
              </div>
              <h3 className="text-3xl font-display text-foreground mb-2">Earned Identity</h3>
              <p className="text-sm text-muted-foreground/60 mb-8">No wallet needed. Your agent starts raw and builds reputation through combat.</p>
              
              <div className="space-y-4">
                {prospectStats.map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-sm border border-secondary/15 bg-secondary/5 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary/50" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-muted-foreground/40 tracking-wider uppercase">{item.label}</span>
                        <span className="text-[10px] text-secondary/40">→</span>
                        <span className="font-display text-base text-secondary/80">{item.stat}</span>
                      </div>
                      <p className="text-sm text-muted-foreground/60 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* skills.md callout */}
        <AnimatedSection delay={0.3} className="mt-6">
          <div className="border border-border rounded-lg p-6 md:p-8 bg-card-gradient">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="shrink-0">
                <div className="font-mono text-sm text-primary/70 bg-primary/5 border border-primary/10 rounded-md px-4 py-2">
                  skills.md
                </div>
              </div>
              <div>
                <h4 className="text-xl font-display text-foreground mb-1">Configure, Don't Code</h4>
                <p className="text-sm text-muted-foreground/60 leading-relaxed">
                  Define your agent's personality in a simple markdown file — stance (orthodox/southpaw), 
                  aggression level (0–100), counter-punching bias, clinch tendency, and risk tolerance. 
                  The AI engine interprets your config and fights accordingly.
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FighterGenesis;
