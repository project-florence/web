<p align="center">
  <picture>
    <img src="./src/assets/florence_logo.svg" width="80" height="80" alt="Florence">
  </picture>
</p>

<h1 align="center">Florence</h1>

<p align="center">
  <strong>Next-Gen Agentic Finance</strong> — AI-powered portfolio analysis, simulations, and autonomous financial workflows.
</p>

<p align="center">
  <img src="./public/assets/stocks.png" width="700" alt="Florence Screenshot">
</p>

---

## Overview

Florence is a smart investment assistant that combines real-time market data, AI-driven analysis, and virtual portfolio management. Track stocks, precious metals, and currencies; run simulations; generate AI reports; and manage virtual portfolios — all in one place.

### Features

- **📊 Market Dashboard** — Real-time stock prices, currency rates, precious metals, and macroeconomic indicators
- **🤖 AI Advisor** — AI-powered stock recommendations based on your portfolio and risk profile
- **📈 Interactive Charts** — Candlestick charts with multiple timeframes and intervals (KLineChart)
- **📄 Automated Reports** — Generate fundamental analysis, news sentiment reports, and strategy evaluations
- **🎮 Market Simulations** — Stress-test strategies with advanced simulation models
- **💰 Virtual Portfolios** — Create and manage portfolios, track performance, benchmark against XU100
- **📋 Watchlist** — Custom watchlists with real-time price updates
- **📢 Announcements** — Admin announcement system with real-time notifications
- **🌐 i18n** — Turkish and English interface support
- **🎨 Themes** — 6 handcrafted themes (Florence, Ocean, Emerald, Midnight, Sunset, Light)

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **TypeScript 6** | Type safety |
| **Vite 8** | Build tool & dev server |
| **Tailwind CSS 4** | Styling |
| **shadcn/ui** (base-ui) | Component primitives |
| **TanStack React Query** | Server state management |
| **Zustand** | Client state management |
| **React Router 7** | Routing |
| **i18next** | Internationalization |
| **KLineChart** | Financial candlestick charts |
| **Apache ECharts / Recharts** | Data visualization |

### Backend

| Technology | Purpose |
|---|---|
| **Python 3.12** | Runtime |
| **FastAPI** | REST API framework |
| **PostgreSQL** | Primary database |
| **Redis** | Caching |
| **psycopg2** | PostgreSQL adapter |
| **PyKAP** | BIST (Borsa Istanbul) data integration |
| **yfinance** | Yahoo Finance data |
| **Google BigQuery (GDELT)** | News aggregation & sentiment |
| **SearXNG** | Private news search |
| **Argon2** | Password hashing |
| **PyJWT** | Token-based authentication |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  React SPA  │────▶│  FastAPI     │────▶│ PostgreSQL │
│  (Vite)     │     │  (Uvicorn)   │     │  + Redis   │
│  florencex  │     │  /api/v1/*   │     │  + SearXNG │
└─────────────┘     └──────────────┘     └────────────┘
```

## Getting Started

### Prerequisites

- Node.js 22+
- Python 3.12+
- Docker & Docker Compose

### Quick Start

```bash
# Frontend
npm install
npm run dev       # → http://localhost:5173

# Backend (Docker)
docker compose up -d   # Starts PostgreSQL, Redis, SearXNG, API
```

The frontend dev server proxies `/api/*` requests to the backend (default `http://localhost:8000`).

### Environment

```bash
# Frontend: .env
VITE_API_URL=http://localhost:8000

# Backend: .env (see .env.example)
POSTGRES_PASSWORD=...
SECRET_KEY=...
REDIS_PASSWORD=...
```

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── shared/     # App-specific components
│   └── ui/         # shadcn/ui primitives
├── pages/          # Route pages
├── widgets/        # Dashboard widgets
├── stores/         # Zustand stores
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── config/         # App configuration & themes
├── i18n/           # Internationalization
├── types/          # TypeScript type definitions
└── assets/         # Static assets
```

## License

Apache License 2.0
