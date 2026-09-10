"""
TruthLens AI - Credibility Scoring Engine
Author: TruthLens AI Team
Description: Fuses ML probability, linguistic neutrality, quote/attribution detection,
and lexical diversity into a calibrated 0-100 credibility index.
"""

import re
from typing import Dict, Any


class CredibilityScoreEngine:
    """Computes a multi-dimensional credibility score for news verification."""

    CLICKBAIT_PATTERNS = [
        r"\bshocking\b", r"\bunbelievable\b", r"\bmiracle\b", r"\bsecret\b",
        r"\bexposed\b", r"\bbanned\b", r"\bwake up\b", r"\bsheeple\b",
        r"\bconspiracy\b", r"\bcabal\b", r"\bcover.?up\b", r"\bbig pharma\b",
        r"\bmainstream media\b", r"\bthey don't want you to know\b",
        r"\bshare before it gets deleted\b", r"\bwon't believe\b",
        r"\b100%\s*guaranteed\b", r"\ball-natural cure\b", r"\breptilian\b"
    ]

    CREDIBLE_ATTRIBUTION_PATTERNS = [
        r"\baccording to\b", r"\breported in\b", r"\bpublished in\b",
        r"\bspokesperson confirmed\b", r"\bpeer-reviewed\b", r"\bofficial statement\b",
        r"\breuters\b", r"\bassociated press\b", r"\bnasa\b", r"\bunited nations\b",
        r"\bworld health organization\b", r"\bcdc\b", r"\buniversity\b",
        r"\bdr\.\s+[A-Z][a-z]+\b", r"\bclinical trial\b", r"\bdocumented\b"
    ]

    def evaluate(self, text: str, ml_real_probability: float) -> Dict[str, Any]:
        """Calculates credibility score out of 100 with comprehensive sub-metrics."""
        if not text.strip():
            return {
                "score": 0,
                "badge": "Insufficient Input",
                "tier": "danger",
                "breakdown": {
                    "ml_signal": 0.0,
                    "neutrality": 0.0,
                    "attribution": 0.0,
                    "structure": 0.0
                }
            }

        lower = text.lower()

        # Dimension 1: ML Posterior Signal (Max: 45 pts)
        ml_score = round(ml_real_probability * 45.0, 1)

        # Dimension 2: Neutrality & Anti-Sensationalism (Max: 25 pts)
        sensational_hits = 0
        for pattern in self.CLICKBAIT_PATTERNS:
            if re.search(pattern, lower):
                sensational_hits += 1

        exclamation_count = text.count("!")
        caps_words = len([w for w in text.split() if w.isupper() and len(w) > 2])

        neutrality_penalty = (sensational_hits * 4.5) + (exclamation_count * 1.5) + (caps_words * 1.0)
        neutrality_score = round(max(2.0, 25.0 - neutrality_penalty), 1)

        # Dimension 3: Attribution & Evidentiary Citations (Max: 20 pts)
        attr_hits = 0
        for pattern in self.CREDIBLE_ATTRIBUTION_PATTERNS:
            if re.search(pattern, lower):
                attr_hits += 1

        # Check for quoted speech
        has_quotes = bool(re.search(r'["\u201C\u201D][^"\u201C\u201D]{8,}["\u201C\u201D]', text))
        attribution_base = min(15.0, attr_hits * 4.0)
        attribution_score = round(attribution_base + (5.0 if has_quotes else 0.0), 1)

        # Dimension 4: Structural & Lexical Diversity (Max: 10 pts)
        words = re.findall(r"\b\w+\b", lower)
        unique_ratio = len(set(words)) / max(len(words), 1)
        sentence_count = max(len(re.split(r"[.!?]+", text)), 1)
        avg_sentence_len = len(words) / sentence_count

        struct_score = 0.0
        if 10 <= avg_sentence_len <= 35:
            struct_score += 5.0
        else:
            struct_score += 2.5

        if unique_ratio > 0.55:
            struct_score += 5.0
        elif unique_ratio > 0.40:
            struct_score += 3.5
        else:
            struct_score += 1.5

        struct_score = round(struct_score, 1)

        # Total Aggregation
        total_raw = ml_score + neutrality_score + attribution_score + struct_score
        final_score = int(min(100, max(0, round(total_raw))))

        # Tier Categorization
        if final_score >= 80:
            badge = "Verified / Highly Credible"
            tier = "success"
        elif final_score >= 60:
            badge = "Plausible / Low Risk"
            tier = "info"
        elif final_score >= 40:
            badge = "Questionable / Unverified"
            tier = "warning"
        else:
            badge = "High-Risk Fake / Sensational"
            tier = "danger"

        return {
            "score": final_score,
            "badge": badge,
            "tier": tier,
            "breakdown": {
                "ml_signal": ml_score,
                "neutrality": neutrality_score,
                "attribution": attribution_score,
                "structure": struct_score
            },
            "sensational_hits_count": sensational_hits,
            "attribution_hits_count": attr_hits,
            "has_quotes": has_quotes
        }
