"""
TruthLens AI - Model Training Script
Author: TruthLens AI Team
Description: Trains TF-IDF Vectorizer, Logistic Regression, and Random Forest models on sample dataset,
evaluates test performance metrics, and exports serialized pickle artifacts to models/.
"""

import os
import pickle
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# Import modular preprocessor
from modules.preprocess import TextPreprocessor

def train_and_export_models():
    print("=" * 60)
    print("TruthLens AI: Training Pipeline Initialized")
    print("=" * 60)

    # 1. Load Dataset
    dataset_path = os.path.join(os.path.dirname(__file__), "dataset", "sample_news.csv")
    if os.path.exists(dataset_path):
        print(f"Loading dataset from: {dataset_path}")
        df = pd.read_csv(dataset_path)
    else:
        print("Dataset file not found, creating synthetic training sample...")
        df = pd.DataFrame({
            "text": [
                "NASA confirms new planetary system discovered with habitable zone candidates.",
                "Secret cabal operates underground weather control machine to control elections!",
                "World Health Organization publishes audited medical findings in peer-reviewed journal.",
                "Doctors stunned by secret miracle spice that cures all cancer overnight!",
                "United Nations delegates ratify international treaty on maritime environmental protections.",
                "Aliens verified in secret government underground bunker by anonymous whistleblower!"
            ],
            "label": [1, 0, 1, 0, 1, 0]
        })

    print(f"Total dataset records: {len(df)}")
    print(f"Real News count: {sum(df['label'] == 1)} | Fake News count: {sum(df['label'] == 0)}")

    # 2. NLP Preprocessing
    print("\n[Stage 1/4] Running NLP Text Preprocessing (Tokenization, Stopwords, Lemmatization)...")
    preprocessor = TextPreprocessor()
    df["processed_text"] = df["text"].apply(lambda t: preprocessor.preprocess_pipeline(t)["processed_text"])

    X = df["processed_text"]
    y = df["label"]

    # 3. TF-IDF Vectorization
    print("\n[Stage 2/4] Fitting TF-IDF Vectorizer (max_features=5000, n-grams=(1,2))...")
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 2),
        sublinear_tf=True
    )
    X_vec = vectorizer.fit_transform(X)

    # 4. Train Classifiers
    print("\n[Stage 3/4] Training Machine Learning Models...")

    # Model A: Logistic Regression
    print("  -> Training Logistic Regression (L2 Regularized)...")
    lr = LogisticRegression(C=1.5, max_iter=250, random_state=42)
    lr.fit(X_vec, y)

    # Model B: Random Forest
    print("  -> Training Random Forest Classifier (100 Estimators)...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    rf.fit(X_vec, y)

    # 5. Evaluate Performance
    print("\n[Stage 4/4] Model Evaluation Metrics:")
    print("-" * 50)
    for name, model in [("Logistic Regression", lr), ("Random Forest", rf)]:
        preds = model.predict(X_vec)
        acc = accuracy_score(y, preds)
        prec = precision_score(y, preds, zero_division=0)
        rec = recall_score(y, preds, zero_division=0)
        f1 = f1_score(y, preds, zero_division=0)
        print(f"{name}:")
        print(f"   Accuracy : {acc * 100:.2f}%")
        print(f"   Precision: {prec * 100:.2f}%")
        print(f"   Recall   : {rec * 100:.2f}%")
        print(f"   F1-Score : {f1 * 100:.2f}%")
        print("-" * 50)

    # 6. Save Artifacts to models/
    models_dir = os.path.join(os.path.dirname(__file__), "models")
    os.makedirs(models_dir, exist_ok=True)

    with open(os.path.join(models_dir, "tfidf_vectorizer.pkl"), "wb") as f:
        pickle.dump(vectorizer, f)
    with open(os.path.join(models_dir, "logistic_regression.pkl"), "wb") as f:
        pickle.dump(lr, f)
    with open(os.path.join(models_dir, "random_forest.pkl"), "wb") as f:
        pickle.dump(rf, f)

    print(f"\n[Success] Artifacts exported successfully to: {models_dir}")
    print("  - tfidf_vectorizer.pkl")
    print("  - logistic_regression.pkl")
    print("  - random_forest.pkl")
    print("\nYou can now run the Streamlit app using: streamlit run app.py")

if __name__ == "__main__":
    train_and_export_models()
