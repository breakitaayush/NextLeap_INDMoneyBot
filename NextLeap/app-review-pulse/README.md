# INDMoney App Review Pulse

## Product Chosen

INDMoney, matching the previous challenge.

## What This Prototype Does

This app imports recent public App Store and Play Store review exports, groups reviews into a maximum of five themes, generates a one-page weekly note, and creates a ready-to-paste email draft.

The included CSV is a redacted sample for prototype/demo use. For final submission, replace it with a public review export from the last 8-12 weeks.

## Inputs

CSV columns:

```csv
platform,rating,title,text,date
```

Rules:

- Use public review exports only.
- Do not include usernames, emails, phone numbers, account IDs, or other PII.
- Keep only rating, title, review text, platform, and date.

## Setup

```bash
pip install -r requirements.txt
streamlit run app.py
```

## How To Re-run For A New Week

1. Export recent INDMoney App Store and Play Store reviews from a public/non-login source or approved public export tool.
2. Keep only `platform`, `rating`, `title`, `text`, and `date`.
3. Remove usernames, reviewer IDs, emails, phone numbers, and account identifiers.
4. Save the file as CSV.
5. Run the app and upload the CSV.
6. Set the review window to 8, 10, or 12 weeks.
7. Download the generated weekly note and email draft.

## Theme Legend

- KYC / onboarding: verification, document upload, setup, pending status.
- Payments / SIP: UPI, SIP setup, debits, failed or pending payments.
- Statements / tax docs: account statements, capital-gains reports, tax reports, download issues.
- Withdrawals / redemption: redemption requests, withdrawal status, payout clarity.
- App performance / login: slow screens, loading, OTP, login, post-update regressions.
- Support: support replies, chat wait time, repeated explanations.

The generated weekly note uses the top three themes only, while the app caps theme grouping at five.

## Deliverables Included

- Working prototype: `app.py`
- Reviews CSV used: `data/reviews_sample_redacted.csv`
- Latest one-page weekly note: `submission/weekly_note.md`
- Email draft text: `submission/email_draft.txt`
- Demo script: `submission/demo_script.md`

## Known Limits

- The bundled CSV is a redacted sample, not a live export.
- Theme grouping is deterministic keyword matching rather than a hosted LLM pipeline.
- The app creates a draft email text but does not connect to Gmail/Outlook.
- Quote selection excludes obvious PII patterns but review exports should still be checked before submission.
