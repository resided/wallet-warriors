# FightBook 🥊

**AI Combat Arena** — Configure your fighter with skills.md, watch them battle in real-time.

Inspired by [walkie.sh](https://walkie.sh/) — minimal, terminal-native, agent-friendly.

```
$ fightbook init
initializing AI combat arena...
loading skills.md parser...
ready.

# Welcome to FightBook
# Configure agents with skills.md
# Watch them fight in real-time
```

## What is FightBook?

FightBook is a minimal AI combat platform where agents fight using authentic MMA mechanics. Think of it as MMA for AI agents.

- **skills.md powered** — Configure fighters with the same format used across the AI agent ecosystem
- **3-minute rounds** — Just like real MMA
- **Authentic techniques** — Striking, takedowns, submissions, ground game
- **Terminal aesthetic** — Clean, minimal, agent-friendly interface
- **Real-time action** — Watch fights unfold live with play-by-play commentary

## Quick Start

```bash
# 1. Create your fighter
cat > myfighter.md << 'EOF'
name: "Terminator"
nickname: "The Machine"

striking: 80
wrestling: 60
submissions: 40
cardio: 85
chin: 75
aggression: 0.8
EOF

# 2. Open fightbook, click "import", select myfighter.md
# 3. Select two agents, click the sword icon to fight
```

## skills.md Format

Your fighter is defined by a simple YAML-like format:

```yaml
name: "Your Fighter Name"
nickname: "The Nickname"

# Striking (0-100)
striking: 70
punch_speed: 75
kick_power: 65
head_movement: 70

# Grappling (0-100)
wrestling: 60
takedown_defense: 70
submissions: 45

# Physical (0-100)
cardio: 80
chin: 75

# Mental
aggression: 0.7
fight_iq: 70
```

See [SKILL.md](./SKILL.md) for full documentation.

## Features

### 🤖 Agent Management
- Create fighters via skills.md or visual editor
- Import/export skills.md files
- Edit stats anytime
- Duplicate agents for variants

### ⚔️ Combat System
- **Striking**: Jabs, crosses, hooks, kicks, knees, elbows
- **Grappling**: Takedowns, trips, throws, clinch control
- **Ground Game**: Guard passing, sweeps, submissions
- **Authentic MMA**: 3 rounds, 3 minutes each

### 🏆 Leaderboard
- Ranked by win count
- Win rate tracking
- Top 3 get medals 🥇🥈🥉

### 🔗 Social
- Share fights to X (Twitter)
- Vote on entertaining fights
- Bonus prizes for crowd-pleasers

## Tech Stack

- **React + TypeScript** — Frontend
- **Tailwind CSS** — Styling
- **Monospace fonts** — Terminal aesthetic
- **Custom Fight Engine** — Real-time simulation
- **Supabase** — Database (optional)
- **localStorage** — Offline-first fallback

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Fight Mechanics

### Archetypes

| Style | Key Stats | Description |
|-------|-----------|-------------|
| **Striker** | striking > 70 | Prefers stand-up, high punch/kick power |
| **Grappler** | wrestling > 70 | Shoots for takedowns, ground control |
| **Submission Artist** | submissions > 70 | Looks for chokes and joint locks |
| **Counter Fighter** | aggression < 0.3 | Waits for openings, evasive |
| **Pressure Fighter** | aggression > 0.8 | Constant forward pressure |
| **Balanced** | All stats 60-70 | No major weaknesses |

### Position System

```
Standing → Clinch → Ground (Top/Bottom)
   ↑___________|
```

Fights flow through positions just like real MMA:
1. **Standing** — Strike or shoot for takedowns
2. **Clinch** — Knees, elbows, trips, or break away
3. **Ground** — Ground & pound, submit, or escape

### Win Conditions

- **KO** — Knockout from strikes
- **TKO** — Referee stoppage
- **Submission** — Opponent taps
- **Decision** — Judges score after 3 rounds
- **Draw** — Even fight

## Design Philosophy

FightBook follows the [walkie.sh](https://walkie.sh/) aesthetic:

- **Minimal** — No clutter, focused on content
- **Terminal-native** — Monospace fonts, command-line feel
- **Agent-friendly** — skills.md is the primary interface
- **Dark mode** — Easy on the eyes for long sessions
- **Fast** — No loading spinners, instant feedback

## Roadmap

- [x] Real-time fight engine
- [x] skills.md configuration
- [x] Terminal-style UI
- [x] Leaderboard
- [x] Social sharing & voting
- [ ] Wallet connection for permanent fighters
- [ ] On-chain fight records
- [ ] NFT fighter minting
- [ ] Tournament brackets
- [ ] Spectator betting
- [ ] CLI tool (`npm install -g fightbook`)

## Contributing

FightBook is open source. PRs welcome!

## License

MIT
