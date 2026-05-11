# 🤖 Talos — Autonomous AI Swarm Intelligence

<div align="center">

![Talos](https://img.shields.io/badge/Talos-v2.0-ff0055?style=for-the-badge&labelColor=06060b)
![Agents](https://img.shields.io/badge/Agents-10-00e5ff?style=for-the-badge&labelColor=06060b)
![Pipelines](https://img.shields.io/badge/Pipelines-5-7c3aed?style=for-the-badge&labelColor=06060b)
![Node](https://img.shields.io/badge/Node-%3E%3D16-00ff96?style=for-the-badge&labelColor=06060b)

**Sistem orkestrasi agen AI otonom multi-role untuk riset keamanan, otomatisasi tingkat lanjut, dan pengembangan kode mandiri.**

[🌐 Live Dashboard](https://soonover.github.io/AIPRANK/) · [📦 Download](https://github.com/SoonOver/AIPRANK/archive/refs/heads/main.zip)

</div>

---

## ⚡ Fitur Utama

- **10 Agent Roles** — Decider, Researcher, Planner, Architect, Builder, Checker, Verifier, Requirement, Chatter, Summarizer
- **5 Pipelines** — Build, Research, Chat, Fix, Automation
- **6 Built-in Tools** — Command Executor, Web Fetcher, File Manager, Filesystem Walker, GitHub Search, Web Search
- **Multi-Gateway** — Terminal CLI, Telegram Bot, WhatsApp Bot
- **Memory Engine** — Short-term, Long-term, dan Skill storage untuk pembelajaran kontekstual
- **Self-Healing** — Auto-retry dengan feedback loop untuk koreksi mandiri

## 🚀 Quick Start

```bash
# 1. Clone repository
git clone https://github.com/SoonOver/AIPRANK.git
cd AIPRANK/project

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env dan isi GEMINI_API_KEY

# 4. Jalankan Talos
npm start
```

## 🏗️ Arsitektur

```
Input → Classifier → Decider → Pipeline Router
                                    ↓
                    researcher → planner → architect
                                    ↓
                    builder → checker → verifier
                                    ↓
                         Memory Engine → Output
```

## 📁 Struktur Proyek

```
project/
├── main.js              # Entry point
├── orchestrator.js       # Central orchestration engine
├── agent/
│   ├── roles/           # 10 agent roles
│   └── pipeline/        # 5 execution pipelines
├── gateway/             # Telegram & WhatsApp integrations
├── memory/              # Persistent memory storage
├── tools/               # Built-in tool modules
├── utils/               # Utilities (classifier, validator, etc.)
└── web/                 # Legacy web dashboard
docs/                    # GitHub Pages dashboard
```

## 🌐 GitHub Pages

Dashboard Talos di-deploy otomatis dari folder `/docs`. Kunjungi:

**https://soonover.github.io/AIPRANK/**

## 📄 License

MIT © 2026 Talos Project
