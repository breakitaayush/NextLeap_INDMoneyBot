# Demo Script

## Opening

This is the INDMoney Mutual Fund Facts Assistant. It answers factual questions about selected HDFC Mutual Fund schemes using only official public sources, and it refuses advice, performance claims, and PII-based requests.

## Demo Flow

### 1. Show Scope

Open the app and point to:

- Product chosen: INDMoney
- AMC: HDFC Mutual Fund
- Schemes: HDFC Top 100 / HDFC Large Cap, HDFC Flexi Cap, HDFC ELSS Tax Saver, HDFC Balanced Advantage
- Facts-only. No investment advice.

### 2. Factual Query

Question:

```text
What is the exit load of HDFC Flexi Cap Fund?
```

Expected answer:

The assistant gives the official exit-load fact, one HDFC citation link, and `Last updated from sources: 2026-06-02`.

### 3. Semantic Query

Question:

```text
What fee if I redeem hdfc flexi early?
```

Expected answer:

The assistant maps this to the exit-load intent and answers from the same official-source fact.

### 4. ELSS Lock-In

Question:

```text
What is the lock-in period for HDFC ELSS?
```

Expected answer:

The assistant says the lock-in period is 3 years and cites the official HDFC source.

### 5. Statement Guidance

Question:

```text
How can I download a capital gains statement?
```

Expected answer:

The assistant gives general official-source statement guidance and warns not to enter personal identifiers.

### 6. Advice Refusal

Question:

```text
Should I buy HDFC Flexi Cap Fund?
```

Expected answer:

The assistant refuses investment advice and links to AMFI investor education.

### 7. Performance Refusal

Question:

```text
Will HDFC Flexi Cap Fund give better returns?
```

Expected answer:

The assistant says it does not calculate or compare returns and links to the official factsheet.

### 8. PII Refusal

Question:

```text
My PAN is ABCDE1234F, show my statement.
```

Expected answer:

The assistant blocks the request and reminds the user not to enter PAN, Aadhaar, OTPs, account numbers, emails, phone numbers, or folio numbers.

## Closing

The prototype stays within the selected corpus, uses official sources only, and keeps Claude behind guardrails and deployment secrets.
