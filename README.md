# Appfusion
## Inspiration
I've always been drawn to companies that treat product decisions like scienc,  where data and not opinion drives what gets built. After studying how companies
like Bending Spoons approach app acquisition and improvement, I asked myself, what would their internal tooling actually look like? That question became AppFusion. This project sits at the intersection of my background in science, data analysis (SQL,Python) and my growing skills in full-stack development and AI integration.It's also where I applied my years of self taught React skills, building something real is the onlyway I know how to learn.

## What AppFusion Does
AppFusion is a four-module pipeline that takes any iOS app and produces a structured intelligence report, the kind a product team would use to prioritise improvements or evaluate an acquisition target. iTunes API → MySQL → Pandas Analytics → Groq AI → React Dashboard

## Module 1 — Data Ingest Pipeline
-Scrapes App Store reviews, ratings, and metadata using Apple's free iTunes Search API. 
-Stores everything in a structured MySQL database.
-No scraping API key required.
## Module 2 — Retention & Monetisation Analyser
-Uses Pandas to calculate rating decay over time (a churn proxy), paywall friction scores from 1-star review keyword analysis, and
simulated cohort retention curves. Outputs interactive Plotly charts.
## Module 3 — AI Review Intelligence Engine
-Sends review batches to the Groq API (LLaMA 3.3 70B) with structured prompts that return clean JSON: top complaint themes, delight themes, a prioritised feature backlog ranked by user pain score, a 90-day action plan, and an overall app health verdict.
## Module 4 — Interactive Dashboard
A React + Tailwind glassmorphism dashboard displaying all analytics and AI insights across five tabs: Overview, Complaints, Delights,
Feature Backlog, and 90-Day Plan.

## Demo — Evernote Analysis
Running AppFusion on Evernote (a real app with a known history) revealed the following from 50 App Store reviews:

-80% polarisation score — users either love it or hate it
-Paywall friction: HIGH — pricing dominates 1-star reviews
-Top complaint: Aggressive subscription model limiting core features
-Top delight: Seamless cross-device sync
-AI verdict: Strong core product undermined by monetisation
-strategy — pricing restructure could unlock significant growth

### This matches what industry analysts have publicly noted about Evernote's trajectory — which means the tool is working.

Tech Stack
LayerTechnologyWhyData CollectionPython + iTunes Search APIFree, no auth requiredDatabaseMySQLProduction-grade, real-world standardAnalyticsPandas + PlotlyIndustry standard data stackAIGroq API — LLaMA 3.3 70BFree tier, fast inferenceBackendFastAPI + UvicornTyped, async, production-readyFrontendReact + Tailwind CSSComponent-driven, modernVisualisationRechartsDeclarative, React-native chartsEnvironmentpython-dotenvSecure credential managementDeployNetlify + RailwayFree tier, CI/CD from GitHub

## Getting Started: Prerequisites

-Python 3.12
-Node.js 20+
-MySQL 8.0
-Free Groq API key (console.groq.com)

## Installation
-bash# Clone the repo
-git clone https://github.com/yourusername/appfusion.git
-cd appfusion

## Install Python dependencies
pip install fastapi uvicorn requests pandas plotly mysql-connector-python python-dotenv groq sqlalchemy

## Set up environment variables
cp .env.example .env (Add your GROQ_API_KEY and DB_PASSWORD to .env)

## Set up MySQL
Create database: CREATE DATABASE appfusion, Run scraper to populate data

## Run the scraper
python scraper/scraper.py

## Run the analytics
python analytics/analyser.py

## Run the AI analysis
python ai_module/ai_analyser.py

## Start the dashboard
cd frontend/dashboard
npm install
npm start

## What I Learned Building This
Coming from a data analysis background (SQL + Python), this project pushed
me into territory I'd never worked in before:

React — I had very little to none React experience before this project. Building a real, data-driven dashboard was how I learnt it. Every component, every hook, every state update was new.
FastAPI — Designing typed, async API endpoints taught me how backend services actually work in production environments.
Prompt Engineering — Getting an LLM to return consistent, structured JSON reliably required more iteration than I expected. The prompt design is as important as the code around it.
Full-stack thinking — Connecting a scraper to a database to an analytics engine to an AI to a frontend taught me to think about systems, not just scripts.


Inspired and grateful for the product philosophy of companies like Bending Spoons, who treat app acquisition as a data-driven science, it was a major inspiration for this project's design. AppFusion is not affiliated with or built for any specific company. It's a general-purpose intelligence tool that any
product team, VC analyst, or indie developer could use.

