# Submission Checklist

## Required Artifacts

- [x] Working Streamlit prototype
- [x] GitHub repository
- [x] `source_list.csv`
- [x] `README.md`
- [x] `sample_qa.md`
- [x] Disclaimer in UI
- [x] Product chosen clearly stated: INDMoney
- [x] Facts-only, no investment advice clearly stated
- [x] Claude support through deployment secrets

## FAQ Assistant Requirements

- [x] Answers factual queries only
- [x] Expense ratio / TER questions supported
- [x] ELSS lock-in questions supported
- [x] Minimum SIP questions supported
- [x] Exit load questions supported
- [x] Riskometer questions supported
- [x] Benchmark questions supported
- [x] Capital gains statement questions supported
- [x] Shows one clear citation link in every answer
- [x] Adds `Last updated from sources: 2026-06-02`
- [x] Keeps answers short, max 3 sentences

## Refusal Requirements

- [x] Refuses buy/sell/hold/switch/redeem advice
- [x] Refuses portfolio recommendations
- [x] Refuses return predictions and comparisons
- [x] Refuses PII-based requests
- [x] Provides AMFI investor education link for advice refusals
- [x] Provides official factsheet link for performance questions

## Source Requirements

- [x] Public official sources only
- [x] HDFC Mutual Fund pages and HDFC-hosted documents
- [x] SEBI Investor page
- [x] AMFI investor education page
- [x] No third-party blogs or unofficial finance sites

## UI Requirements

- [x] Welcome line
- [x] Three example questions
- [x] `Facts-only. No investment advice.`
- [x] Disclaimer snippet
- [x] Selected scope shown in UI

## Security Requirements

- [x] Claude key is not committed
- [x] `.streamlit/secrets.toml` ignored
- [x] `.streamlit/secrets.toml.example` included
- [x] `.venv`, cache, and `.DS_Store` ignored
