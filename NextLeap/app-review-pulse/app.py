from __future__ import annotations

import re
from collections import Counter
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import streamlit as st


BASE_DIR = Path(__file__).parent
DEFAULT_CSV = BASE_DIR / "data" / "reviews_sample_redacted.csv"
MAX_NOTE_WORDS = 250

THEMES = {
    "KYC / onboarding": [
        "kyc",
        "verification",
        "document",
        "onboarding",
        "setup",
        "account setup",
        "pending",
    ],
    "Payments / SIP": [
        "payment",
        "upi",
        "sip",
        "debit",
        "debited",
        "failed",
        "pending",
        "retry",
        "confirmation",
    ],
    "Statements / tax docs": [
        "statement",
        "capital gains",
        "tax",
        "report",
        "download",
        "document",
    ],
    "Withdrawals / redemption": [
        "withdrawal",
        "withdraw",
        "redemption",
        "redeem",
        "status",
    ],
    "App performance / login": [
        "slow",
        "loading",
        "login",
        "otp",
        "logged out",
        "update",
        "refresh",
    ],
    "Support": [
        "support",
        "chat",
        "reply",
        "queue",
        "repeat",
        "help",
    ],
}

PII_PATTERNS = [
    re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", re.I),
    re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b"),
    re.compile(r"\b(?:\+91[-\s]?)?[6-9]\d{9}\b"),
    re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I),
    re.compile(r"\b(?:otp|pan|aadhaar|account|folio)\s*[:#-]?\s*[A-Z0-9-]{4,}\b", re.I),
]


def remove_pii(text: str) -> str:
    clean = str(text)
    for pattern in PII_PATTERNS:
        clean = pattern.sub("[redacted]", clean)
    return clean


def normalize_reviews(frame: pd.DataFrame) -> pd.DataFrame:
    required = {"platform", "rating", "title", "text", "date"}
    missing = required - set(frame.columns)
    if missing:
        raise ValueError(f"Missing columns: {', '.join(sorted(missing))}")

    reviews = frame.copy()
    reviews["date"] = pd.to_datetime(reviews["date"], errors="coerce").dt.date
    reviews["rating"] = pd.to_numeric(reviews["rating"], errors="coerce").fillna(0).astype(int)
    reviews["title"] = reviews["title"].fillna("").map(remove_pii)
    reviews["text"] = reviews["text"].fillna("").map(remove_pii)
    reviews = reviews.dropna(subset=["date"])
    return reviews


def assign_theme(row: pd.Series) -> str:
    haystack = f"{row['title']} {row['text']}".lower()
    scores = {
        theme: sum(1 for keyword in keywords if keyword in haystack)
        for theme, keywords in THEMES.items()
    }
    best_theme, best_score = max(scores.items(), key=lambda item: item[1])
    return best_theme if best_score else "General product experience"


def theme_summary(reviews: pd.DataFrame) -> pd.DataFrame:
    themed = reviews.copy()
    themed["theme"] = themed.apply(assign_theme, axis=1)
    counts = themed["theme"].value_counts().head(5)
    return themed, counts


def pick_quotes(reviews: pd.DataFrame, top_themes: list[str]) -> list[str]:
    quotes = []
    used_indexes = set()
    for theme in top_themes:
        candidates = reviews[
            (reviews["theme"] == theme)
            & (reviews["text"].str.len().between(35, 180))
        ].sort_values(["rating", "date"], ascending=[True, False])
        if candidates.empty:
            continue
        idx = candidates.index[0]
        used_indexes.add(idx)
        quotes.append(f'"{candidates.loc[idx, "text"]}"')

    if len(quotes) < 3:
        fallback = reviews[
            (~reviews.index.isin(used_indexes))
            & (reviews["text"].str.len().between(35, 180))
        ].sort_values(["rating", "date"], ascending=[True, False])
        for _, row in fallback.head(3 - len(quotes)).iterrows():
            quotes.append(f'"{row["text"]}"')
    return quotes[:3]


def action_ideas(top_themes: list[str]) -> list[str]:
    ideas = {
        "KYC / onboarding": "Add precise KYC failure reasons and a next-step checklist on the pending screen.",
        "Payments / SIP": "Create a payment-status timeline for SIP/order flows with retry and reversal messaging.",
        "Statements / tax docs": "Surface capital-gains and tax reports from the home search and tax-season banner.",
        "Withdrawals / redemption": "Show redemption milestones with expected update times and support escalation.",
        "App performance / login": "Track post-update load-time regressions and add clearer login recovery states.",
        "Support": "Add issue context handoff so users do not repeat the same payment or KYC details.",
        "General product experience": "Tag neutral reviews for UX research and keep the weekly pulse focused on repeated friction.",
    }
    return [ideas[theme] for theme in top_themes[:3]]


def weekly_note(reviews: pd.DataFrame, generated_on: date) -> str:
    themed, counts = theme_summary(reviews)
    top_themes = counts.head(3).index.tolist()
    quotes = pick_quotes(themed, top_themes)
    ideas = action_ideas(top_themes)
    avg_rating = reviews["rating"].mean()
    start = reviews["date"].min()
    end = reviews["date"].max()

    note = [
        f"INDMoney App Review Pulse - Week of {generated_on.isoformat()}",
        f"Window: {start} to {end}; {len(reviews)} public reviews; average rating {avg_rating:.1f}/5.",
        "",
        "Top themes:",
    ]
    note.extend([f"- {theme}: {counts[theme]} reviews" for theme in top_themes])
    note.append("")
    note.append("Real user quotes:")
    note.extend([f"- {quote}" for quote in quotes])
    note.append("")
    note.append("Three action ideas:")
    note.extend([f"- {idea}" for idea in ideas])
    note.append("")
    note.append("No usernames, emails, IDs, or other PII included.")
    return trim_note("\n".join(note))


def trim_note(note: str) -> str:
    words = note.split()
    if len(words) <= MAX_NOTE_WORDS:
        return note
    return " ".join(words[: MAX_NOTE_WORDS - 3]) + " ..."


def email_draft(note: str) -> str:
    return (
        "To: your.alias@example.com\n"
        "Subject: Weekly INDMoney App Review Pulse\n\n"
        "Hi,\n\n"
        "Here is this week's INDMoney app review pulse.\n\n"
        f"{note}\n\n"
        "Thanks,\n"
        "App Review Pulse Assistant\n"
    )


st.set_page_config(page_title="INDMoney App Review Pulse", page_icon="📊", layout="wide")
st.title("INDMoney App Review Pulse")
st.caption("Weekly App Store + Play Store review pulse. No PII. Max 5 themes.")

uploaded = st.file_uploader("Upload review CSV", type=["csv"])
lookback_weeks = st.slider("Review window", min_value=8, max_value=12, value=10)

try:
    if uploaded:
        source = pd.read_csv(uploaded)
    else:
        source = pd.read_csv(DEFAULT_CSV)

    reviews = normalize_reviews(source)
    cutoff = date.today() - timedelta(weeks=lookback_weeks)
    reviews = reviews[reviews["date"] >= cutoff]

    if reviews.empty:
        st.warning("No reviews found in the selected window.")
        st.stop()

    themed_reviews, counts = theme_summary(reviews)
    note = weekly_note(reviews, date.today())
    draft = email_draft(note)

    metric_cols = st.columns(3)
    metric_cols[0].metric("Reviews", len(reviews))
    metric_cols[1].metric("Average rating", f"{reviews['rating'].mean():.1f}/5")
    metric_cols[2].metric("Themes", min(len(counts), 5))

    st.subheader("One-page weekly note")
    st.text_area("Generated note", note, height=300)

    st.subheader("Theme legend")
    st.dataframe(
        pd.DataFrame(
            {"theme": list(THEMES.keys()), "keywords": [", ".join(v) for v in THEMES.values()]}
        ),
        use_container_width=True,
        hide_index=True,
    )

    st.subheader("Email draft")
    st.text_area("Ready to paste into email", draft, height=360)

    st.download_button(
        "Download weekly note",
        note,
        file_name="weekly_note.md",
        mime="text/markdown",
    )
    st.download_button(
        "Download email draft",
        draft,
        file_name="email_draft.txt",
        mime="text/plain",
    )

    st.subheader("Imported reviews")
    st.dataframe(
        themed_reviews[["platform", "rating", "title", "text", "date", "theme"]],
        use_container_width=True,
        hide_index=True,
    )
except Exception as exc:
    st.error(str(exc))
