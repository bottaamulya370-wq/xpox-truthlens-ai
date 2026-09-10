"""
TruthLens AI - Analytics Dashboard Service
Author: TruthLens AI Team (AIML Project)
Description: Manages historical analysis tracking, aggregate statistics calculation,
confidence trends, and distribution visualization payloads.
"""

import json
import os
from datetime import datetime
from typing import Dict, Any, List

class AnalyticsDashboardService:
    """
    Maintains session history and computes aggregate metrics including
    Real vs Fake distribution, average credibility, and chronological confidence trends.
    """

    def __init__(self, storage_path: str = "analytics_history.json"):
        self.storage_path = storage_path
        self.history: List[Dict[str, Any]] = []
        self._load_history()

    def _load_history(self):
        """Loads analysis history from JSON cache if present, otherwise initializes default seed logs."""
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    self.history = json.load(f)
                    return
            except Exception as e:
                print(f"Error loading analytics history: {e}")

        # Default representative baseline historical telemetry
        self.history = [
            {
                "id": "TL-001",
                "timestamp": "2025-01-15 10:20:14",
                "title_snippet": "Federal Reserve updates monetary benchmark metrics...",
                "prediction": "Real News",
                "confidence": 94.2,
                "credibility_score": 91,
                "model_used": "Logistic Regression"
            },
            {
                "id": "TL-002",
                "timestamp": "2025-01-15 11:45:00",
                "title_snippet": "SHOCKING EXCLUSIVE: Secret global cabal controls weather...",
                "prediction": "Fake News",
                "confidence": 98.6,
                "credibility_score": 12,
                "model_used": "Ensemble (LR + RF)"
            },
            {
                "id": "TL-003",
                "timestamp": "2025-01-16 09:12:30",
                "title_snippet": "NASA James Webb Space Telescope discovers deep-field galaxy...",
                "prediction": "Real News",
                "confidence": 96.5,
                "credibility_score": 95,
                "model_used": "Random Forest"
            },
            {
                "id": "TL-004",
                "timestamp": "2025-01-16 14:05:42",
                "title_snippet": "MIRACLE CURE: Doctors are stunned by common household spice...",
                "prediction": "Fake News",
                "confidence": 92.1,
                "credibility_score": 18,
                "model_used": "Ensemble (LR + RF)"
            },
            {
                "id": "TL-005",
                "timestamp": "2025-01-17 16:30:19",
                "title_snippet": "United Nations climate summit adopts milestone protocol...",
                "prediction": "Real News",
                "confidence": 91.8,
                "credibility_score": 88,
                "model_used": "Logistic Regression"
            }
        ]

    def _save_history(self):
        """Persists history to local file."""
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump(self.history, f, indent=2)
        except Exception as e:
            print(f"Error persisting analytics history: {e}")

    def log_analysis(self, text: str, prediction: str, confidence: float, credibility_score: int, model_used: str):
        """Records a new inference event into history."""
        snippet = text.strip()[:65].replace("\n", " ") + ("..." if len(text) > 65 else "")
        entry = {
            "id": f"TL-{len(self.history) + 1:03d}",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "title_snippet": snippet,
            "prediction": prediction,
            "confidence": round(confidence, 1),
            "credibility_score": credibility_score,
            "model_used": model_used
        }
        self.history.append(entry)
        self._save_history()

    def get_summary_metrics(self) -> Dict[str, Any]:
        """Calculates global aggregation metrics."""
        total = len(self.history)
        if total == 0:
            return {
                "total_articles": 0,
                "real_count": 0,
                "fake_count": 0,
                "real_percentage": 0.0,
                "fake_percentage": 0.0,
                "average_confidence": 0.0,
                "average_credibility": 0.0
            }

        real_count = sum(1 for item in self.history if item["prediction"] == "Real News")
        fake_count = sum(1 for item in self.history if item["prediction"] == "Fake News")
        avg_conf = sum(item["confidence"] for item in self.history) / total
        avg_cred = sum(item["credibility_score"] for item in self.history) / total

        return {
            "total_articles": total,
            "real_count": real_count,
            "fake_count": fake_count,
            "real_percentage": round((real_count / total) * 100, 1),
            "fake_percentage": round((fake_count / total) * 100, 1),
            "average_confidence": round(avg_conf, 1),
            "average_credibility": round(avg_cred, 1),
            "recent_history": self.history[-10:]
        }
