"""
TruthLens AI - PDF Report Generator Module
Author: TruthLens AI Team
Description: Generates an executive verification audit PDF report with prediction results,
credibility scores, explainable AI rationales, and token attributions.
"""

import io
from datetime import datetime
from typing import Dict, Any

try:
    from fpdf import FPDF
    FPDF_AVAILABLE = True
except ImportError:
    FPDF_AVAILABLE = False


class PDFReportGenerator:
    """Creates downloadable PDF audit dossiers for news verification."""

    @staticmethod
    def generate_pdf_bytes(
        text: str,
        prediction_result: Dict[str, Any],
        credibility_result: Dict[str, Any],
        explainability_result: Dict[str, Any],
        model_name: str = "Ensemble (LR + RF)"
    ) -> bytes:
        """Builds a formatted PDF in-memory and returns raw bytes."""
        if not FPDF_AVAILABLE:
            # Fallback text representation if fpdf is missing
            fallback = f"""TRUTHLENS AI - VERIFICATION AUDIT REPORT
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Model: {model_name}
==================================================
PREDICTION: {prediction_result.get('prediction', 'Unknown')}
CONFIDENCE: {prediction_result.get('confidence', 0)}%
CREDIBILITY SCORE: {credibility_result.get('score', 0)}/100 ({credibility_result.get('badge', '')})
==================================================
EXPLAINABLE AI REASONS:
""" + "\n".join([f"- {r}" for r in explainability_result.get('reasons', [])]) + f"""

SUSPICIOUS KEYWORDS: {', '.join(explainability_result.get('suspicious_tokens', []))}
CREDIBLE KEYWORDS: {', '.join(explainability_result.get('credible_tokens', []))}

ANALYZED EXCERPT:
{text[:400]}...
"""
            return fallback.encode("utf-8")

        pdf = FPDF(orientation="P", unit="mm", format="A4")
        pdf.set_auto_page_break(auto=True, margin=15)
        pdf.add_page()

        # Header Title Banner
        pdf.set_fill_color(15, 23, 42)  # Dark slate
        pdf.rect(0, 0, 210, 24, "F")

        pdf.set_text_color(255, 255, 255)
        pdf.set_font("Helvetica", "B", 16)
        pdf.set_xy(14, 8)
        pdf.cell(0, 8, "TruthLens AI - News Verification Audit Report", ln=True)

        # Metadata Subtitle
        pdf.set_text_color(100, 116, 139)
        pdf.set_font("Helvetica", "", 9)
        pdf.set_xy(14, 28)
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        pdf.cell(0, 6, f"Audit Timestamp: {now_str}  |  Engine: {model_name}", ln=True)

        # Verdict Highlight Box
        is_real = prediction_result.get("prediction") == "Real News"
        pred_label = prediction_result.get("prediction", "Unknown")
        confidence = prediction_result.get("confidence", 0)
        cred_score = credibility_result.get("score", 0)
        cred_badge = credibility_result.get("badge", "")

        pdf.ln(3)
        if is_real:
            pdf.set_fill_color(236, 253, 245)
            pdf.set_draw_color(16, 185, 129)
            pdf.set_text_color(6, 95, 70)
        else:
            pdf.set_fill_color(254, 242, 242)
            pdf.set_draw_color(239, 68, 68)
            pdf.set_text_color(153, 27, 27)

        pdf.set_line_width(0.6)
        y_box = pdf.get_y()
        pdf.rect(14, y_box, 182, 22, "FD")

        pdf.set_xy(18, y_box + 3)
        pdf.set_font("Helvetica", "B", 13)
        pdf.cell(0, 6, f"VERDICT: {pred_label.upper()}", ln=True)

        pdf.set_xy(18, y_box + 11)
        pdf.set_font("Helvetica", "", 10)
        pdf.set_text_color(30, 41, 59)
        pdf.cell(
            0,
            6,
            f"Confidence: {confidence}%   |   Credibility Score: {cred_score}/100   ({cred_badge})",
            ln=True,
        )

        pdf.set_y(y_box + 26)

        # Section 1: Credibility Score Breakdown
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 7, "1. Multi-Dimensional Credibility Audit Breakdown", ln=True)

        bd = credibility_result.get("breakdown", {})
        pdf.set_font("Helvetica", "", 9.5)
        pdf.set_text_color(51, 65, 85)

        dimensions = [
            f"- ML Model Classification Signal: {bd.get('ml_signal', 0)} / 45.0 pts",
            f"- Neutrality & Anti-Sensationalism: {bd.get('neutrality', 0)} / 25.0 pts",
            f"- Evidentiary Citations & Attribution: {bd.get('attribution', 0)} / 20.0 pts",
            f"- Lexical & Structural Balance: {bd.get('structure', 0)} / 10.0 pts",
        ]
        for dim in dimensions:
            pdf.set_x(18)
            pdf.cell(0, 5.5, dim, ln=True)

        pdf.ln(3)

        # Section 2: Explainable AI Factors
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 7, "2. Explainable AI (XAI) Salient Cues", ln=True)

        pdf.set_font("Helvetica", "", 9.5)
        pdf.set_text_color(51, 65, 85)
        for reason in explainability_result.get("reasons", []):
            clean_reason = reason.encode("latin-1", "replace").decode("latin-1")
            pdf.set_x(18)
            pdf.multi_cell(174, 5, f"* {clean_reason}")

        # Suspicious keywords
        susp_tokens = explainability_result.get("suspicious_tokens", [])
        if susp_tokens:
            pdf.ln(2)
            pdf.set_x(18)
            pdf.set_font("Helvetica", "B", 9.5)
            pdf.set_text_color(185, 28, 28)
            pdf.cell(0, 5, f"Suspicious Keywords: {', '.join(susp_tokens)}", ln=True)

        # Credible keywords
        cred_tokens = explainability_result.get("credible_tokens", [])
        if cred_tokens:
            pdf.ln(1)
            pdf.set_x(18)
            pdf.set_font("Helvetica", "B", 9.5)
            pdf.set_text_color(21, 128, 61)
            pdf.cell(0, 5, f"Credible Keywords: {', '.join(cred_tokens)}", ln=True)

        pdf.ln(4)

        # Section 3: Analyzed Text Excerpt
        pdf.set_text_color(15, 23, 42)
        pdf.set_font("Helvetica", "B", 12)
        pdf.cell(0, 7, "3. Analyzed Article Excerpt", ln=True)

        pdf.set_font("Helvetica", "I", 8.5)
        pdf.set_text_color(100, 116, 139)
        excerpt = text[:500] + ("..." if len(text) > 500 else "")
        clean_excerpt = excerpt.encode("latin-1", "replace").decode("latin-1")
        pdf.set_x(18)
        pdf.multi_cell(174, 4.5, f'"{clean_excerpt}"')

        # Footer
        pdf.set_y(-18)
        pdf.set_font("Helvetica", "", 7.5)
        pdf.set_text_color(148, 163, 184)
        pdf.cell(
            0,
            6,
            "TruthLens AI | AIML Capstone Project | Scikit-learn, NLTK, spaCy & Streamlit",
            align="C",
        )

        return pdf.output(dest="S").encode("latin-1")
