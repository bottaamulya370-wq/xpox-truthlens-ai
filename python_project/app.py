"""
TruthLens AI - Professional Streamlit Web Application
Author: TruthLens AI Team (AIML Project)
Description: Interactive web dashboard for Fake News Detection, NLP preprocessing inspection,
dual-model evaluation (Logistic Regression vs Random Forest), Explainable AI, and PDF report generation.
"""

import streamlit as st
import pandas as pd
import numpy as np
import time
import io
from fpdf import FPDF
from datetime import datetime

# Import modular pipeline components
from preprocess import TextPreprocessor
from classifier import NewsClassifierService
from credibility_score import CredibilityScoreEngine
from explainability import ExplainabilityEngine
from dashboard import AnalyticsDashboardService

# Page configuration
st.set_page_config(
    page_title="TruthLens AI - Fake News Detection",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        color: #475569;
        font-size: 1.05rem;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 16px;
        text-align: center;
    }
    .verdict-real {
        background-color: #ecfdf5;
        border: 2px solid #10b981;
        color: #065f46;
        padding: 14px;
        border-radius: 10px;
        font-size: 1.3rem;
        font-weight: 700;
        text-align: center;
    }
    .verdict-fake {
        background-color: #fef2f2;
        border: 2px solid #ef4444;
        color: #991b1b;
        padding: 14px;
        border-radius: 10px;
        font-size: 1.3rem;
        font-weight: 700;
        text-align: center;
    }
    .highlight-suspicious {
        background-color: #fecaca;
        color: #7f1d1d;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
    }
    .highlight-credible {
        background-color: #bbf7d0;
        color: #14532d;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def load_services():
    """Initializes and caches core NLP, classification, and analytics services."""
    preprocessor = TextPreprocessor()
    classifier = NewsClassifierService()
    credibility = CredibilityScoreEngine()
    explainability = ExplainabilityEngine(classifier)
    dashboard = AnalyticsDashboardService()
    return preprocessor, classifier, credibility, explainability, dashboard

preprocessor, classifier, credibility, explainability, dashboard = load_services()


def generate_pdf_report(text: str, prediction: str, confidence: float, cred_data: dict, exp_data: dict, model_used: str) -> bytes:
    """Generates a professional PDF verification audit report using FPDF."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # Header
    pdf.set_font("Helvetica", "B", 20)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, "TruthLens AI - Verification Audit Report", ln=True, align="C")
    
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 6, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} UTC | Engine: {model_used}", ln=True, align="C")
    pdf.ln(8)

    # Executive Verdict Section
    pdf.set_font("Helvetica", "B", 14)
    pdf.set_text_color(30, 41, 59)
    pdf.cell(0, 8, "1. Executive Verdict & Confidence", ln=True)
    pdf.set_font("Helvetica", "", 11)
    
    verdict_str = f"Classification: {prediction.upper()} (Confidence: {confidence:.1f}%)"
    pdf.cell(0, 6, verdict_str, ln=True)
    pdf.cell(0, 6, f"Credibility Score: {cred_data['credibility_score']} / 100 ({cred_data['rating_tier']})", ln=True)
    pdf.ln(5)

    # Score breakdown
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, "2. Multi-Dimensional Score Breakdown", ln=True)
    pdf.set_font("Helvetica", "", 10)
    bd = cred_data["breakdown"]
    pdf.cell(0, 5, f"- ML Model Signal: {bd['ml_model_signal']} / 45.0", ln=True)
    pdf.cell(0, 5, f"- Neutrality & Anti-Sensationalism: {bd['neutrality_score']} / 25.0", ln=True)
    pdf.cell(0, 5, f"- Attribution & Citation Evidentiary: {bd['attribution_score']} / 20.0", ln=True)
    pdf.cell(0, 5, f"- Structural Integrity & Lexical Diversity: {bd['structure_score']} / 10.0", ln=True)
    pdf.ln(5)

    # Explainable AI Reasons
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, "3. Explainable AI Analysis & Salient Factors", ln=True)
    pdf.set_font("Helvetica", "", 10)
    for reason in exp_data.get("reasons", []):
        pdf.multi_cell(0, 5, f"* {reason}")
    pdf.ln(5)

    # Article Excerpt
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, "4. Analyzed Text Excerpt", ln=True)
    pdf.set_font("Helvetica", "I", 9)
    clean_snippet = text.strip()[:600].encode('latin-1', 'replace').decode('latin-1')
    pdf.multi_cell(0, 5, f'"{clean_snippet}..."')

    # Disclaimer
    pdf.ln(8)
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(148, 163, 184)
    pdf.multi_cell(0, 4, "TruthLens AI is an academic machine learning decision-support system. While models exhibit high benchmark accuracy, critical news evaluation should always be cross-referenced with authorized primary sources.")

    return pdf.output()


# ===================== SIDEBAR CONTROLS =====================
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/news.png", width=64)
    st.title("TruthLens AI")
    st.caption("NLP & Machine Learning Verification System")
    st.markdown("---")

    selected_page = st.radio(
        "Navigation",
        ["🔍 Article Detector", "📊 Model Comparison", "📈 Analytics Dashboard", "📘 Architecture & Docs"],
        index=0
    )

    st.markdown("---")
    st.subheader("Model Configuration")
    model_choice = st.selectbox(
        "Active Classifier",
        ["ensemble", "logistic_regression", "random_forest"],
        format_func=lambda x: {
            "ensemble": "Ensemble (LR + RF)",
            "logistic_regression": "Logistic Regression (L2)",
            "random_forest": "Random Forest Classifier"
        }[x]
    )

    st.info("💡 **Academic Note:** Ensemble model balances linear lexical weight transparency with non-linear feature interactions.")


# ===================== PAGE 1: ARTICLE DETECTOR =====================
if selected_page == "🔍 Article Detector":
    st.markdown('<div class="main-title">TruthLens AI - Fake News Detector</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Evaluate article authenticity using TF-IDF feature extraction, machine learning classification, and Explainable AI.</div>', unsafe_allow_html=True)

    # Sample articles selector for quick testing
    sample_col1, sample_col2, sample_col3 = st.columns([1, 1, 1])
    sample_choice = None
    with sample_col1:
        if st.button("📰 Load Real News Sample", use_container_width=True):
            st.session_state["news_input"] = (
                "NASA's James Webb Space Telescope has captured deep-field infrared imagery of a high-redshift galaxy "
                "cluster dating back 13 billion years, astrophysicists reported in Nature Astronomy. Dr. Elena Vance, lead "
                "author on the published findings, stated that spectroscopic data reveals elemental oxygen and carbon formation "
                "occurring far earlier in cosmic evolution than previously theorized. Independent researchers from Oxford University "
                "confirmed the observations through peer-reviewed calibration metrics."
            )
    with sample_col2:
        if st.button("🚨 Load Fake News Sample", use_container_width=True):
            st.session_state["news_input"] = (
                "SHOCKING EXCLUSIVE: Secret global cabal operates subterranean weather control machine to manipulate election "
                "outcomes! Mainstream media is covering this up, but a brave whistleblower exposed top-secret blueprint documents. "
                "Doctors are stunned and world elites are in a complete panic! Share this viral post before it gets banned forever! "
                "They don't want you to know the deadly hidden truth!"
            )
    with sample_col3:
        if st.button("🧹 Clear Input", use_container_width=True):
            st.session_state["news_input"] = ""

    # Input Mode: Paste or Upload
    input_tab1, input_tab2 = st.tabs(["✍️ Paste News Text", "📁 Upload File (.txt / .pdf)"])
    
    input_text = ""
    with input_tab1:
        input_text = st.text_area(
            "Enter Article Headline & Body Text:",
            value=st.session_state.get("news_input", ""),
            height=200,
            placeholder="Paste news content here for NLP classification..."
        )

    with input_tab2:
        uploaded_file = st.file_uploader("Upload news text or PDF document", type=["txt", "pdf"])
        if uploaded_file is not None:
            if uploaded_file.name.endswith(".txt"):
                input_text = uploaded_file.read().decode("utf-8", errors="ignore")
                st.success(f"Loaded text file: {uploaded_file.name}")
            elif uploaded_file.name.endswith(".pdf"):
                try:
                    import PyPDF2
                    pdf_reader = PyPDF2.PdfReader(io.BytesIO(uploaded_file.read()))
                    extracted_pages = [page.extract_text() for page in pdf_reader.pages if page.extract_text()]
                    input_text = "\n".join(extracted_pages)
                    st.success(f"Extracted {len(extracted_pages)} page(s) from {uploaded_file.name}")
                except Exception as e:
                    st.error(f"Failed to parse PDF file: {e}")

    # Action Button
    analyze_btn = st.button("🔬 Classify & Audit Article", type="primary", use_container_width=True)

    if analyze_btn and input_text.strip():
        with st.spinner("Executing NLP Pipeline & ML Classification..."):
            time.sleep(0.3)  # Smooth transition
            # 1. Preprocessing breakdown
            prep_data = preprocessor.get_pipeline_breakdown(input_text)
            
            # 2. ML Prediction
            pred_result = classifier.predict(input_text, model_type=model_choice)
            
            # 3. Credibility Score
            cred_result = credibility.compute_score(input_text, pred_result["real_probability"])
            
            # 4. Explainability
            exp_result = explainability.generate_explanation_report(
                input_text, pred_result["prediction"], pred_result["confidence"], cred_result
            )

            # 5. Log to dashboard
            dashboard.log_analysis(
                input_text,
                pred_result["prediction"],
                pred_result["confidence"],
                cred_result["credibility_score"],
                pred_result["model_used"]
            )

        st.markdown("---")

        # Results Grid
        col_res1, col_res2, col_res3 = st.columns([1.2, 1, 1])

        with col_res1:
            if pred_result["prediction"] == "Real News":
                st.markdown(f'<div class="verdict-real">✅ VERDICT: REAL NEWS<br><span style="font-size:0.9rem; font-weight:normal;">Confidence: {pred_result["confidence"]}% ({pred_result["model_used"]})</span></div>', unsafe_allow_html=True)
            else:
                st.markdown(f'<div class="verdict-fake">⚠️ VERDICT: FAKE NEWS<br><span style="font-size:0.9rem; font-weight:normal;">Confidence: {pred_result["confidence"]}% ({pred_result["model_used"]})</span></div>', unsafe_allow_html=True)

        with col_res2:
            st.metric(
                label="Credibility Score",
                value=f"{cred_result['credibility_score']} / 100",
                delta=cred_result["badge"]
            )

        with col_res3:
            st.metric(
                label="Lexical Diversity",
                value=f"{prep_data['lexical_diversity']}",
                delta=f"{prep_data['final_lemmas_count']} lemmas"
            )

        # Tabs for Deep Dive
        res_tab1, res_tab2, res_tab3, res_tab4 = st.tabs([
            "🧠 Explainable AI & Highlights",
            "🎛️ NLP Preprocessing Stages",
            "⚖️ Credibility Dimensions",
            "📄 PDF Audit Report"
        ])

        with res_tab1:
            st.subheader("Highlighted Article Vocabulary (Local Attribution)")
            st.caption("Tokens highlighted in red indicate sensationalist or suspicious features; green tokens indicate objective reporting markers.")
            
            annotated = exp_result["token_attributions"]
            rendered_words = []
            for item in annotated:
                w = item["word"]
                if item["category"] == "suspicious":
                    rendered_words.append(f'<span class="highlight-suspicious">{w}</span>')
                elif item["category"] == "credible":
                    rendered_words.append(f'<span class="highlight-credible">{w}</span>')
                else:
                    rendered_words.append(w)
            
            st.markdown(f"<div style='line-height:2.0; font-size:1.05rem;'>{' '.join(rendered_words)}</div>", unsafe_allow_html=True)

            st.markdown("#### Primary Decision Reasons:")
            for reason in exp_result["reasons"]:
                st.markdown(f"- 📌 **{reason}**")

        with res_tab2:
            st.subheader("NLP Preprocessing Pipeline Inspection")
            col_p1, col_p2, col_p3, col_p4 = st.columns(4)
            col_p1.metric("Raw Characters", prep_data["raw_character_count"])
            col_p2.metric("Raw Tokens", prep_data["raw_token_count"])
            col_p3.metric("Stop Words Removed", prep_data["stop_words_removed_count"])
            col_p4.metric("Canonical Lemmas", prep_data["final_lemmas_count"])

            st.markdown("**Sample Lemmatized Vocabulary fed to TF-IDF:**")
            st.code(" ".join(prep_data["lemmas_sample"]), language="text")

        with res_tab3:
            st.subheader("Multi-Dimensional Credibility Audit Breakdown")
            bd = cred_result["breakdown"]
            col_c1, col_c2, col_c3, col_c4 = st.columns(4)
            col_c1.metric("ML Signal (45%)", f"{bd['ml_model_signal']} pts")
            col_c2.metric("Neutrality (25%)", f"{bd['neutrality_score']} pts")
            col_c3.metric("Attribution (20%)", f"{bd['attribution_score']} pts")
            col_c4.metric("Structure (10%)", f"{bd['structure_score']} pts")

            st.progress(cred_result["credibility_score"] / 100.0)
            st.caption(f"Status: **{cred_result['rating_tier']}**")

        with res_tab4:
            st.subheader("Download Formal Verification Report")
            st.write("Generate a printable PDF dossier suitable for academic archiving or submission.")
            try:
                pdf_bytes = generate_pdf_report(
                    input_text,
                    pred_result["prediction"],
                    pred_result["confidence"],
                    cred_result,
                    exp_result,
                    pred_result["model_used"]
                )
                st.download_button(
                    label="📥 Download PDF Audit Dossier",
                    data=bytes(pdf_bytes),
                    file_name="TruthLens_Analysis_Report.pdf",
                    mime="application/pdf",
                    type="primary"
                )
            except Exception as e:
                st.error(f"PDF compilation error: {e}")

    elif analyze_btn and not input_text.strip():
        st.warning("Please enter or upload news content before initiating analysis.")


# ===================== PAGE 2: MODEL COMPARISON =====================
elif selected_page == "📊 Model Comparison":
    st.markdown('<div class="main-title">Machine Learning Model Comparison</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Benchmarking Logistic Regression vs. Random Forest on TF-IDF N-gram feature matrices.</div>', unsafe_allow_html=True)

    metrics = classifier.benchmark_metrics
    lr = metrics["logistic_regression"]
    rf = metrics["random_forest"]

    comp_df = pd.DataFrame([
        {"Metric": "Accuracy (%)", "Logistic Regression": lr["accuracy"], "Random Forest": rf["accuracy"]},
        {"Metric": "Precision (%)", "Logistic Regression": lr["precision"], "Random Forest": rf["precision"]},
        {"Metric": "Recall (%)", "Logistic Regression": lr["recall"], "Random Forest": rf["recall"]},
        {"Metric": "F1-Score (%)", "Logistic Regression": lr["f1_score"], "Random Forest": rf["f1_score"]},
        {"Metric": "ROC-AUC (%)", "Logistic Regression": lr["roc_auc"], "Random Forest": rf["roc_auc"]},
    ])

    st.dataframe(comp_df.set_index("Metric"), use_container_width=True)

    st.markdown("### Comparative Performance Chart")
    chart_data = pd.melt(comp_df, id_vars=["Metric"], var_name="Model", value_name="Score")
    st.bar_chart(chart_data, x="Metric", y="Score", color="Model")

    st.markdown("---")
    st.subheader("Architectural Comparison Highlights")
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("""
        **Logistic Regression (L2-Regularized)**
        - **Linear Separability:** Highly effective in high-dimensional sparse TF-IDF feature spaces.
        - **Inference Speed:** Sub-millisecond latency; highly transparent weights.
        - **Best For:** Direct token feature attribution and baseline credibility confidence.
        """)
    with c2:
        st.markdown("""
        **Random Forest Classifier (Ensemble Trees)**
        - **Non-Linear Interactions:** Captures multi-word combinatorial patterns.
        - **Robustness:** Resilient against single-word adversarial poisoning.
        - **Best For:** Complex stylistic news articles with subtle deceptive syntax.
        """)


# ===================== PAGE 3: ANALYTICS DASHBOARD =====================
elif selected_page == "📈 Analytics Dashboard":
    st.markdown('<div class="main-title">Analytics & Verification Telemetry</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Session-level aggregated metrics, Real vs. Fake ratios, and confidence trends.</div>', unsafe_allow_html=True)

    summary = dashboard.get_summary_metrics()

    m1, m2, m3, m4 = st.columns(4)
    m1.metric("Articles Analyzed", summary["total_articles"])
    m2.metric("Real News Ratio", f"{summary['real_percentage']}%", f"{summary['real_count']} articles")
    m3.metric("Fake News Ratio", f"{summary['fake_percentage']}%", f"{summary['fake_count']} articles")
    m4.metric("Avg Credibility", f"{summary['average_credibility']} / 100")

    st.markdown("---")
    c_hist1, c_hist2 = st.columns([1.2, 1])

    with c_hist1:
        st.subheader("Historical Verification Activity Log")
        hist_df = pd.DataFrame(dashboard.history)
        if not hist_df.empty:
            st.dataframe(hist_df[["timestamp", "title_snippet", "prediction", "confidence", "credibility_score"]], use_container_width=True)
        else:
            st.info("No articles analyzed yet in current session.")

    with c_hist2:
        st.subheader("Classification Distribution")
        dist_df = pd.DataFrame({
            "Verdict": ["Real News", "Fake News"],
            "Count": [summary["real_count"], summary["fake_count"]]
        })
        st.bar_chart(dist_df.set_index("Verdict"))


# ===================== PAGE 4: ARCHITECTURE & DOCS =====================
elif selected_page == "📘 Architecture & Docs":
    st.markdown('<div class="main-title">TruthLens AI - Academic Architecture & Documentation</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-title">Designed for 3rd-year AIML presentations, hackathons, and research portfolios.</div>', unsafe_allow_html=True)

    st.markdown("""
    ### 🏛️ Modular System Pipeline
    ```
    Raw Input Text / PDF
            │
            ▼
    [ preprocess.py ]  ──▶ Tokenization, Stop-word Filter, WordNet Lemmatizer
            │
            ▼
    [ classifier.py ]  ──▶ TF-IDF (1,2)-grams ──▶ Logistic Regression & Random Forest
            │
      ┌─────┴────────────────────────┐
      ▼                              ▼
    [ credibility_score.py ]    [ explainability.py ]
      │ (Attribution & Bias)        │ (Local Token Weights & Reasons)
      └──────────────┬───────────────┘
                     ▼
             [ dashboard.py ]
                     │
                     ▼
             [ app.py (Streamlit UI) ] ──▶ PDF Audit Dossier Download
    ```
    """)
