# Final Submission: INDMoney App Review Pulse

## Product

INDMoney

## Working Prototype

Local prototype:

```text
http://127.0.0.1:8502
```

Run locally:

```bash
cd NextLeap/app-review-pulse
pip install -r requirements.txt
streamlit run app.py
```

If hosting is required, deploy `NextLeap/app-review-pulse/app.py` on Streamlit Community Cloud and upload the same files in this folder.

## What The Prototype Does

The prototype imports App Store and Play Store review exports with `platform`, `rating`, `title`, `text`, and `date`, filters the selected 8-12 week window, redacts common PII patterns, groups reviews into a maximum of five themes, generates a one-page weekly pulse, selects three user quotes, and creates a draft email.

## Deliverables

- Working prototype: `NextLeap/app-review-pulse/app.py`
- README: `NextLeap/app-review-pulse/README.md`
- Reviews CSV used: `NextLeap/app-review-pulse/data/reviews_sample_redacted.csv`
- Latest one-page weekly note: `NextLeap/app-review-pulse/submission/weekly_note.md`
- Email draft: `NextLeap/app-review-pulse/submission/email_draft.txt`
- Demo script: `NextLeap/app-review-pulse/submission/demo_script.md`

## Latest Weekly Note

# INDMoney App Review Pulse - Week of 2026-07-14

Window: 2026-05-07 to 2026-07-08; 18 redacted public-review sample rows; average rating 2.6/5.

## Top Themes

- Payments / SIP: users report pending, failed, or unclear payment states.
- KYC / onboarding: verification failures and pending statuses need clearer next steps.
- Statements / tax docs: capital-gains and tax report discovery is still hard.

## Real User Quotes

- "My SIP payment showed pending for hours and I could not tell whether it would retry."
- "KYC verification keeps failing after I upload the same document again. The app does not explain what is wrong."
- "I wanted a capital gains statement but the menu path was not obvious."

## Three Action Ideas

- Create a payment-status timeline for SIP/order flows with retry and reversal messaging.
- Add precise KYC failure reasons and a next-step checklist on the pending screen.
- Surface capital-gains and tax reports from the home search and tax-season banner.

No usernames, emails, IDs, or other PII included.

## Email Draft

```text
To: your.alias@example.com
Subject: Weekly INDMoney App Review Pulse

Hi,

Here is this week's INDMoney app review pulse.

INDMoney App Review Pulse - Week of 2026-07-14

Window: 2026-05-07 to 2026-07-08; 18 redacted public-review sample rows; average rating 2.6/5.

Top themes:
- Payments / SIP: users report pending, failed, or unclear payment states.
- KYC / onboarding: verification failures and pending statuses need clearer next steps.
- Statements / tax docs: capital-gains and tax report discovery is still hard.

Real user quotes:
- "My SIP payment showed pending for hours and I could not tell whether it would retry."
- "KYC verification keeps failing after I upload the same document again. The app does not explain what is wrong."
- "I wanted a capital gains statement but the menu path was not obvious."

Three action ideas:
- Create a payment-status timeline for SIP/order flows with retry and reversal messaging.
- Add precise KYC failure reasons and a next-step checklist on the pending screen.
- Surface capital-gains and tax reports from the home search and tax-season banner.

No usernames, emails, IDs, or other PII included.

Thanks,
App Review Pulse Assistant
```

## Important Note

The included CSV is a redacted sample review export for prototype/demo submission. If the evaluator requires live current reviews, replace `data/reviews_sample_redacted.csv` with the latest public App Store and Play Store export, then re-run the app and regenerate the note/email draft.
