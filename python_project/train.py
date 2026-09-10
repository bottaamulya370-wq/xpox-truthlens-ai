"""
TruthLens AI - Standalone Model Training & Benchmarking Script
Author: TruthLens AI Team (AIML Project)
Usage:
    python train.py [--dataset path/to/dataset.csv]
"""

import argparse
import os
import pandas as pd
from classifier import NewsClassifierService

def run_training_pipeline(dataset_path: str = None):
    print("=" * 65)
    print("      TruthLens AI: NLP Model Training & Benchmarking Engine      ")
    print("=" * 65)

    classifier_service = NewsClassifierService()

    if dataset_path and os.path.exists(dataset_path):
        print(f"[+] Loading dataset from: {dataset_path}")
        try:
            df = pd.read_csv(dataset_path)
            # Normalize column names
            col_map = {c.lower(): c for c in df.columns}
            text_col = col_map.get('text') or col_map.get('title') or col_map.get('news') or df.columns[0]
            label_col = col_map.get('label') or col_map.get('target') or col_map.get('class') or df.columns[1]
            
            df = df.dropna(subset=[text_col, label_col])
            # Ensure binary label (0 = Fake, 1 = Real)
            if df[label_col].dtype == object:
                df[label_col] = df[label_col].astype(str).str.lower().apply(lambda x: 1 if 'real' in x or 'true' in x else 0)
            
            texts = df[text_col].tolist()
            labels = df[label_col].tolist()
            print(f"[+] Successfully loaded {len(texts)} samples (Real: {sum(labels)}, Fake: {len(labels) - sum(labels)})")
            metrics = classifier_service.train_and_evaluate(texts, labels)
        except Exception as e:
            print(f"[!] Error reading dataset ({e}). Falling back to baseline curated corpus...")
            metrics = classifier_service.benchmark_metrics
    else:
        print("[+] No external dataset provided. Training on curated benchmark corpus...")
        classifier_service.train_baseline_synthetic()
        metrics = classifier_service.benchmark_metrics

    print("\n" + "=" * 65)
    print("                MODEL PERFORMANCE COMPARISON                     ")
    print("=" * 65)
    
    lr = metrics["logistic_regression"]
    rf = metrics["random_forest"]

    print(f"{'Metric':<20} | {'Logistic Regression':<20} | {'Random Forest':<20}")
    print("-" * 65)
    print(f"{'Accuracy (%)':<20} | {lr['accuracy']:<20} | {rf['accuracy']:<20}")
    print(f"{'Precision (%)':<20} | {lr['precision']:<20} | {rf['precision']:<20}")
    print(f"{'Recall (%)':<20} | {lr['recall']:<20} | {rf['recall']:<20}")
    print(f"{'F1-Score (%)':<20} | {lr['f1_score']:<20} | {rf['f1_score']:<20}")
    print(f"{'ROC-AUC (%)':<20} | {lr['roc_auc']:<20} | {rf['roc_auc']:<20}")
    print("-" * 65)
    print(f"Optimal Model Selected: {metrics['best_model']}")
    print(f"Artifacts saved to directory: ./saved_models/")
    print("=" * 65)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train TruthLens AI models")
    parser.add_argument("--dataset", type=str, default=None, help="Path to custom CSV dataset with 'text' and 'label'")
    args = parser.parse_args()
    run_training_pipeline(args.dataset)
