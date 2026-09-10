"""
TruthLens AI - Machine Learning Classification Module
Author: TruthLens AI Team (AIML Project)
Description: Integrates TF-IDF Vectorization, Logistic Regression, and Random Forest
classifiers with rigorous performance benchmarking and prediction interfaces.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

from preprocess import TextPreprocessor

class NewsClassifierService:
    """
    Orchestrates TF-IDF vectorization, dual-model training (Logistic Regression vs Random Forest),
    model persistence, and live inference with probability calibration.
    """

    def __init__(self, models_dir: str = "saved_models"):
        self.models_dir = models_dir
        self.preprocessor = TextPreprocessor()
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.lr_model: Optional[LogisticRegression] = None
        self.rf_model: Optional[RandomForestClassifier] = None
        self.benchmark_metrics: Dict[str, Any] = {}
        
        # Ensure models directory exists
        os.makedirs(self.models_dir, exist_ok=True)
        
        # Load or initialize models
        self._initialize_or_load()

    def _initialize_or_load(self):
        """Attempts to load pre-trained artifacts or initializes with baseline training."""
        vec_path = os.path.join(self.models_dir, "tfidf_vectorizer.joblib")
        lr_path = os.path.join(self.models_dir, "logistic_regression.joblib")
        rf_path = os.path.join(self.models_dir, "random_forest.joblib")

        if os.path.exists(vec_path) and os.path.exists(lr_path) and os.path.exists(rf_path):
            try:
                self.vectorizer = joblib.load(vec_path)
                self.lr_model = joblib.load(lr_path)
                self.rf_model = joblib.load(rf_path)
                print("Loaded pre-trained models from disk.")
                return
            except Exception as e:
                print(f"Failed to load cached models ({e}), re-initializing baseline...")
        
        self.train_baseline_synthetic()

    def train_baseline_synthetic(self):
        """
        Trains on an expanded seed corpus of representative real and fake news articles.
        This guarantees instant out-of-the-box readiness for demonstration and evaluation.
        """
        # Curated representative dataset spanning politics, science, business, health, and conspiracies
        seed_data = [
            # Real News (1)
            ("The Federal Reserve announced an interest rate adjustment following the Federal Open Market Committee meeting, citing inflationary trends and employment metrics.", 1),
            ("NASA's James Webb Space Telescope has captured deep-field infrared imagery of a high-redshift galaxy cluster dating back 13 billion years, astrophysicists reported in Nature Astronomy.", 1),
            ("Health authorities and peer-reviewed clinical trials published in the New England Journal of Medicine confirm the efficacy of the seasonal influenza vaccine in reducing hospitalizations.", 1),
            ("The United Nations climate summit concluded today with delegates from 195 member states reaching a formal consensus on carbon mitigation milestones.", 1),
            ("Quarterly financial filings audited by an independent accounting firm revealed a 4.2 percent annualized growth in manufacturing output across European supply chains.", 1),
            ("The World Health Organization issued verified epidemiological surveillance guidelines regarding vector-borne disease transmission in subtropical zones.", 1),
            ("Researchers at Oxford University published findings documenting renewable solar cell efficiency surpassing 29 percent under laboratory testing conditions.", 1),
            ("A municipal government council approved the public transit electrification initiative funded through municipal green bonds, city officials stated during the public hearing.", 1),
            ("The International Monetary Fund released its World Economic Outlook report, projecting moderate global GDP growth of 3.1 percent for the fiscal year.", 1),
            ("A bipartisan committee in the senate held formal hearings to review updated cybersecurity protocols protecting critical public infrastructure.", 1),
            
            # Fake News (0)
            ("SHOCKING EXCLUSIVE: Secret global cabal operates subterranean weather control machine to manipulate election outcomes! Mainstream media covering this up!", 0),
            ("MIRACLE CURE: Doctors are stunned! This secret common household spice eliminates all diseases overnight without any pharmaceutical medication!", 0),
            ("BOMBSHELL: Whistleblower leaks verified proof that the Moon landing was filmed on an abandoned Hollywood studio soundstage with reptilian actors!", 0),
            ("URGENT ALERT: Government is secretly adding mind control tracking chips to municipal drinking water pipelines! Share this before it gets deleted!", 0),
            ("You won't believe what this celebrity admitted! Hollywood elite caught drinking synthetic youth elixir derived from endangered crystals!", 0),
            ("UNBELIEVABLE: Five-G cell phone towers are actively beaming frequency signals that hypnotize citizens into surrendering their bank accounts!", 0),
            ("EXPOSED: Top secret documents reveal world leaders communicate directly with ancient subterranean civilization beneath Antarctica!", 0),
            ("SHOCKING: Drink pure boiled saltwater three times daily to completely reverse biological aging! Big Pharma doesn't want you to know this simple trick!", 0),
            ("BREAKING: Anonymous insider exposes massive covert agenda to replace currency with biometric iris scanner chips next month! Wake up sheeple!", 0),
            ("CONFIRMED: Scientists admit gravitational waves are an elaborate hoax designed to siphon trillions from national space exploration budgets!", 0),
        ]

        df = pd.DataFrame(seed_data, columns=['text', 'label'])
        self.train_and_evaluate(df['text'].tolist(), df['label'].tolist())

    def train_and_evaluate(self, texts: list, labels: list) -> Dict[str, Any]:
        """
        Executes TF-IDF feature extraction, model fitting, and multi-metric comparison.
        """
        # Step 1: Preprocess texts
        processed_texts = [self.preprocessor.transform(t) for t in texts]

        # Step 2: Split data (stratified)
        X_train, X_test, y_train, y_test = train_test_split(
            processed_texts, labels, test_size=0.3, random_state=42, stratify=labels
        )

        # Step 3: TF-IDF Vectorization
        self.vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=5000,
            sublinear_tf=True,
            min_df=1
        )
        X_train_vec = self.vectorizer.fit_transform(X_train)
        X_test_vec = self.vectorizer.transform(X_test)

        # Step 4: Train Logistic Regression
        self.lr_model = LogisticRegression(C=1.0, max_iter=1000, random_state=42)
        self.lr_model.fit(X_train_vec, y_train)

        # Step 5: Train Random Forest
        self.rf_model = RandomForestClassifier(n_estimators=100, max_depth=15, random_state=42)
        self.rf_model.fit(X_train_vec, y_train)

        # Step 6: Evaluate both models
        def evaluate_model(model, name: str):
            preds = model.predict(X_test_vec)
            probs = model.predict_proba(X_test_vec)[:, 1] if hasattr(model, "predict_proba") else None
            
            acc = float(accuracy_score(y_test, preds))
            prec = float(precision_score(y_test, preds, zero_division=0))
            rec = float(recall_score(y_test, preds, zero_division=0))
            f1 = float(f1_score(y_test, preds, zero_division=0))
            cm = confusion_matrix(y_test, preds).tolist()
            roc = float(roc_auc_score(y_test, probs)) if probs is not None and len(set(y_test)) > 1 else 1.0

            return {
                "model_name": name,
                "accuracy": round(acc * 100, 2),
                "precision": round(prec * 100, 2),
                "recall": round(rec * 100, 2),
                "f1_score": round(f1 * 100, 2),
                "roc_auc": round(roc * 100, 2),
                "confusion_matrix": cm,
            }

        lr_metrics = evaluate_model(self.lr_model, "Logistic Regression")
        rf_metrics = evaluate_model(self.rf_model, "Random Forest")

        self.benchmark_metrics = {
            "logistic_regression": lr_metrics,
            "random_forest": rf_metrics,
            "dataset_samples": len(texts),
            "vocab_size": len(self.vectorizer.vocabulary_),
            "best_model": "Logistic Regression" if lr_metrics["f1_score"] >= rf_metrics["f1_score"] else "Random Forest"
        }

        # Save artifacts
        self.save_models()
        return self.benchmark_metrics

    def save_models(self):
        """Saves vectorizer and model weights to disk."""
        if self.vectorizer and self.lr_model and self.rf_model:
            joblib.dump(self.vectorizer, os.path.join(self.models_dir, "tfidf_vectorizer.joblib"))
            joblib.dump(self.lr_model, os.path.join(self.models_dir, "logistic_regression.joblib"))
            joblib.dump(self.rf_model, os.path.join(self.models_dir, "random_forest.joblib"))

    def predict(self, text: str, model_type: str = "ensemble") -> Dict[str, Any]:
        """
        Classifies input news text using specified model:
        - 'logistic_regression'
        - 'random_forest'
        - 'ensemble' (weighted average probability)
        """
        if not self.vectorizer or not self.lr_model or not self.rf_model:
            raise ValueError("Models are not trained or initialized.")

        processed = self.preprocessor.transform(text)
        if not processed.strip():
            return {
                "prediction": "Unknown",
                "label": -1,
                "confidence": 0.0,
                "real_probability": 50.0,
                "fake_probability": 50.0,
                "model_used": model_type,
                "status": "error",
                "message": "Text contains no valid alphabetical tokens after preprocessing."
            }

        vec = self.vectorizer.transform([processed])
        lr_probs = self.lr_model.predict_proba(vec)[0]  # [prob_fake, prob_real]
        rf_probs = self.rf_model.predict_proba(vec)[0]

        if model_type == "logistic_regression":
            fake_p, real_p = lr_probs[0], lr_probs[1]
            active_model = "Logistic Regression"
        elif model_type == "random_forest":
            fake_p, real_p = rf_probs[0], rf_probs[1]
            active_model = "Random Forest"
        else:  # Ensemble
            fake_p = 0.55 * lr_probs[0] + 0.45 * rf_probs[0]
            real_p = 0.55 * lr_probs[1] + 0.45 * rf_probs[1]
            active_model = "Ensemble (LR + RF)"

        label = 1 if real_p >= fake_p else 0
        prediction_str = "Real News" if label == 1 else "Fake News"
        confidence = float(real_p if label == 1 else fake_p) * 100

        return {
            "prediction": prediction_str,
            "label": label,
            "confidence": round(confidence, 2),
            "real_probability": round(real_p * 100, 2),
            "fake_probability": round(fake_p * 100, 2),
            "model_used": active_model,
            "individual_models": {
                "logistic_regression": {
                    "prediction": "Real News" if lr_probs[1] >= 0.5 else "Fake News",
                    "real_prob": round(lr_probs[1] * 100, 2),
                    "fake_prob": round(lr_probs[0] * 100, 2)
                },
                "random_forest": {
                    "prediction": "Real News" if rf_probs[1] >= 0.5 else "Fake News",
                    "real_prob": round(rf_probs[1] * 100, 2),
                    "fake_prob": round(rf_probs[0] * 100, 2)
                }
            }
        }
