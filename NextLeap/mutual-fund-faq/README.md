# INDMoney Mutual Fund FAQ Assistant

## Product Chosen

INDMoney

## Scope

AMC: HDFC Mutual Fund

Schemes:

- HDFC Top 100 Fund / HDFC Large Cap Fund
- HDFC Flexi Cap Fund
- HDFC ELSS Tax Saver Fund
- HDFC Balanced Advantage Fund

Note: HDFC Mutual Fund currently presents the former HDFC Top 100 Fund as HDFC Large Cap Fund on its official site, while some page content still references HDFC Top 100 Fund.

## What It Answers

Expense ratio, exit load, minimum SIP, lock-in, benchmark, riskometer, factsheet/KIM/SID links, and statement download instructions.

## What It Refuses

Investment advice, portfolio recommendations, buy/sell/hold questions, return comparisons, performance predictions, and PII-based requests.

## Guardrails

The assistant warns users not to enter PAN, Aadhaar, OTPs, phone numbers, emails, folio numbers, or account numbers. It blocks factual answering when those patterns appear in the user query.

## Setup

```bash
pip install -r requirements.txt
streamlit run app.py
```

## Optional Claude AI Mode

The app works without AI by using deterministic guarded answers. To enable Claude summarization from the local official-source corpus only:

```bash
export ANTHROPIC_API_KEY="your-key"
export USE_AI=true
streamlit run app.py
```

Optional:

```bash
export ANTHROPIC_MODEL="claude-3-5-haiku-20241022"
```

AI mode still runs PII, advice, and performance guardrails before any answer is returned. Claude is used to map differently worded or non-English questions to supported intents, and for optional summarization from retrieved official-source corpus text; the app adds the citation and last-updated text after the model response.

## Deploy On Streamlit Cloud

1. Push this `mutual-fund-faq` folder to a GitHub repository.
2. In Streamlit Cloud, create a new app from the repository.
3. Set the app entrypoint to `app.py` if the repository root is `mutual-fund-faq`, or `mutual-fund-faq/app.py` if this folder is inside a larger repository.
4. Add these app secrets:

```toml
USE_AI = "true"
ANTHROPIC_API_KEY = "your-claude-api-key"
ANTHROPIC_MODEL = "claude-3-5-haiku-20241022"
```

5. Deploy the app and test the sample questions.

Do not commit `.streamlit/secrets.toml`; use Streamlit Cloud secrets or environment variables for the Claude key.

## Sources

See `source_list.csv`.

## Known Limits

- Answers only from selected corpus.
- Does not personalize based on user holdings.
- Does not store or process PII.
- Does not compute returns.
- Uses keyword-style retrieval rather than a full embedding pipeline.
