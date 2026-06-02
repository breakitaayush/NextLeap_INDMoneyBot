# INDMoney Mutual Fund FAQ Assistant - Submission

## Product Chosen

INDMoney

## Prototype

GitHub repository: https://github.com/breakitaayush/NextLeap_INDMoneyBot

Streamlit app path:

```text
NextLeap/mutual-fund-faq/app.py
```

## Scope

AMC: HDFC Mutual Fund

Supported schemes:

- HDFC Top 100 Fund / HDFC Large Cap Fund
- HDFC Flexi Cap Fund
- HDFC ELSS Tax Saver Fund
- HDFC Balanced Advantage Fund

## What The Assistant Answers

The assistant answers factual mutual fund questions from the selected official-source corpus:

- Expense ratio / TER
- Exit load
- Minimum SIP
- ELSS lock-in
- Benchmark
- Riskometer
- Factsheet, KIM, and SID links
- Capital gains statement and account statement guidance

## What The Assistant Refuses

The assistant refuses:

- Investment advice
- Buy, sell, hold, switch, or redeem recommendations
- Portfolio recommendations
- Return predictions
- Return comparisons
- PII-based requests

## Guardrails

- No PII: blocks PAN, Aadhaar-like numbers, OTPs, phone numbers, emails, account numbers, and folio numbers.
- No performance claims: does not calculate or compare returns; redirects to the official factsheet.
- No advice: redirects to AMFI investor education.
- Public sources only: sources are HDFC Mutual Fund, HDFC-hosted files, SEBI Investor, and AMFI.
- Every answer includes one citation and `Last updated from sources: 2026-06-02`.

## Claude AI Support

Claude is optional and controlled by deployment secrets:

```toml
USE_AI = "true"
ANTHROPIC_API_KEY = "your-claude-api-key"
ANTHROPIC_MODEL = "claude-3-5-haiku-20241022"
```

Claude is used to map differently worded or non-English questions to supported factual intents. The app still returns answers from the official-source corpus and keeps citation/last-updated text controlled by code.

## Streamlit Cloud Deployment Settings

Repository:

```text
breakitaayush/NextLeap_INDMoneyBot
```

Branch:

```text
main
```

Main file path:

```text
NextLeap/mutual-fund-faq/app.py
```

Secrets:

```toml
USE_AI = "true"
ANTHROPIC_API_KEY = "your-claude-api-key"
ANTHROPIC_MODEL = "claude-3-5-haiku-20241022"
```

## Files To Submit

- `README.md`
- `source_list.csv`
- `sample_qa.md`
- `submission/final_submission.md`
- `submission/submission_checklist.md`
- `submission/demo_script.md`
- `submission/test_cases.md`
- Working Streamlit app link after deployment
