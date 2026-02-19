# Stack Research

**Domain:** AI Combat Arena Platform with Token Staking
**Researched:** 2026-02-19
**Confidence:** HIGH

## Executive Summary

FightBook requires a stack that handles three distinct domains: AI text generation (for battle narratives), blockchain integration (for token staking), and real-time state management (for live fight updates). The existing Vite + React + Tailwind foundation is solid. The missing pieces are AI integration, wallet connection, and backend choice.

The 2025-2026 standard for React AI apps is **Vercel AI SDK v6** with streaming. For wallet connection, **Wagmi v2 + Viem** dominates. For backend, **Convex** is emerging as the preferred choice for real-time React apps (used by the similar pvpAI project), though **Supabase** offers more control. For smart contracts, **Hardhat** remains the standard for development with **Foundry** gaining traction for testing.

## Recommended Stack

### Core Framework (Already Selected)

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React | 18.x | UI framework | Already in use, mature ecosystem |
| Vite | 5.x | Build tool | Already in use, fast HMR |
| TypeScript | 5.x | Type safety | Already in use |
| Tailwind CSS | 3.x | Styling | Already in use |

### AI Integration

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Vercel AI SDK | 6.x | AI text generation with streaming | Industry standard for React AI apps. 20M+ monthly downloads. Provides unified API across 25+ providers (OpenAI, Anthropic, Google). Streaming-first architecture essential for battle narrative UX. |
| @ai-sdk/openai | latest | OpenAI provider | Default choice for most AI battle generation. GPT-4o offers best quality/speed for combat narratives. |
| @ai-sdk/anthropic | latest | Anthropic provider | Alternative for Claude - better for long-form narrative generation. Consider for different fighter "personalities." |

### Wallet Connection & Blockchain

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Wagmi | 2.x | React hooks for Ethereum | Dominant React Web3 library. 50k+ weekly npm downloads. Replaces ethers.js with Viem for smaller bundle (~60% smaller). |
| Viem | 2.x | Low-level Ethereum library | Used by Wagmi internally. Type-safe, modern replacement for ethers.js. |
| RainbowKit | 2.x | Wallet connect UI | Built on Wagmi. Best-in-class wallet picker UI. 96k weekly npm downloads. |
| @tanstack/react-query | 5.x | Data fetching | Required by Wagmi. Also use for general API state. |

### Backend & Database

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Convex | latest | Real-time backend | **Recommended for MVP.** Type-safe, real-time by default. Used by pvpAI (similar AI combat project). Eliminates API boilerplate. Native real-time subscriptions perfect for live fight updates. |
| Supabase | latest | PostgreSQL backend | **Alternative for more control.** Open-source, SQL-based, self-hostable. Better for complex queries and avoiding vendor lock-in. |

### Smart Contract Development

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Hardhat | latest | Solidity development environment | Industry standard. Excellent plugin ecosystem. Great TypeScript support. |
| Foundry | latest | Smart contract testing | **Use alongside Hardhat.** Blazing fast Solidity-native testing. Essential for fuzzing and invariant testing - critical for financial contracts like token staking. |

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @solana/web3.js | latest | Solana interaction | If extending to Solana chain later |
| siwe | latest | Sign-In with Ethereum | For non-custodial authentication |
| zustand | 5.x | Client state management | For wallet state, UI state outside React Query |
| date-fns | latest | Date formatting | For fight timestamps, leaderboard dates |
| react-markdown | latest | Markdown rendering | For AI-generated battle narratives |
| clsx | latest | Conditional class names | For Tailwind component variants |

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Vercel | Deployment | Best DX for Next.js + AI SDK. Already hosting existing app. |
| RainbownKit CLI | Wallet debugging | Useful for testing wallet flows |
| Tenderly | Smart contract monitoring | For debugging failed transactions |
| Alchemy/Infura | RPC providers | Need one for mainnet/testnet access |

## Installation

```bash
# AI Integration
npm install ai @ai-sdk/openai @ai-sdk/anthropic

# Wallet Connection
npm install wagmi viem @tanstack/react-query @rainbow-me/rainbowkit

# Backend (choose one)
npm install convex  # Recommended for MVP
# OR
npm install @supabase/supabase-js

# Smart Contract (development)
npm install -D hardhat @nomicfoundation/hardhat-toolbox
npm install -D forge-foundry  # For testing (via foundryup)

# Supporting
npm install zustand date-fns react-markdown clsx
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Vercel AI SDK | Direct OpenAI API | Only if you need minimal bundle size and don't need streaming UI |
| Vercel AI SDK | LangChain.js | Only if building complex multi-agent workflows later |
| Wagmi + RainbowKit | Privy | If you need embedded wallets (not just wallet connection) |
| Wagmi + RainbowKit | Dynamic | If you need enterprise features or managed infrastructure |
| Convex | Next.js API Routes | If you need full control over backend logic |
| Convex | Firebase | If you need push notifications (Convex doesn't offer) |
| Hardhat | Truffle | Truffle is effectively deprecated - avoid |
| Hardhat | Brownie | Only if you prefer Python |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| ethers.js v5 | Replaced by viem in wagmi v2 | Use viem (bundled with wagmi) |
| web3-react | Deprecated, no longer maintained | Use wagmi v2 |
| Truffle | No longer actively maintained | Use Hardhat |
| Firebase | NoSQL limits complex queries, vendor lock-in | Use Convex or Supabase |
| Direct API calls without SDK | No streaming support, manual retry logic | Use Vercel AI SDK |
| Redux | Overkill for this use case | Use Zustand or React Query |

## Stack Patterns by Variant

**If building MVP first (recommended):**
- Use Convex for backend — fastest path to real-time
- Use RainbowKit for wallet UI — best out-of-box experience
- Use Vercel AI SDK with OpenAI — most straightforward integration

**If needing self-hosted option later:**
- Use Supabase instead of Convex — can self-host
- Keep Vercel AI SDK (works with any backend)

**If extending to multiple EVM chains:**
- Add @solana/web3.js alongside viem — separate integrations
- Considerwagmi's multi-chain hooks for unified UX

**If token staking becomes complex (multiple reward tiers):**
- Add Foundry for testing — fuzzing catches edge cases
- Consider formal verification later for critical paths

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| wagmi v2 | viem v2 | Both released together, compatible |
| wagmi v2 | @tanstack/react-query v5 | Required peer dependency |
| RainbowKit v2 | wagmi v2 | Requires wagmi v2, not v1 |
| Vercel AI SDK v6 | Next.js 14/15 | Works with both app router and pages |
| Vercel AI SDK v6 | React 18 | Requires React 18 for streaming hooks |
| Convex | Next.js 14/15 | Native integration available |
| Hardhat | Node.js 18+ | Node 16 deprecated |

## Sources

- **pvpAI Arena (GitHub)** — Actual AI Combat Arena project using Next.js + Convex + TypeScript. Primary reference for similar architecture.
- **Vercel AI SDK Documentation** — Confirmed v6 as current (Dec 2025 release), streaming-first architecture, 25+ providers.
- **wagmi.sh** — Confirmed v2 as current, viem integration, React Query v5 requirement.
- **RainbowKit npm** — v2.2.10 confirmed (Feb 2025), 96k weekly downloads.
- **ToolStac comparison** — Hardhat vs Foundry analysis, Truffle/Brownie deprecated status.
- **WebSearch** — Verified current trends, wallet connection patterns, backend choices.
- **Context7/CodeSearch** — Verified technical details, version requirements.

---

*Stack research for: FightBook AI Combat Arena*
*Researched: 2026-02-19*
