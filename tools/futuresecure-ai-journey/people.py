#!/usr/bin/env python3
"""Parse public leadership-page text into a people list."""

from __future__ import annotations

import re

STOP = {
    "Return to top",
    "No items found.",
    "Join us in revolutionizing the future of AI",
    "Apply now",
    "Let's talk.",
    "Home",
    "AI Co-Workers",
    "The Red-Zone",
    "The Red Zone",
    "Sectors",
    "Technology",
    "Customers",
    "Leadership",
    "Careers",
    "Privacy Policy",
    "Show All",
    "Nothing",
    "Evermind",
    "Clients",
    "Newsroom",
    "Contact",
    "About",
    "Work with us",
    "lET'S TALK",
    "en",
}

TITLE_HINT = re.compile(
    r"(?i)\b("
    r"co-founder|co-ceo|chief|president|officer|director|vice president|"
    r"evp|svp|leader|counsel|head of|advisor|chair|partner|"
    r"executive vice|senior vice|group executive|deputy cfo|"
    r"executive director|regional delivery"
    r")\b"
)

EMPLOYERS = (
    ("McKinsey", re.compile(r"McKinsey", re.I)),
    ("Macquarie", re.compile(r"Macquarie", re.I)),
    ("BCG", re.compile(r"\bBCG\b|Boston Consulting", re.I)),
    ("Deloitte", re.compile(r"Deloitte", re.I)),
    ("Cohere", re.compile(r"\bCohere\b", re.I)),
    ("J.P. Morgan", re.compile(r"J\.?P\.?\s*Morgan", re.I)),
    ("Google", re.compile(r"\bGoogle\b", re.I)),
    ("AWS", re.compile(r"\bAWS\b|Amazon Web Services", re.I)),
    ("Netflix", re.compile(r"\bNetflix\b", re.I)),
    ("VMware", re.compile(r"\bVMware\b", re.I)),
    ("AMP", re.compile(r"\bAMP\b", re.I)),
    ("ANZ", re.compile(r"\bANZ\b", re.I)),
    ("Worley", re.compile(r"\bWorley\b", re.I)),
    ("Stockland", re.compile(r"\bStockland\b", re.I)),
    ("Accenture", re.compile(r"\bAccenture\b", re.I)),
    ("Airbus", re.compile(r"\bAirbus\b", re.I)),
    ("Harvard", re.compile(r"\bHarvard\b", re.I)),
    ("CSIRO", re.compile(r"\bCSIRO\b", re.I)),
)

START_MARKERS = ("Meet the people behind Future Secure AI", "Executive Committee")


def _is_name(line: str) -> bool:
    if line in STOP or len(line) > 80:
        return False
    if TITLE_HINT.search(line) and not re.match(r"^[A-Z][a-z]+ [A-Z]", line):
        return False
    words = line.replace(",", " ").replace(".", " ").split()
    if not (2 <= len(words) <= 7):
        return False
    if line.isupper() and len(line) > 20:
        return False
    return bool(re.search(r"[A-Za-z]{2,}", line))


def extract_people(text: str) -> list[dict]:
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    start = 0
    for i, ln in enumerate(lines):
        if ln in START_MARKERS:
            start = i
    body = lines[start:]
    people: list[dict] = []
    i = 0
    while i < len(body) - 1:
        name = body[i]
        if not _is_name(name) or name in STOP:
            i += 1
            continue
        role = body[i + 1] if i + 1 < len(body) else ""
        bio = body[i + 2] if i + 2 < len(body) else ""
        # Advisors sometimes have name then bio with no title line
        if _is_name(role) or role in STOP:
            bio = role
            role = "Senior Advisor"
            i += 2
        else:
            if bio in STOP or _is_name(bio) or TITLE_HINT.search(bio or "") and len(bio) < 80:
                # missing bio
                bio = ""
                i += 2
            else:
                i += 3
        if role in STOP:
            continue
        employers = [label for label, rx in EMPLOYERS if rx.search(f"{role} {bio}")]
        people.append(
            {
                "name": name,
                "role": role,
                "bio": bio,
                "employers": employers,
                "founder": "co-founder" in role.lower() or "co-founder" in bio.lower(),
            }
        )
    # de-dupe by name, keep first
    seen: set[str] = set()
    out = []
    for p in people:
        key = p["name"].lower()
        if key in seen:
            continue
        seen.add(key)
        out.append(p)
    return out


def people_index(people: list[dict]) -> dict[str, dict]:
    return {p["name"]: p for p in people}


def diff_people(prev: list[dict] | None, curr: list[dict]) -> dict:
    prev_map = people_index(prev or [])
    curr_map = people_index(curr)
    added = sorted(set(curr_map) - set(prev_map))
    removed = sorted(set(prev_map) - set(curr_map))
    role_changed = []
    bio_changed = []
    for name in sorted(set(curr_map) & set(prev_map)):
        a, b = prev_map[name], curr_map[name]
        if a.get("role") != b.get("role"):
            role_changed.append({"name": name, "from": a.get("role"), "to": b.get("role")})
        if a.get("bio") != b.get("bio"):
            bio_changed.append(name)
    return {
        "added": added,
        "removed": removed,
        "role_changed": role_changed,
        "bio_changed": bio_changed,
    }
