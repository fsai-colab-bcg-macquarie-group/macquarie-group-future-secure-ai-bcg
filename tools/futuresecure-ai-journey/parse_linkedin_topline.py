#!/usr/bin/env python3
"""Classify a LinkedIn people-search topline into public, non-profile aggregates.

Does not fetch LinkedIn. Input is a paste of search cards (name + headline only).
Mutual-connection names and degree labels are discarded.
"""

from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "docs/data/linkedin-search-raw.txt"
OUT = ROOT / "docs/data/charts.json"

CTA = {"connect", "follow", "message"}
DEGREE = re.compile(r"^(·\s*)?\d+(nd|rd)\+?\s*(degree connection)?$", re.I)
DEGREE_IN_NAME = re.compile(r"\s+\d+(nd|rd)\+?\s+degree connection\s*$", re.I)
MUTUAL = re.compile(r"mutual connection", re.I)
SERVICES = re.compile(r"^Provides services", re.I)
FOLLOWERS = re.compile(r"^([\d.]+[KMB]?)\s+followers", re.I)
FSAI_NAME = re.compile(
    r"future\s*secure\s*ai|futuresecure\s*ai|futuresecureai|\bfsai\b|"
    r"future\s*secure\s*al\b|future\s*secure\s+wave",
    re.I,
)
OTHER_FIRM = re.compile(
    r"\b(macquarie group|hey\s*doc|amazon\b|google\b|honey\b|future secure providers|"
    r"future secure surveilance|future secure surveillance)\b",
    re.I,
)
LEADERSHIP = {
    "mehrdad baghai",
    "michael hunter",
    "tiernan o’rourke",
    "tiernan o'rourke",
    "brendan mckeegan",
    "belkis vasquez-mccall",
    "shazia juma ross",
    "jim lambright",
    "patrick forth",
    "andrew trahair",
    "angela sloan",
    "paul sainsbury",
    "ali rod khadem",
    "jennifer lacoon",
    "goy phumtim",
    "shaun hillin",
    "shaun h.",
    "aliya valiyff",
    "tj mead",
    "caleb sawade",
    "cody collins",
    "jason bender",
    "david kari",
    "ricardo lamas",
    "joshua kim",
    "mike karim",
    "jeremy drumm",
    "sarah ryerson",
    "nazneen saleem",
    "naz saleem",
    "zane kung faust",
    "zane kung-faust",
    "rachel swift",
    "dr rachel swift",
    "kellie nuttall",
    "dr kellie nuttall",
    "ariane garside",
    "steve carlisle",
    "oliver lewis",
    "artur kaluza",
    "oliver sloman",
    "ollie sloman",
    "todd hewlin",
    "craig meller",
}

SKIP_HEADLINE = re.compile(
    r"^(car mantenance|tessy|lunch anyone\?|work|-$|strategic disruptor)$",
    re.I,
)


def norm_name(name: str) -> str:
    return re.sub(r"\s+", " ", name).replace("\u034e", "").strip().lower()


def parse_raw(text: str) -> list[dict]:
    lines = [ln.strip() for ln in text.splitlines()]
    cards: list[dict] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line or line.lower() in CTA or DEGREE.match(line) or MUTUAL.search(line) or SERVICES.match(line):
            i += 1
            continue
        if FOLLOWERS.match(line):
            i += 1
            continue
        name = DEGREE_IN_NAME.sub("", line).strip()
        if name.lower() in CTA:
            i += 1
            continue
        headline = ""
        followers = None
        cta = None
        hiring = " is hiring" in line.lower()
        open_to_work = "open to work" in line.lower()
        name = re.sub(r"\s+is hiring$", "", name, flags=re.I)
        name = re.sub(r"\s+is open to work$", "", name, flags=re.I)
        j = i + 1
        while j < len(lines):
            nxt = lines[j].strip()
            if not nxt:
                j += 1
                if headline:
                    break
                continue
            if DEGREE_IN_NAME.search(nxt) or DEGREE.match(nxt):
                j += 1
                continue
            if MUTUAL.search(nxt) or SERVICES.match(nxt):
                j += 1
                continue
            fm = FOLLOWERS.match(nxt)
            if fm:
                followers = nxt.split("followers")[0].replace("•", "").strip()
                j += 1
                continue
            if nxt.lower() in CTA:
                cta = nxt.title()
                j += 1
                break
            if not headline:
                headline = nxt
                j += 1
                continue
            # second headline-like line (rare); stop
            break
        if name:
            cards.append(
                {
                    "name": name,
                    "headline": headline,
                    "followers": followers,
                    "hiring": hiring or "is hiring" in headline.lower(),
                    "open_to_work": open_to_work,
                    "cta": cta,
                    "anon": name.lower() == "linkedin member",
                }
            )
        i = max(j, i + 1)
    # de-dupe by normalised name + headline
    seen: set[tuple[str, str]] = set()
    out = []
    for c in cards:
        key = (norm_name(c["name"]), c["headline"].lower())
        if key in seen:
            continue
        seen.add(key)
        out.append(c)
    return out


def role_family(headline: str) -> str:
    h = headline.lower()
    if SKIP_HEADLINE.match(headline.strip()):
        return "Unclassified / other"
    if re.search(r"talent|recruit|people & culture|chro|hr ops|human resources|sourcer", h):
        return "Talent / people"
    if re.search(r"qa|quality|test engineer|sdet|uat |testrail", h):
        return "Quality engineering"
    if re.search(r"legal|counsel|risk & compliance|fp&a|cfo|finance leader|cpa\b|cfa\b", h):
        return "Legal / risk / finance"
    if re.search(r"product owner|product manager|business analyst|scrum|agile delivery|iteration|engagement lead|delivery lead|delivery manager|program manager", h):
        return "Delivery / product / BA"
    if re.search(r"sre|devops|platform engineer|kubernetes|cloud architect|site reliability", h):
        return "Platform / SRE / cloud"
    if re.search(r"design|ux lead|graphic designer", h) and "ai" not in h[:20]:
        return "Design"
    if re.search(
        r"ai engineer|ai/ml|data scien|machine learning|llm|agentic|co-worker|co worker|genai|nlp\b|staff ai|principal ai|ai build|ai architect|mlops|llmops",
        h,
    ):
        return "AI / ML / data"
    if re.search(r"software engineer|full.?stack|backend|frontend|tech lead|engineering manager", h):
        return "Software engineering"
    if re.search(r"chief|co-founder|co-ceo|president|coo\b|cdo\b|cto\b|ciso|chief of staff", h):
        return "C-suite / founders"
    if re.search(r"director|executive", h):
        return "Directors / executives"
    if re.search(r"operations|enablement|coordinator|executive assistant", h):
        return "Operations"
    return "Unclassified / other"


def seniority(headline: str) -> str:
    h = headline.lower()
    if re.search(r"intern\b", h):
        return "Intern"
    if re.search(r"co-founder|co-ceo|chief |president|chro|cpo\b|cfo\b|coo\b|cto\b|ciso|chief of staff", h):
        return "C-suite"
    if re.search(r"evp|executive vice|group executive|executive director|senior director|sr director|head of", h):
        return "Exec / head"
    if re.search(r"\bdirector\b|vice president|\bvp\b", h):
        return "Director / VP"
    if re.search(r"principal |staff ", h):
        return "Staff / principal"
    if re.search(r"lead |leader|head of|team lead|manager", h):
        return "Lead / manager"
    if re.search(r"senior |snr |sr\.", h):
        return "Senior"
    return "Individual contributor"


PRIOR_FIRMS = (
    ("McKinsey", re.compile(r"McKinsey", re.I)),
    ("BCG", re.compile(r"\bBCG\b|Boston Consulting", re.I)),
    ("Deloitte", re.compile(r"Deloitte", re.I)),
    ("Macquarie", re.compile(r"Macquarie", re.I)),
    ("Cohere", re.compile(r"\bCohere\b", re.I)),
    ("Apple", re.compile(r"\bApple\b", re.I)),
    ("Netflix", re.compile(r"\bNetflix\b", re.I)),
    ("Google", re.compile(r"\bGoogle\b", re.I)),
    ("AWS", re.compile(r"\bAWS\b|Amazon Web Services", re.I)),
    ("AMP", re.compile(r"\bAMP\b", re.I)),
    ("PayPal", re.compile(r"PayPal", re.I)),
    ("Oracle", re.compile(r"\bOracle\b", re.I)),
    ("A&O Shearman", re.compile(r"A&O|Shearman", re.I)),
)

STACK = re.compile(
    r"python|kubernetes|k8s|langgraph|langfuse|n8n|rag\b|node\.?js|react|terraform|"
    r"playwright|selenium|nlp\b|llmops|mlops|postgres|golang|\bgo\b|fastapi|kafka",
    re.I,
)
SLOGAN = re.compile(
    r"building ai co-?workers|building ai workers|enterprise ai coworkers|"
    r"transforming enterprises with ai|embedding ai co-workers",
    re.I,
)


def prior_firms(text: str) -> list[str]:
    return [label for label, rx in PRIOR_FIRMS if rx.search(text)]


def location_tag(headline: str) -> str:
    h = headline.lower()
    if re.search(r"sênior|engenheiro|desenvolvedor|na future", h):
        return "Portuguese (LatAm) title"
    if re.search(r"\bapac\b|sydney|melbourne|brisbane|nv1|australia", h):
        return "APAC word in title"
    if re.search(r"canada|toronto", h):
        return "Canada word in title"
    if re.search(r"\bnam\b|north america|\bus services\b", h):
        return "NAM / US word in title"
    if re.search(r"dubai|middle east|\bbrazil\b|vietnam", h):
        return "Other region word"
    return "No location word"


def competency(headline: str, name: str = "") -> str:
    h = f"{name} {headline}"
    has_stack = bool(STACK.search(h))
    has_slogan = bool(SLOGAN.search(h))
    consulting = bool(re.search(r"McKinsey|\bBCG\b|Deloitte|ex-BCG|ex-McKinsey", h, re.I))
    buyer = bool(re.search(r"Macquarie", h, re.I))
    lab = bool(re.search(r"Cohere|LLM|LangGraph|RAG\b", h, re.I))
    if has_slogan and not has_stack:
        return "Slogan title, no stack"
    if consulting and not has_stack:
        return "Consulting pedigree, no stack"
    if buyer and not has_stack:
        return "Buyer-bank pedigree"
    if has_stack or lab:
        return "Named tools / models"
    if re.search(r"qa|quality|test ", h, re.I):
        return "QA / test"
    if re.search(r"scrum|agile|business analyst|engagement lead|delivery", h, re.I):
        return "Delivery / BA / agile"
    if re.search(r"talent|recruit|sourcer|people", h, re.I):
        return "Hiring / people"
    return "Generic / unspecified"


def classify(card: dict) -> str:
    h = card["headline"]
    n = norm_name(card["name"])
    if FSAI_NAME.search(h) or FSAI_NAME.search(card["name"]):
        return "named_fsai"
    if n in LEADERSHIP:
        return "leadership_page"
    if OTHER_FIRM.search(h):
        return "excluded_other_employer"
    if SKIP_HEADLINE.match(h.strip()) or h.lower() in {"-", ""}:
        return "excluded_noise"
    return "search_adjacent"


FAM_ORDER = [
    "C-suite / founders",
    "Directors / executives",
    "AI / ML / data",
    "Software engineering",
    "Platform / SRE / cloud",
    "Quality engineering",
    "Delivery / product / BA",
    "Talent / people",
    "Legal / risk / finance",
    "Operations",
    "Design",
    "Unclassified / other",
]

COMP_ORDER = [
    "Generic / unspecified",
    "Slogan title, no stack",
    "Consulting pedigree, no stack",
    "Buyer-bank pedigree",
    "Delivery / BA / agile",
    "QA / test",
    "Hiring / people",
    "Named tools / models",
]

# Published leadership page: prior firm × current seat (from site bios, Sep 2026).
LEADERSHIP_BENCH = [
    ("Mehrdad Baghai", "C-suite / founders", "McKinsey"),
    ("Michael Hunter", "C-suite / founders", "Macquarie"),
    ("Todd Hewlin", "C-suite / founders", "McKinsey"),
    ("Tiernan O’Rourke", "C-suite / founders", "Other"),
    ("Brendan McKeegan", "C-suite / founders", "Other"),
    ("Belkis Vasquez-McCall", "C-suite / founders", "McKinsey"),
    ("Shaun Hillin", "C-suite / founders", "Cohere"),
    ("Aliya Valiyff", "C-suite / founders", "BCG"),
    ("TJ Mead", "C-suite / founders", "Netflix"),
    ("Andrew Trahair", "Legal / risk / finance", "A&O Shearman"),
    ("Angela Sloan", "Legal / risk / finance", "Macquarie"),
    ("Ali Rod Khadem", "Legal / risk / finance", "Macquarie"),
    ("Jennifer Lacoon", "Talent / people", "Other"),
    ("Goy Phumtim", "Operations", "Other"),
    ("Shazia Juma Ross", "Directors / executives", "Macquarie"),
    ("Jim Lambright", "Directors / executives", "Other"),
    ("Patrick Forth", "Directors / executives", "BCG"),
    ("Paul Sainsbury", "Directors / executives", "AMP"),
    ("Caleb Sawade", "Delivery / product / BA", "Deloitte"),
    ("Cody Collins", "Platform / SRE / cloud", "AWS"),
    ("Jason Bender", "Directors / executives", "Deloitte"),
    ("David Kari", "Platform / SRE / cloud", "Other"),
    ("Ricardo Lamas", "AI / ML / data", "Other"),
    ("Joshua Kim", "AI / ML / data", "Other"),
    ("Mike Karim", "Legal / risk / finance", "Other"),
    ("Jeremy Drumm", "Directors / executives", "Deloitte"),
    ("Sarah Ryerson", "Directors / executives", "Cohere"),
    ("Naz Saleem", "Directors / executives", "Other"),
    ("Zane Kung-Faust", "Directors / executives", "Deloitte"),
    ("Rachel Swift", "Directors / executives", "BCG"),
    ("Kellie Nuttall", "Directors / executives", "Deloitte"),
    ("Ariane Garside", "Directors / executives", "BCG"),
    ("Steve Carlisle", "Directors / executives", "Deloitte"),
    ("Oliver Lewis", "Directors / executives", "Macquarie"),
    ("Artur Kaluza", "Directors / executives", "Macquarie"),
    ("Ollie Sloman", "Directors / executives", "BCG"),
    ("Craig Meller", "Directors / executives", "AMP"),
]


def stacked_from_pairs(pairs: list[tuple[str, str]], row_order: list[str], col_order: list[str]) -> dict:
    counts: dict[str, Counter] = {e: Counter() for e in col_order}
    for row, col in pairs:
        if col not in counts:
            counts[col] = Counter()
            col_order = col_order + [col]
        counts[col][row] += 1
    return {
        "rows": row_order,
        "columns": col_order,
        "series": {col: [counts[col].get(r, 0) for r in row_order] for col in col_order},
    }


def main() -> None:
    cards = parse_raw(RAW.read_text())
    for c in cards:
        c["bucket"] = classify(c)
        c["family"] = role_family(c["headline"])
        c["seniority"] = seniority(c["headline"])
        c["phd"] = bool(re.search(r"\bph\.?d\.?\b", f"{c['name']} {c['headline']}", re.I))
        c["named_fsai"] = c["bucket"] == "named_fsai"
        c["priors"] = prior_firms(c["headline"])
        c["location"] = location_tag(c["headline"])
        c["competency"] = competency(c["headline"], c["name"])

    buckets = Counter(c["bucket"] for c in cards)
    named = [c for c in cards if c["bucket"] in {"named_fsai", "leadership_page"}]
    mgmt = [c for c in named if c["seniority"] in {"C-suite", "Exec / head", "Director / VP"}]
    ic = [c for c in named if c["seniority"] in {"Senior", "Individual contributor", "Intern"}]

    prior_pairs = []
    prior_pairs_named_only = []
    prior_comp_pairs = []
    for c in named:
        firms = c["priors"] or ["Not stated in headline"]
        for f in firms:
            prior_pairs.append((c["family"], f))
        for f in c["priors"]:
            prior_pairs_named_only.append((c["family"], f))
            prior_comp_pairs.append((c["competency"], f))
    prior_cols = [
        "McKinsey",
        "BCG",
        "Deloitte",
        "Macquarie",
        "Cohere",
        "Apple",
        "Netflix",
        "Google",
        "AWS",
        "Not stated in headline",
    ]
    prior_cols_named = ["McKinsey", "BCG", "Deloitte", "Macquarie", "Cohere", "Apple", "Netflix", "Google", "AWS"]
    lead_pairs = [(fam, firm) for _, fam, firm in LEADERSHIP_BENCH]
    lead_cols = ["McKinsey", "BCG", "Deloitte", "Macquarie", "Cohere", "Netflix", "AWS", "AMP", "A&O Shearman", "Other"]
    fam_named = Counter(c["family"] for c in named)
    lead_fam = Counter(fam for _, fam, _ in LEADERSHIP_BENCH)
    lead_prior = Counter(firm for _, _, firm in LEADERSHIP_BENCH)
    consulting_bank = sum(lead_prior[k] for k in ("McKinsey", "BCG", "Deloitte", "Macquarie"))

    directory = [
        {
            "name": c["name"] if not c["anon"] else "LinkedIn Member (name hidden)",
            "headline": c["headline"],
            "bucket": c["bucket"],
            "family": c["family"],
            "seniority": c["seniority"],
            "phd": c["phd"],
            "priors": c["priors"],
            "location": c["location"],
            "competency": c["competency"],
        }
        for c in named
    ]
    payload = {
        "as_of": "2026-09-10",
        "method": (
            "LinkedIn people-search topline (name + headline only). "
            "No logged-in profile scrape. Mutual connections discarded. "
            "Company-page stats from public search snippets. "
            "Leadership prior firms from the public leadership page bios."
        ),
        "linkedin_company_page": {
            "source": "Public search index of linkedin.com/company/future-secure-ai (Sep 2026)",
            "employees": 282,
            "yoy_percent": 181.9,
            "yoy_people": 211,
            "monthly_growth_percent": 3.8,
            "headquarters": "Austin, Texas, United States",
            "countries": ["Australia", "Brazil", "United States", "Canada", "Vietnam"],
            "industry": "Software Development",
            "type": "Privately Held",
            "size_band": "201-500",
        },
        "ratios": {
            "named": len(named),
            "mgmt_titles": len(mgmt),
            "ic_titles": len(ic),
            "mgmt_share_pct": round(100 * len(mgmt) / max(len(named), 1), 1),
            "slogan_no_stack": sum(1 for c in named if c["competency"] == "Slogan title, no stack"),
            "named_tools": sum(1 for c in named if c["competency"] == "Named tools / models"),
            "consulting_no_stack": sum(1 for c in named if c["competency"] == "Consulting pedigree, no stack"),
            "phd": sum(1 for c in named if c["phd"]),
            "no_location_word": sum(1 for c in named if c["location"] == "No location word"),
            "vietnam_words": sum(1 for c in named if "vietnam" in c["headline"].lower()),
            "clients_named": 5,
            "sectors_claimed": 12,
            "independent_trial_customers": 1,
            "swe_titles": fam_named.get("Software engineering", 0),
            "platform_titles": fam_named.get("Platform / SRE / cloud", 0),
            "ai_titles": fam_named.get("AI / ML / data", 0),
            "director_titles": fam_named.get("Directors / executives", 0),
            "csuite_titles": fam_named.get("C-suite / founders", 0),
            "qa_titles": fam_named.get("Quality engineering", 0),
            "delivery_titles": fam_named.get("Delivery / product / BA", 0),
            "generic": sum(1 for c in named if c["competency"] == "Generic / unspecified"),
            "generic_pct": round(
                100 * sum(1 for c in named if c["competency"] == "Generic / unspecified") / max(len(named), 1), 1
            ),
            "headline_names_a_prior": sum(1 for c in named if c["priors"]),
            "leadership_page_n": len(LEADERSHIP_BENCH),
            "leadership_page_swe": lead_fam.get("Software engineering", 0),
            "leadership_page_ai": lead_fam.get("AI / ML / data", 0),
            "leadership_page_directors": lead_fam.get("Directors / executives", 0),
            "leadership_page_csuite": lead_fam.get("C-suite / founders", 0),
            "leadership_consulting_or_buyer_bank": consulting_bank,
        },
        "search_sample": {
            "cards": len(cards),
            "buckets": dict(buckets),
            "named_or_leadership": len(named),
            "family_named": dict(Counter(c["family"] for c in named)),
            "seniority_named": dict(Counter(c["seniority"] for c in named)),
            "location_named": dict(Counter(c["location"] for c in named)),
            "competency_named": dict(Counter(c["competency"] for c in named)),
            "competency_mgmt": dict(Counter(c["competency"] for c in mgmt)),
        },
        "prior_by_function_headlines": stacked_from_pairs(prior_pairs, FAM_ORDER, prior_cols),
        "prior_by_function_named_priors": stacked_from_pairs(
            prior_pairs_named_only, FAM_ORDER, prior_cols_named
        ),
        "prior_by_function_leadership_page": stacked_from_pairs(lead_pairs, FAM_ORDER, lead_cols),
        "competency_by_function": stacked_from_pairs(
            [(c["family"], c["competency"]) for c in named], FAM_ORDER, COMP_ORDER
        ),
        "prior_by_competency": stacked_from_pairs(prior_comp_pairs, COMP_ORDER, prior_cols_named),
        "function_named": {k: fam_named.get(k, 0) for k in FAM_ORDER},
        "leadership_prior_employers": dict(lead_prior),
        "leadership_bench": [
            {"name": n, "seat": fam, "prior": firm} for n, fam, firm in LEADERSHIP_BENCH
        ],
        "headcount_stories": {
            "labels": [
                "Hewlin: ~40, start of 2025",
                "LinkedIn: 282 − 211 YoY",
                "LinkedIn: 282 ÷ (1 + 181.9%)",
                "LinkedIn widget now",
                "Hewlin: 300+ in 2025",
            ],
            "values": [40, 71, 100, 282, 300],
        },
        "capacity_vs_overlay": {
            "labels": [
                "Software engineering titles",
                "Platform / SRE titles",
                "Named tools / models in title",
                "QA titles",
                "Delivery / BA titles",
                "Director / exec titles",
                "C-suite titles",
                "Slogan-only titles",
            ],
            "values": [
                fam_named.get("Software engineering", 0),
                fam_named.get("Platform / SRE / cloud", 0),
                sum(1 for c in named if c["competency"] == "Named tools / models"),
                fam_named.get("Quality engineering", 0),
                fam_named.get("Delivery / product / BA", 0),
                fam_named.get("Directors / executives", 0),
                fam_named.get("C-suite / founders", 0),
                sum(1 for c in named if c["competency"] == "Slogan title, no stack"),
            ],
        },
        "geo_claimed_vs_titles": {
            "labels": ["Australia", "Brazil", "United States", "Canada", "Vietnam"],
            "claimed_on_widget": [1, 1, 1, 1, 1],
            "title_words": [
                sum(1 for c in named if c["location"] == "APAC word in title"),
                sum(1 for c in named if c["location"] == "Portuguese (LatAm) title"),
                sum(1 for c in named if c["location"] == "NAM / US word in title"),
                sum(1 for c in named if c["location"] == "Canada word in title"),
                sum(1 for c in named if "vietnam" in c["headline"].lower()),
            ],
        },
        "journey_pages": [
            {"path": "/", "title": "Home", "bytes": 190897},
            {"path": "/ai-co-workers", "title": "AI Co-Workers", "bytes": 94502},
            {"path": "/the-red-zone", "title": "The Red Zone", "bytes": 86983},
            {"path": "/sectors", "title": "Sectors", "bytes": 221618},
            {"path": "/customers", "title": "Customers", "bytes": 112480},
            {"path": "/technology", "title": "Technology", "bytes": 88721},
            {"path": "/leadership", "title": "Leadership", "bytes": 131524},
            {"path": "/careers", "title": "Careers", "bytes": 177615},
            {"path": "/privacy", "title": "Privacy", "bytes": 68803},
            {"path": "/404", "title": "404 template", "bytes": 23417},
        ],
        "directory": directory,
    }
    OUT.write_text(json.dumps(payload, indent=2))
    print(f"cards={len(cards)} named={len(named)} mgmt={len(mgmt)} -> {OUT}")
    print("competency", payload["search_sample"]["competency_named"])
    print("location", payload["search_sample"]["location_named"])
    print("ratios", payload["ratios"])


if __name__ == "__main__":
    main()
