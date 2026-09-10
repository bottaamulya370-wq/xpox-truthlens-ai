/**
 * TruthLens AI - Client PDF Report Generator
 * Generates an executive verification dossier using jsPDF
 */

import { jsPDF } from 'jspdf';
import { CredibilityResult, ExplainabilityResult, ModelPrediction } from './nlpEngine';

export function downloadPdfReport(
  text: string,
  pred: ModelPrediction,
  cred: CredibilityResult,
  exp: ExplainabilityResult,
  modelName: string
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('TruthLens AI - News Verification Audit Report', 14, 16);

  y = 35;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const now = new Date().toLocaleString();
  doc.text(`Generated: ${now} | Verification Engine: ${modelName}`, 14, y);

  y += 10;
  // Verdict Box
  const isReal = pred.prediction === 'Real News';
  if (isReal) {
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
  } else {
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(239, 68, 68); // red-500
  }
  doc.setLineWidth(0.8);
  doc.roundedRect(14, y, pageWidth - 28, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  if (isReal) {
    doc.setTextColor(6, 95, 70); // emerald-800
  } else {
    doc.setTextColor(153, 27, 27); // red-800
  }
  doc.text(`VERDICT: ${pred.prediction.toUpperCase()}`, 20, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Confidence: ${pred.confidence}%  |  Credibility Score: ${cred.credibilityScore}/100  (${cred.badge})`,
    20,
    y + 18
  );

  y += 32;

  // Section 1: Credibility Dimension Breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Multi-Dimensional Credibility Audit', 14, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);

  const bd = cred.breakdown;
  const metrics = [
    `• ML Model Signal: ${bd.mlModelSignal} / 45.0 pts (Algorithmic text pattern classification)`,
    `• Neutrality & Anti-Sensationalism: ${bd.neutralityScore} / 25.0 pts (Clickbait & urgency penalties applied)`,
    `• Attribution & Evidentiary Citations: ${bd.attributionScore} / 20.0 pts (Named institutions, studies, quotes)`,
    `• Structural & Lexical Diversity: ${bd.structureScore} / 10.0 pts (Sentence richness and vocabulary balance)`,
  ];

  for (const m of metrics) {
    doc.text(m, 16, y);
    y += 5.5;
  }

  y += 4;

  // Section 2: Explainable AI
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Explainable AI (XAI) Salient Factors', 14, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  for (const reason of exp.reasons) {
    const lines = doc.splitTextToSize(`• ${reason}`, pageWidth - 32);
    doc.text(lines, 16, y);
    y += lines.length * 5;
  }

  if (exp.suspiciousWords.length > 0) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text('Suspicious / Clickbait Tokens Flagged:', 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const suspText = exp.suspiciousWords.join(', ');
    const sLines = doc.splitTextToSize(suspText, pageWidth - 32);
    doc.text(sLines, 16, y);
    y += sLines.length * 5;
  }

  if (exp.credibleWords.length > 0) {
    y += 2;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(21, 128, 61);
    doc.text('Credible / Authoritative Markers Verified:', 16, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const credText = exp.credibleWords.join(', ');
    const cLines = doc.splitTextToSize(credText, pageWidth - 32);
    doc.text(cLines, 16, y);
    y += cLines.length * 5;
  }

  y += 4;

  // Section 3: Article Excerpt
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Analyzed Article Excerpt', 14, y);
  y += 7;

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);

  const excerpt = text.length > 600 ? text.slice(0, 600) + '...' : text;
  const excerptLines = doc.splitTextToSize(`"${excerpt}"`, pageWidth - 32);
  doc.text(excerptLines, 16, y);
  y += excerptLines.length * 4.5;

  // Footer / Academic Disclaimer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Academic Disclaimer: TruthLens AI is an NLP decision-support system developed for AIML research and educational auditing.',
    14,
    285
  );

  doc.save(`TruthLens_Audit_Report_${Date.now()}.pdf`);
}
