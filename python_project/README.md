# TruthLens AI: Explainable Fake News Detection & Credibility Audit System

[![Python 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.31%2B-FF4B4B.svg)](https://streamlit.io/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4%2B-F7931E.svg)](https://scikit-learn.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

TruthLens AI is an end-to-end Machine Learning and Natural Language Processing (NLP) system designed to classify news articles as **Real** or **Fake**, compute a comprehensive **Credibility Score (0–100)**, and deliver **Explainable AI (XAI)** token attributions with automated PDF audit dossiers.

Engineered specifically for **3rd-Year AIML engineering students, final-year capstone reviews, internships, and hackathons**.

---

## 📂 Project Structure

```text
TruthLens-AI/
│
├── preprocess.py           # NLP Pipeline: Tokenization, Stop-words, Lemmatization
├── classifier.py           # ML Core: TF-IDF Vectorizer, Logistic Regression, Random Forest
├── credibility_score.py    # Multi-dimensional Credibility Engine (0-100 scale)
├── explainability.py       # Explainable AI (XAI): Suspicious words & reasoning engine
├── dashboard.py            # Analytics Telemetry & Session History Manager
├── app.py                  # Full Interactive Streamlit Web Application
├── train.py                # Standalone Model Training & Benchmarking CLI
├── requirements.txt        # Production Python dependencies
├── README.md               # Documentation, Dataset Setup, and Deployment Guide
│
├── saved_models/           # Serialized Joblib Model Artifacts
│   ├── tfidf_vectorizer.joblib
│   ├── logistic_regression.joblib
│   └── random_forest.joblib
│
└── data/                   # Dataset Directory
    └── news_dataset.csv    # (Optional: ISOT / Kaggle / WELFake CSV)
```

---

## 🔬 Core NLP & Machine Learning Architecture

### 1. NLP Preprocessing (`preprocess.py`)
- **Cleaning:** Strips URLs, HTML tags, emails, non-alphabetic noise.
- **Tokenization:** Splits natural text into semantic word units.
- **Stop-word Removal:** NLTK English stop-words filtering.
- **Lemmatization:** WordNet Lemmatizer mapping inflected verbs and nouns to base dictionary roots.

### 2. Machine Learning Engine (`classifier.py`)
- **Feature Extraction:** Sublinear TF-IDF (Term Frequency-Inverse Document Frequency) with unigram and bigram ranges (`ngram_range=(1,2)`).
- **Logistic Regression:** L2-regularized linear model offering rapid inference and direct coefficient interpretability.
- **Random Forest Classifier:** Ensemble of 100 decision trees (`n_estimators=100`, `max_depth=15`) capturing non-linear phrase interactions.
- **Model Comparator:** Live side-by-side benchmark reporting Accuracy, Precision, Recall, F1-Score, and ROC-AUC.

### 3. Credibility Score Engine (`credibility_score.py`)
Combines statistical probability with rule-based journalistic standards:
- **ML Probability Signal (45%)**
- **Linguistic Neutrality & Anti-Sensationalism (25%):** Penalizes clickbait triggers, ALL-CAPS screaming, and multiple exclamation marks.
- **Attribution & Citations (20%):** Rewards cited institutions (e.g., Reuters, AP, Nature), spokesperson quotes, and empirical data markers.
- **Structural Integrity (10%):** Assesses document length and lexical diversity.

### 4. Explainable AI (`explainability.py`)
- **Local Feature Attribution:** Highlights suspicious words in **red** and objective factual words in **green**.
- **Reasoning Generation:** Formulates structured, human-readable bullet points justifying the classification for judges and peer review.

---

## 🚀 Quickstart & Local Setup

### 1. Clone or Extract the Repository
```bash
git clone https://github.com/your-username/TruthLens-AI.git
cd TruthLens-AI
```

### 2. Create and Activate Virtual Environment
```bash
# On Linux / macOS:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Launch the Streamlit Web Application
```bash
streamlit run app.py
```
Open your browser at `http://localhost:8501`.

---

## 📊 Dataset Setup & Model Training

TruthLens AI comes with an embedded seed dataset for instant demonstration. To train on full benchmark datasets (e.g., Kaggle Fake News or ISOT):

1. Download dataset CSV from Kaggle:
   - [Kaggle Fake News Dataset](https://www.kaggle.com/c/fake-news/data) or [ISOT Fake News Dataset](https://www.uvic.ca/engineering/ece/isot/datasets/fake-news/index.php).
2. Place the CSV inside `data/news_dataset.csv`. Ensure columns include `text` (article content) and `label` (`1` for Real, `0` for Fake).
3. Run the training script:
```bash
python train.py --dataset data/news_dataset.csv
```

The script will automatically train the TF-IDF vectorizer, fit both Logistic Regression and Random Forest models, print a benchmark comparison matrix, and serialize the models into `saved_models/`.

---

## 🌐 Deployment Instructions

### Streamlit Community Cloud (Recommended & Free)
1. Push this directory to a public GitHub repository.
2. Visit [share.streamlit.io](https://share.streamlit.io) and link your GitHub account.
3. Select your repository, set branch to `main`, and main file path to `app.py`.
4. Click **Deploy**. Your app will be live with a public URL in 2 minutes!

### Docker Deployment
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8501
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```
Build and run:
```bash
docker build -t truthlens-ai .
docker run -p 8501:8501 truthlens-ai
```

---

## 🎓 Viva & Presentation Preparation (For AIML Students)

**Q1: Why use TF-IDF over simple Bag-of-Words (CountVectorizer)?**
> *Answer:* Bag-of-Words solely measures frequency, meaning ubiquitous words dominate the feature space. TF-IDF penalizes common terms across all documents while emphasizing rare, discriminative keywords that define sensationalist versus factual reporting.

**Q2: Why compare Logistic Regression with Random Forest?**
> *Answer:* Logistic Regression acts as a high-performing baseline in sparse, high-dimensional text spaces ($V > 5000$) with convex optimization. Random Forest models non-linear interactions between co-occurring clickbait phrases, allowing comparative evaluation of variance vs. bias trade-offs.

**Q3: How is the Credibility Score calculated?**
> *Answer:* Rather than treating the ML output as a black box, the Credibility Score synthesizes the model's posterior probability (45%) with linguistic indicators including sensationalism penalties (25%), institutional citation boosts (20%), and lexical diversity (10%).

---

## 📄 License
Released under the [MIT License](LICENSE). Built for academic, research, and educational excellence.
