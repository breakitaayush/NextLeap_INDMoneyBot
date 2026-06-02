import csv
import json
import os
import re
from pathlib import Path

import requests
import streamlit as st


LAST_CHECKED = "2026-06-02"
BASE_DIR = Path(__file__).parent
SOURCE_FILE = BASE_DIR / "source_list.csv"
CORPUS_DIR = BASE_DIR / "corpus"


def read_setting(name, default=""):
    env_value = os.getenv(name)
    if env_value is not None:
        return env_value
    try:
        return str(st.secrets.get(name, default))
    except Exception:
        return default


USE_AI = read_setting("USE_AI").lower() in {"1", "true", "yes", "on"}
ANTHROPIC_API_KEY = read_setting("ANTHROPIC_API_KEY")
ANTHROPIC_MODEL = read_setting("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")

DISCLAIMER = (
    "This assistant provides factual mutual fund information from official public sources only. "
    "It does not provide investment advice, portfolio recommendations, return comparisons, or "
    "buy/sell/hold suggestions. Do not enter PAN, Aadhaar, OTPs, account numbers, emails, or phone numbers."
)

PII_PATTERNS = [
    re.compile(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", re.I),  # PAN
    re.compile(r"\b\d{4}\s?\d{4}\s?\d{4}\b"),  # Aadhaar-like
    re.compile(r"\b(?:\+91[-\s]?)?[6-9]\d{9}\b"),  # India phone
    re.compile(r"\b(?:account|acct|folio)\s+(?:number|no|id)\b", re.I),
    re.compile(r"\b(?:account|acct|folio)\s*[:#-]?\s*\d{4,}\b", re.I),
    re.compile(r"\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b", re.I),
    re.compile(r"\botp\b|\baadhaar\b|\bpan\b", re.I),
]

ADVICE_PATTERNS = re.compile(
    r"\b(should i|should we|buy|sell|hold|switch|best|better|compare|"
    r"recommend|recommendation|portfolio|good returns?|will .*return|beat|outperform)\b",
    re.I,
)

PERFORMANCE_PATTERNS = re.compile(r"\b(return|returns|cagr|performance|profit|loss|alpha|xirr)\b", re.I)


def load_sources():
    with SOURCE_FILE.open(newline="", encoding="utf-8") as handle:
        return list(csv.DictReader(handle))


SOURCES = load_sources()
SOURCE_BY_ID = {row["id"]: row for row in SOURCES}


def source_link(source_id):
    row = SOURCE_BY_ID[source_id]
    return f"[{row['source_type']}: {row['scheme_or_topic']}]({row['url']})"


def plain_source(source_id):
    row = SOURCE_BY_ID[source_id]
    return f"{row['source_type']}: {row['scheme_or_topic']} - {row['url']}"


FACTS = [
    {
        "schemes": ["hdfc flexi cap fund", "hdfc flexi", "flexi cap"],
        "topics": ["exit load", "load", "fee", "charge", "redeem", "redemption", "withdraw", "withdrawal"],
        "answer": "HDFC Flexi Cap Fund has a 1.00% exit load if units are redeemed or switched out within 1 year from allotment, and no exit load after 1 year.",
        "sources": ["4"],
    },
    {
        "schemes": ["hdfc flexi cap fund", "hdfc flexi", "flexi cap"],
        "topics": ["minimum sip", "min sip", "sip amount"],
        "answer": "The minimum SIP amount for HDFC Flexi Cap Fund is INR 100, or as specified by the scheme.",
        "sources": ["4"],
    },
    {
        "schemes": ["hdfc flexi cap fund", "hdfc flexi", "flexi cap"],
        "topics": ["benchmark"],
        "answer": "HDFC Flexi Cap Fund is benchmarked against the NIFTY 500 Total Returns Index (TRI).",
        "sources": ["4"],
    },
    {
        "schemes": ["hdfc flexi cap fund", "hdfc flexi", "flexi cap"],
        "topics": ["riskometer", "risk"],
        "answer": "HDFC Flexi Cap Fund is labelled Very High risk on the HDFC Mutual Fund scheme page.",
        "sources": ["4"],
    },
    {
        "schemes": ["hdfc flexi cap fund", "hdfc flexi", "flexi cap"],
        "topics": ["expense ratio", "expense", "ter"],
        "answer": "For the latest expense ratio of HDFC Flexi Cap Fund, use HDFC Mutual Fund's official Total Expense Ratio disclosure or the latest factsheet.",
        "sources": ["6", "7"],
    },
    {
        "schemes": ["hdfc top 100 fund", "hdfc top 100", "hdfc large cap fund", "hdfc large cap", "top 100", "large cap"],
        "topics": ["exit load", "load", "fee", "charge", "redeem", "redemption", "withdraw", "withdrawal"],
        "answer": "HDFC Large Cap Fund, formerly HDFC Top 100 Fund, has a 1.00% exit load if units are redeemed or switched out within 1 year from allotment, and no exit load after 1 year.",
        "sources": ["1"],
    },
    {
        "schemes": ["hdfc top 100 fund", "hdfc top 100", "hdfc large cap fund", "hdfc large cap", "top 100", "large cap"],
        "topics": ["minimum sip", "min sip", "sip amount"],
        "answer": "The minimum SIP amount shown for HDFC Large Cap Fund, formerly HDFC Top 100 Fund, is INR 100.",
        "sources": ["1"],
    },
    {
        "schemes": ["hdfc top 100 fund", "hdfc top 100", "hdfc large cap fund", "hdfc large cap", "top 100", "large cap"],
        "topics": ["benchmark"],
        "answer": "HDFC Large Cap Fund, formerly HDFC Top 100 Fund, is benchmarked against the NIFTY 100 Total Return Index.",
        "sources": ["1"],
    },
    {
        "schemes": ["hdfc top 100 fund", "hdfc top 100", "hdfc large cap fund", "hdfc large cap", "top 100", "large cap"],
        "topics": ["riskometer", "risk"],
        "answer": "HDFC Large Cap Fund, formerly HDFC Top 100 Fund, is labelled Very High risk on the HDFC Mutual Fund scheme page.",
        "sources": ["1"],
    },
    {
        "schemes": ["hdfc top 100 fund", "hdfc top 100", "hdfc large cap fund", "hdfc large cap", "top 100", "large cap"],
        "topics": ["expense ratio", "expense", "ter"],
        "answer": "The HDFC scheme page showed a TER of 1.59 for HDFC Large Cap Fund, formerly HDFC Top 100 Fund, in the checked source.",
        "sources": ["1"],
    },
    {
        "schemes": ["hdfc elss tax saver fund", "hdfc elss tax saver", "hdfc elss", "elss", "tax saver"],
        "topics": ["lock-in", "lock in", "lockin"],
        "answer": "HDFC ELSS Tax Saver has a statutory lock-in period of 3 years.",
        "sources": ["9"],
    },
    {
        "schemes": ["hdfc elss tax saver fund", "hdfc elss tax saver", "hdfc elss", "elss", "tax saver"],
        "topics": ["minimum sip", "min sip", "sip amount"],
        "answer": "For HDFC ELSS Tax Saver, SIP and lump sum investments are permitted with a minimum application amount of INR 500.",
        "sources": ["9"],
    },
    {
        "schemes": ["hdfc elss tax saver fund", "hdfc elss tax saver", "hdfc elss", "elss", "tax saver"],
        "topics": ["expense ratio", "expense", "ter"],
        "answer": "The HDFC scheme page showed a TER of 1.70 for HDFC ELSS Tax Saver in the checked source.",
        "sources": ["9"],
    },
    {
        "schemes": ["hdfc elss tax saver fund", "hdfc elss tax saver", "hdfc elss", "elss", "tax saver"],
        "topics": ["riskometer", "risk"],
        "answer": "HDFC ELSS Tax Saver is labelled Very High risk on the HDFC Mutual Fund scheme page.",
        "sources": ["10"],
    },
    {
        "schemes": ["hdfc balanced advantage fund", "hdfc balanced advantage", "balanced advantage"],
        "topics": ["exit load", "load", "fee", "charge", "redeem", "redemption", "withdraw", "withdrawal"],
        "answer": "For HDFC Balanced Advantage Fund, 15% of units may be redeemed without exit load; redemptions above that limit attract 1.00% exit load within 1 year and no exit load after 1 year.",
        "sources": ["13"],
    },
    {
        "schemes": ["hdfc balanced advantage fund", "hdfc balanced advantage", "balanced advantage"],
        "topics": ["minimum sip", "min sip", "sip amount"],
        "answer": "HDFC Balanced Advantage Fund permits SIP and lump sum investments with a minimum application amount of INR 100.",
        "sources": ["13"],
    },
    {
        "schemes": ["hdfc balanced advantage fund", "hdfc balanced advantage", "balanced advantage"],
        "topics": ["riskometer", "risk"],
        "answer": "HDFC Balanced Advantage Fund is labelled Very High risk on the HDFC Mutual Fund scheme page.",
        "sources": ["13"],
    },
]

LINK_TOPICS = [
    {
        "topics": ["factsheet", "fact sheet"],
        "answer": "You can find the latest HDFC Mutual Fund factsheets on the official factsheet page and on each scheme page's downloads section.",
        "sources": ["7"],
    },
    {
        "topics": ["kim", "key information memorandum"],
        "answer": "You can find official HDFC Mutual Fund KIM documents on HDFC's fund documents page.",
        "sources": ["18"],
    },
    {
        "topics": ["sid", "scheme information document"],
        "answer": "You can find official HDFC Mutual Fund SID documents on HDFC's fund documents page.",
        "sources": ["17"],
    },
    {
        "topics": ["capital gains statement", "capital gain statement", "capital-gains statement", "capital-gain statement"],
        "answer": "HDFC Mutual Fund says capital gain statements can be accessed through AMC websites or through official CAS routes; do not enter personal identifiers in this demo.",
        "sources": ["16", "15"],
    },
    {
        "topics": ["account statement", "cas", "consolidated account statement"],
        "answer": "HDFC Mutual Fund's account statement page says investors can download PAN-based or folio-based account statements from its official statement service.",
        "sources": ["15"],
    },
]

SOURCE_HINTS = [
    {
        "source_id": "4",
        "terms": ["hdfc flexi cap fund", "hdfc flexi", "flexi cap"],
        "file": "hdfc_flexi_cap.md",
    },
    {
        "source_id": "9",
        "terms": ["hdfc elss tax saver fund", "hdfc elss tax saver", "hdfc elss", "elss", "tax saver"],
        "file": "hdfc_elss.md",
    },
    {
        "source_id": "13",
        "terms": ["hdfc balanced advantage fund", "hdfc balanced advantage", "balanced advantage"],
        "file": "hdfc_balanced_advantage.md",
    },
    {
        "source_id": "1",
        "terms": ["hdfc top 100 fund", "hdfc top 100", "hdfc large cap fund", "hdfc large cap", "top 100", "large cap"],
        "file": "hdfc_top_100.md",
    },
    {
        "source_id": "16",
        "terms": ["capital gains", "capital gain", "statement", "cas", "account statement"],
        "file": "statements.md",
    },
    {
        "source_id": "17",
        "terms": ["sid", "scheme information document"],
        "file": "statements.md",
    },
    {
        "source_id": "18",
        "terms": ["kim", "key information memorandum"],
        "file": "statements.md",
    },
    {
        "source_id": "7",
        "terms": ["factsheet", "fact sheet"],
        "file": "statements.md",
    },
]

TOPIC_TERMS = [
    "expense ratio",
    "expense",
    "ter",
    "exit load",
    "fee",
    "charge",
    "redeem",
    "redemption",
    "withdraw",
    "withdrawal",
    "minimum sip",
    "min sip",
    "sip amount",
    "lock-in",
    "lock in",
    "lockin",
    "benchmark",
    "riskometer",
    "risk",
    "factsheet",
    "fact sheet",
    "kim",
    "sid",
    "capital gains",
    "capital gain",
    "account statement",
    "cas",
    "statement",
]

SCHEME_SPECIFIC_TERMS = [
    "expense ratio",
    "expense",
    "ter",
    "exit load",
    "fee",
    "charge",
    "redeem",
    "redemption",
    "withdraw",
    "withdrawal",
    "minimum sip",
    "min sip",
    "sip amount",
    "lock-in",
    "lock in",
    "lockin",
    "benchmark",
    "riskometer",
    "risk",
]

INTENT_TOPICS = {
    "expense_ratio": ["expense ratio", "expense", "ter"],
    "exit_load": ["exit load", "load", "fee", "charge", "redeem", "redemption", "withdraw", "withdrawal"],
    "minimum_sip": ["minimum sip", "min sip", "sip amount"],
    "lock_in": ["lock-in", "lock in", "lockin"],
    "benchmark": ["benchmark"],
    "riskometer": ["riskometer", "risk"],
    "factsheet": ["factsheet", "fact sheet"],
    "kim": ["kim", "key information memorandum"],
    "sid": ["sid", "scheme information document"],
    "capital_gains_statement": [
        "capital gains statement",
        "capital gain statement",
        "capital-gains statement",
        "capital-gain statement",
    ],
    "account_statement": ["account statement", "cas", "consolidated account statement"],
}

SCHEME_OPTIONS = {
    "hdfc_flexi_cap": ["hdfc flexi cap fund", "hdfc flexi", "flexi cap"],
    "hdfc_elss_tax_saver": ["hdfc elss tax saver fund", "hdfc elss tax saver", "hdfc elss", "elss", "tax saver"],
    "hdfc_balanced_advantage": ["hdfc balanced advantage fund", "hdfc balanced advantage", "balanced advantage"],
    "hdfc_top_100": ["hdfc top 100 fund", "hdfc top 100", "hdfc large cap fund", "hdfc large cap", "top 100", "large cap"],
}

GLOBAL_TOPIC_SOURCES = {
    "factsheet": "7",
    "kim": "18",
    "sid": "17",
    "capital_gains_statement": "16",
    "account_statement": "15",
}


def has_pii(text):
    return any(pattern.search(text) for pattern in PII_PATTERNS)


def term_in_text(term, text):
    pattern = r"(?<![a-z0-9])" + re.escape(term).replace(r"\ ", r"[\s-]+") + r"(?![a-z0-9])"
    return re.search(pattern, text, re.I) is not None


def has_supported_scheme(text):
    return any(
        any(term_in_text(scheme, text) for scheme in fact["schemes"])
        for fact in FACTS
    )


def has_supported_topic(text):
    return any(term_in_text(term, text) for term in TOPIC_TERMS)


def has_scheme_specific_topic(text):
    return any(term_in_text(term, text) for term in SCHEME_SPECIFIC_TERMS)


def fact_matches_intent(fact, topic, scheme):
    topic_terms = INTENT_TOPICS.get(topic, [])
    scheme_terms = SCHEME_OPTIONS.get(scheme, [])
    return (
        any(term in fact["topics"] for term in topic_terms)
        and any(term in fact["schemes"] for term in scheme_terms)
    )


def answer_from_intent(intent):
    topic = intent.get("topic")
    scheme = intent.get("scheme")

    if topic in GLOBAL_TOPIC_SOURCES:
        for item in LINK_TOPICS:
            if any(term in item["topics"] for term in INTENT_TOPICS[topic]):
                return format_answer(item["answer"], item["sources"])

    if topic and not scheme:
        return format_answer(
            "Please include one supported scheme name: HDFC Flexi Cap Fund, HDFC ELSS Tax Saver Fund, HDFC Balanced Advantage Fund, or HDFC Top 100 Fund.",
            ["20"],
        )

    for fact in FACTS:
        if fact_matches_intent(fact, topic, scheme):
            return format_answer(fact["answer"], fact["sources"])

    return None


def format_answer(answer, source_ids):
    link = source_link(source_ids[0])
    return f"{answer} Source: {link}. Last updated from sources: {LAST_CHECKED}."


def clean_ai_answer(answer):
    answer = " ".join(answer.strip().split())
    answer = re.sub(r"\s*Last updated from sources:.*$", "", answer, flags=re.I)
    answer = re.sub(r"\s*Source:.*$", "", answer, flags=re.I)
    return answer.strip()


def retrieve_context(question):
    text = question.lower()
    matched_topics = [term for term in TOPIC_TERMS if term_in_text(term, text)]
    if not matched_topics:
        return None

    best_hint = None
    best_score = 0
    for hint in SOURCE_HINTS:
        score = sum(1 for term in hint["terms"] if term_in_text(term, text))
        if score > best_score:
            best_hint = hint
            best_score = score

    if not best_hint:
        return None

    corpus_path = CORPUS_DIR / best_hint["file"]
    if not corpus_path.exists():
        return None

    return {
        "source_id": best_hint["source_id"],
        "source": plain_source(best_hint["source_id"]),
        "content": corpus_path.read_text(encoding="utf-8"),
    }


def ask_claude(question, context):
    prompt = f"""
You are the INDMoney Mutual Fund Facts Assistant.
Answer only the user's factual mutual fund question using the official-source context below.
Do not provide investment advice, suitability opinions, return predictions, portfolio guidance, or comparisons.
Do not request or use PAN, Aadhaar, OTPs, emails, phone numbers, folio numbers, or account numbers.
Keep the answer to one sentence. Do not include citations or last-updated text; the app adds those.
If the context does not contain the answer, say: I could not find that fact in the selected official-source corpus.

Question: {question}

Official-source context:
{context["content"]}
""".strip()

    response = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": ANTHROPIC_MODEL,
            "max_tokens": 140,
            "temperature": 0,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=20,
    )
    response.raise_for_status()
    data = response.json()
    text_blocks = [
        block.get("text", "")
        for block in data.get("content", [])
        if block.get("type") == "text"
    ]
    return clean_ai_answer(" ".join(text_blocks))


def classify_intent_with_claude(question):
    if not USE_AI or not ANTHROPIC_API_KEY:
        return None

    prompt = f"""
Map the user's mutual fund question to one supported intent.
The question may use different wording or another language.
Return only compact JSON with keys: topic, scheme.

Allowed topics:
- expense_ratio
- exit_load
- minimum_sip
- lock_in
- benchmark
- riskometer
- factsheet
- kim
- sid
- capital_gains_statement
- account_statement
- out_of_scope

Allowed schemes:
- hdfc_flexi_cap
- hdfc_elss_tax_saver
- hdfc_balanced_advantage
- hdfc_top_100
- null

Use scheme null for global document/statement questions or when the scheme is missing.
Use out_of_scope for advice, comparisons, buy/sell/hold, predictions, or facts outside the supported topics.

Question: {question}
""".strip()

    try:
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": ANTHROPIC_MODEL,
                "max_tokens": 80,
                "temperature": 0,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=12,
        )
        response.raise_for_status()
    except requests.RequestException:
        return None

    data = response.json()
    text = " ".join(
        block.get("text", "")
        for block in data.get("content", [])
        if block.get("type") == "text"
    ).strip()
    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        return None

    try:
        intent = json.loads(match.group(0))
    except json.JSONDecodeError:
        return None

    topic = intent.get("topic")
    scheme = intent.get("scheme")
    if topic not in set(INTENT_TOPICS) | {"out_of_scope"}:
        return None
    if scheme not in set(SCHEME_OPTIONS) | {None}:
        return None
    return {"topic": topic, "scheme": scheme}


def answer_with_ai(question):
    if not USE_AI or not ANTHROPIC_API_KEY:
        return None

    context = retrieve_context(question)
    if not context:
        return None

    try:
        answer = ask_claude(question, context)
    except requests.RequestException:
        return None

    if not answer:
        return None
    return format_answer(answer, [context["source_id"]])


def answer_question(question):
    text = question.strip().lower()
    if not text:
        return "Ask a factual question about the selected HDFC Mutual Fund schemes."

    if has_pii(question):
        return format_answer(
            "Please do not enter PAN, Aadhaar, OTPs, phone numbers, emails, folio numbers, or account numbers; this assistant only answers general factual questions from public sources.",
            ["20"],
        )

    if PERFORMANCE_PATTERNS.search(text):
        return format_answer(
            "I do not calculate or compare returns; you can refer to official factsheets for disclosed scheme performance information.",
            ["7"],
        )

    if ADVICE_PATTERNS.search(text):
        return format_answer(
            "I can only provide factual information from official sources and cannot give investment advice; you may refer to AMFI investor education resources.",
            ["21"],
        )

    for item in LINK_TOPICS:
        if any(term_in_text(topic, text) for topic in item["topics"]):
            return format_answer(item["answer"], item["sources"])

    for fact in FACTS:
        if any(term_in_text(scheme, text) for scheme in fact["schemes"]) and any(term_in_text(topic, text) for topic in fact["topics"]):
            return format_answer(fact["answer"], fact["sources"])

    ai_answer = answer_with_ai(question)
    if ai_answer:
        return ai_answer

    intent = classify_intent_with_claude(question)
    if intent and intent["topic"] != "out_of_scope":
        intent_answer = answer_from_intent(intent)
        if intent_answer:
            return intent_answer
    if intent and intent["topic"] == "out_of_scope":
        return format_answer(
            "I could not find that fact in the selected official-source corpus.",
            ["20"],
        )

    if has_scheme_specific_topic(text) and not has_supported_scheme(text):
        return format_answer(
            "Please include one supported scheme name: HDFC Flexi Cap Fund, HDFC ELSS Tax Saver Fund, HDFC Balanced Advantage Fund, or HDFC Top 100 Fund.",
            ["20"],
        )

    return format_answer(
        "I could not find that fact in the selected corpus. Try asking about expense ratio, exit load, minimum SIP, lock-in, benchmark, riskometer, factsheet, KIM, SID, or statements.",
        ["20"],
    )


st.set_page_config(page_title="INDMoney Mutual Fund Facts Assistant", page_icon="IN", layout="centered")

st.title("INDMoney Mutual Fund Facts Assistant")
st.caption("Facts-only. No investment advice.")
st.caption("AI mode: enabled" if USE_AI and ANTHROPIC_API_KEY else "AI mode: off")

st.info("Welcome to the INDMoney Mutual Fund Facts Assistant.")
st.write(DISCLAIMER)

examples = [
    "What is the exit load of HDFC Flexi Cap Fund?",
    "What is the lock-in period for HDFC ELSS Tax Saver Fund?",
    "How can I download a capital gains statement?",
]

st.markdown(
    "\n".join(f"{index}. {example}" for index, example in enumerate(examples, start=1))
)
selected = st.selectbox("Example questions", [""] + examples)

with st.form("question_form"):
    question = st.text_input("Ask a factual mutual fund question", value=selected)
    submitted = st.form_submit_button("Answer", type="primary")

if submitted:
    with st.spinner("Checking official-source corpus..."):
        st.markdown(answer_question(question))

with st.expander("Selected scope"):
    st.markdown(
        """
- Product chosen: INDMoney
- AMC: HDFC Mutual Fund
- Schemes: HDFC Top 100 Fund / HDFC Large Cap Fund, HDFC Flexi Cap Fund, HDFC ELSS Tax Saver, HDFC Balanced Advantage Fund
- Sources: official HDFC Mutual Fund, SEBI, and AMFI public pages only
- AI mode: optional Claude API summarization from retrieved official-source corpus only
"""
    )
