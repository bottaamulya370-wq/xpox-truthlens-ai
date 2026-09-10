"""
TruthLens AI - Credibility Score Engine
Author: TruthLens AI Team (AIML Project)
Description: Evaluates linguistic integrity, sensationalism indicators, attribution citations,
and ML probabilities to synthesize a transparent 0-100 Credibility Score.
"""

import re
from typing import Dict, Any, List

class CredibilityScoreEngine:
    """
    Synthesizes a multi-factor credibility index (0-100) combining statistical ML predictions,
    sensationalism detection, citation attribution, and emotional exaggeration checks.
    """

    # Clickbait and hyper-sensational buzzwords commonly flagged in disinformation research
    SENSATIONAL_PATTERNS = [
        r'\bshocking\b', r'\bbombshell\b', r'\bexposed\b', r'\bsecret cabal\b',
        r'\bwake up\b', r'\bmainstream media won\'?t tell you\b', r'\bmiracle cure\b',
        r'\b100% guaranteed\b', r'\byou won\'?t believe\b', r'\bthey don\'?t want you to know\b',
        r'\bconspiracy\b', r'\bhoax\b', r'\belite\b', r'\billuminati\b', r'\bpoisoning\b',
        r'\bdeadly secret\b', r'\bhidden truth\b', r'\bbanned\b', r'\bwhistleblower reveals\b'
    ]

    # Credibility and authoritative attribution indicators
    FACTUAL_INDICATORS = [
        r'\baccording to\b', r'\bofficials said\b', r'\breported by\b', r'\bpublished in\b',
        r'\bspokesperson stated\b', r'\bdata indicates\b', r'\bpeer-reviewed\b',
        r'\buniversity\b', r'\bresearchers found\b', r'\bconfirmed by\b',
        r'\breuters\b', r'\bassociated press\b', r'\bbloomberg\b', r'\bnature\b',
        r'\bscience\b', r'\bthe study\b', r'\bclinical trial\b'
    ]

    def __init__(self):
        self.sensational_regex = [re.compile(p, re.IGNORECASE) for p in self.SENSATIONAL_PATTERNS]
        self.factual_regex = [re.compile(p, re.IGNORECASE) for p in self.FACTUAL_INDICATORS]

    def analyze_sensationalism(self, text: str) -> Dict[str, Any]:
        """Detects clickbait phrases, ALL-CAPS screaming, and excessive punctuation."""
        matches = []
        for r in self.sensational_regex:
            found = r.findall(text)
            if found:
                matches.extend(found)

        # Exclamation and question mark density
        exclamations = text.count('!')
        questions = text.count('?')
        
        # All-caps words (excluding common acronyms of <= 3 letters)
        words = text.split()
        caps_words = [
            w for w in words 
            if w.isupper() and len(w) > 3 and w not in {'NASA', 'WHO', 'NATO', 'UNICEF', 'COVID', 'SARS', 'HTML', 'STEM'}
        ]

        penalty = 0
        penalty += min(len(matches) * 8, 32)
        penalty += min(exclamations * 4, 16)
        penalty += min(len(caps_words) * 5, 20)

        return {
            "penalty": penalty,
            "sensational_phrases": list(set(matches)),
            "exclamation_count": exclamations,
            "caps_words": caps_words[:10],
            "is_sensational": len(matches) > 0 or exclamations > 2 or len(caps_words) > 2
        }

    def analyze_attribution(self, text: str) -> Dict[str, Any]:
        """Examines evidentiary backing, institutional citations, and quotes."""
        found_indicators = []
        for r in self.factual_regex:
            found = r.findall(text)
            if found:
                found_indicators.extend(found)

        # Direct quotes check ("...")
        quotes = re.findall(r'"([^"]*)"', text)
        quote_boost = min(len(quotes) * 6, 18)
        indicator_boost = min(len(found_indicators) * 7, 21)

        total_boost = quote_boost + indicator_boost

        return {
            "boost": total_boost,
            "citations_found": list(set(found_indicators)),
            "quote_count": len(quotes),
            "quotes_sample": quotes[:3]
        }

    def compute_score(self, text: str, ml_real_probability: float) -> Dict[str, Any]:
        """
        Calculates final Credibility Score out of 100 based on:
        - ML Real Probability baseline (45%)
        - Neutrality & Anti-Sensationalism (25%)
        - Source Attribution & Quotations (20%)
        - Structural & Lexical Balance (10%)
        """
        sensational_data = self.analyze_sensationalism(text)
        attribution_data = self.analyze_attribution(text)

        # 1. Base ML component (0 to 45 pts)
        ml_component = (ml_real_probability / 100.0) * 45.0

        # 2. Sensationalism component (max 25 pts, minus penalty)
        sensational_score = max(0.0, 25.0 - (sensational_data["penalty"] * 0.7))

        # 3. Attribution component (max 20 pts, plus boost)
        attribution_score = min(20.0, 5.0 + (attribution_data["boost"] * 0.6))

        # 4. Text length & structure penalty/reward (max 10 pts)
        word_count = len(text.split())
        if word_count < 25:
            structure_score = 3.0  # Too brief for verified journalism
        elif word_count < 60:
            structure_score = 6.0
        else:
            structure_score = 10.0

        raw_score = ml_component + sensational_score + attribution_score + structure_score
        final_score = int(round(max(5.0, min(99.0, raw_score))))

        # Rating tier assignment
        if final_score >= 80:
            rating_tier = "High Credibility (Verified Reporting)"
            color = "emerald"
            badge = "VERIFIED / RELIABLE"
        elif final_score >= 60:
            rating_tier = "Moderate Credibility (Plausible, Exercise Caution)"
            color = "blue"
            badge = "PLAUSIBLE / UNCONFIRMED"
        elif final_score >= 40:
            rating_tier = "Low Credibility (Questionable Sources / Biased)"
            color = "amber"
            badge = "QUESTIONABLE"
        else:
            rating_tier = "Critical Risk (Likely Fabrication or Clickbait)"
            color = "rose"
            badge = "HIGH-RISK FAKE"

        return {
            "credibility_score": final_score,
            "max_score": 100,
            "rating_tier": rating_tier,
            "badge": badge,
            "color": color,
            "breakdown": {
                "ml_model_signal": round(ml_component, 1),
                "neutrality_score": round(sensational_score, 1),
                "attribution_score": round(attribution_score, 1),
                "structure_score": round(structure_score, 1)
            },
            "sensationalism_details": sensational_data,
            "attribution_details": attribution_data
        }
