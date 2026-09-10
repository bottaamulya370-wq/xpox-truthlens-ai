"""
TruthLens AI - NLP Preprocessing Module
Author: TruthLens AI Team
Description: Text cleaning, tokenization, stop-word removal, and lemmatization using NLTK and spaCy.
"""

import re
import string
from typing import List, Dict, Any

# Attempt NLTK imports with robust fallback
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    from nltk.tokenize import word_tokenize

    for res in ["punkt", "stopwords", "wordnet", "omw-1.4"]:
        try:
            nltk.download(res, quiet=True)
        except Exception:
            pass
    NLTK_READY = True
except ImportError:
    NLTK_READY = False

# Attempt spaCy import
try:
    import spacy
    try:
        nlp_spacy = spacy.load("en_core_web_sm")
    except Exception:
        nlp_spacy = None
except ImportError:
    nlp_spacy = None


class TextPreprocessor:
    """Handles multi-stage NLP cleaning, normalization, and tokenization."""

    def __init__(self):
        if NLTK_READY:
            try:
                self.stop_words = set(stopwords.words("english"))
                self.lemmatizer = WordNetLemmatizer()
            except Exception:
                self.stop_words = self._fallback_stopwords()
                self.lemmatizer = None
        else:
            self.stop_words = self._fallback_stopwords()
            self.lemmatizer = None

    def _fallback_stopwords(self) -> set:
        return {
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
            "any", "are", "aren't", "as", "at", "be", "because", "been", "before", "being",
            "below", "between", "both", "but", "by", "can't", "cannot", "could", "couldn't",
            "did", "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during",
            "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
            "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
            "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i",
            "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's",
            "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
            "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought",
            "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
            "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such",
            "than", "that", "that's", "the", "their", "theirs", "them", "themselves",
            "then", "there", "there's", "these", "they", "they'd", "they'll", "they're",
            "they've", "this", "those", "through", "to", "too", "under", "until", "up",
            "very", "was", "wasn't", "we", "we'd", "we'll", "we're", "we've", "were",
            "weren't", "what", "what's", "when", "when's", "where", "where's", "which",
            "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
            "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
            "yourself", "yourselves"
        }

    def clean_text(self, text: str) -> str:
        """Strip URLs, HTML tags, special characters, and extra whitespaces."""
        if not text:
            return ""
        # Remove URLs
        text = re.sub(r"https?://\S+|www\.\S+", " ", text)
        # Remove HTML markup
        text = re.sub(r"<.*?>", " ", text)
        # Remove email addresses
        text = re.sub(r"\S+@\S+", " ", text)
        # Remove digits and weird punctuation but preserve single space
        text = re.sub(r"[^a-zA-Z\s]", " ", text)
        # Normalize whitespace
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def tokenize(self, text: str) -> List[str]:
        """Convert cleaned text to lowercase tokens."""
        cleaned = self.clean_text(text).lower()
        if NLTK_READY:
            try:
                raw_tokens = word_tokenize(cleaned)
                return [t for t in raw_tokens if t not in string.punctuation and len(t) > 1]
            except Exception:
                pass
        return [w for w in re.findall(r"\b[a-zA-Z]{2,}\b", cleaned)]

    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """Filter out common English stop words."""
        return [token for token in tokens if token not in self.stop_words and len(token) > 2]

    def lemmatize(self, tokens: List[str]) -> List[str]:
        """Apply morphological lemmatization to extract base lemma forms."""
        if self.lemmatizer:
            try:
                return [self.lemmatizer.lemmatize(t, pos="v") for t in tokens]
            except Exception:
                pass
        # Simple rule-based suffix truncation fallback
        results = []
        for t in tokens:
            if t.endswith("ies") and len(t) > 4:
                results.append(t[:-3] + "y")
            elif t.endswith("ing") and len(t) > 5:
                results.append(t[:-3])
            elif t.endswith("ed") and len(t) > 4:
                results.append(t[:-2])
            elif t.endswith("es") and len(t) > 4:
                results.append(t[:-2])
            elif t.endswith("s") and len(t) > 3 and not t.endswith("ss"):
                results.append(t[:-1])
            else:
                results.append(t)
        return results

    def preprocess_pipeline(self, text: str) -> Dict[str, Any]:
        """Complete 4-stage pipeline returning intermediate state for UI inspection."""
        raw_char_count = len(text)
        cleaned_text = self.clean_text(text)
        tokens = self.tokenize(cleaned_text)
        filtered_tokens = self.remove_stopwords(tokens)
        lemmatized_tokens = self.lemmatize(filtered_tokens)
        processed_text = " ".join(lemmatized_tokens)

        return {
            "raw_text": text,
            "raw_char_count": raw_char_count,
            "cleaned_text": cleaned_text,
            "tokens": tokens,
            "tokens_count": len(tokens),
            "stopwords_removed_count": len(tokens) - len(filtered_tokens),
            "filtered_tokens": filtered_tokens,
            "lemmatized_tokens": lemmatized_tokens,
            "processed_text": processed_text,
            "vocabulary_richness": round(len(set(tokens)) / max(len(tokens), 1), 3)
        }
