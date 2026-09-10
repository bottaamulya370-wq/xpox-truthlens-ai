"""
TruthLens AI - NLP Preprocessing Module
Author: TruthLens AI Team (AIML Project)
Description: Complete NLP pipeline featuring Tokenization, Stop-word removal,
and Lemmatization for Fake News Detection.
"""

import re
import string
from typing import List, Dict, Any

# NLP libraries with graceful fallbacks
try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.stem import WordNetLemmatizer
    from nltk.tokenize import word_tokenize
    
    # Download required NLTK resources safely
    for resource in ['punkt', 'stopwords', 'wordnet', 'omw-1.4']:
        try:
            nltk.download(resource, quiet=True)
        except Exception:
            pass
            
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False

# Fallback English stop-words if NLTK is unavailable
FALLBACK_STOPWORDS = {
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
    'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she',
    'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
    'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
    'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
    'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of',
    'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
    'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
    'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
    'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any',
    'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
    'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's',
    't', 'can', 'will', 'just', 'don', 'should', 'now'
}


class TextPreprocessor:
    """
    Modular text preprocessor for news classification.
    Performs standard NLP normalization, cleaning, tokenization,
    stop-word removal, and lemmatization.
    """

    def __init__(self):
        if NLTK_AVAILABLE:
            try:
                self.stop_words = set(stopwords.words('english'))
                self.lemmatizer = WordNetLemmatizer()
            except Exception:
                self.stop_words = FALLBACK_STOPWORDS
                self.lemmatizer = None
        else:
            self.stop_words = FALLBACK_STOPWORDS
            self.lemmatizer = None

    def clean_raw_text(self, text: str) -> str:
        """
        Removes URLs, HTML tags, email addresses, and excessive whitespace.
        """
        if not text or not isinstance(text, str):
            return ""
        
        # Remove URLs
        text = re.sub(r'https?://\S+|www\.\S+', ' ', text)
        # Remove HTML markup
        text = re.sub(r'<.*?>', ' ', text)
        # Remove email addresses
        text = re.sub(r'\S+@\S+', ' ', text)
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def tokenize(self, text: str) -> List[str]:
        """
        Splits text into lowercased word tokens, filtering punctuation.
        """
        cleaned = self.clean_raw_text(text).lower()
        if NLTK_AVAILABLE:
            try:
                raw_tokens = word_tokenize(cleaned)
                return [t for t in raw_tokens if t not in string.punctuation and re.match(r'^[a-zA-Z]+$', t)]
            except Exception:
                pass
        
        # Fallback regex tokenization
        return re.findall(r'\b[a-zA-Z]{2,}\b', cleaned)

    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """
        Filters out common grammatical stop-words that carry minimal semantic entropy.
        """
        return [t for t in tokens if t not in self.stop_words and len(t) > 2]

    def lemmatize(self, tokens: List[str]) -> List[str]:
        """
        Reduces tokens to their canonical dictionary root (lemma).
        """
        if self.lemmatizer:
            try:
                return [self.lemmatizer.lemmatize(t, pos='v') for t in tokens]
            except Exception:
                pass
        
        # Simple rule-based suffix truncation fallback if WordNet is offline
        lemmas = []
        for t in tokens:
            if t.endswith('ing') and len(t) > 5:
                lemmas.append(t[:-3])
            elif t.endswith('ies') and len(t) > 4:
                lemmas.append(t[:-3] + 'y')
            elif t.endswith('ed') and len(t) > 4:
                lemmas.append(t[:-2])
            elif t.endswith('s') and not t.endswith('ss') and len(t) > 3:
                lemmas.append(t[:-1])
            else:
                lemmas.append(t)
        return lemmas

    def transform(self, text: str) -> str:
        """
        End-to-end transformation returning normalized space-separated lemmas.
        """
        tokens = self.tokenize(text)
        filtered = self.remove_stopwords(tokens)
        lemmas = self.lemmatize(filtered)
        return " ".join(lemmas)

    def get_pipeline_breakdown(self, text: str) -> Dict[str, Any]:
        """
        Provides intermediate stage inspection for students, researchers, and UI visualization.
        """
        cleaned = self.clean_raw_text(text)
        tokens = self.tokenize(text)
        no_stops = self.remove_stopwords(tokens)
        lemmas = self.lemmatize(no_stops)

        # Lexical statistics
        total_words = len(tokens)
        unique_words = len(set(tokens))
        lexical_diversity = round((unique_words / total_words), 3) if total_words > 0 else 0.0
        stopword_count = total_words - len(no_stops)

        return {
            "raw_character_count": len(text),
            "cleaned_text_preview": cleaned[:200] + "..." if len(cleaned) > 200 else cleaned,
            "raw_token_count": total_words,
            "tokens_sample": tokens[:20],
            "stop_words_removed_count": stopword_count,
            "filtered_tokens_count": len(no_stops),
            "final_lemmas_count": len(lemmas),
            "lemmas_sample": lemmas[:20],
            "lexical_diversity": lexical_diversity,
            "processed_text": " ".join(lemmas)
        }


# Quick test harness
if __name__ == "__main__":
    sample_text = """
    BREAKING EXCLUSIVE: Shocking secret documents confirm aliens secretly run the central bank! 
    Visit http://fake-news-scam.xyz for shocking updates right now!!!
    """
    preprocessor = TextPreprocessor()
    breakdown = preprocessor.get_pipeline_breakdown(sample_text)
    print("--- NLP Preprocessing Breakdown ---")
    for key, val in breakdown.items():
        print(f"{key}: {val}")
