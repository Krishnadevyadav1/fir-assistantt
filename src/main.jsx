import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle.js";
import BadgeCheck from "lucide-react/dist/esm/icons/badge-check.js";
import ClipboardList from "lucide-react/dist/esm/icons/clipboard-list.js";
import Download from "lucide-react/dist/esm/icons/download.js";
import FileText from "lucide-react/dist/esm/icons/file-text.js";
import Gavel from "lucide-react/dist/esm/icons/gavel.js";
import Heart from "lucide-react/dist/esm/icons/heart.js";
import Loader2 from "lucide-react/dist/esm/icons/loader-2.js";
import Scale from "lucide-react/dist/esm/icons/scale.js";
import ShieldCheck from "lucide-react/dist/esm/icons/shield-check.js";
import Sparkles from "lucide-react/dist/esm/icons/sparkles.js";
import upPoliceHq from "./assets/up-police-hq.jpg";
import upPoliceLogo from "./assets/up-police-logo.png";
import "./styles.css";

const sampleComplaint =
  "A person called me on WhatsApp pretending to be a CBI officer. He said my Aadhaar was linked to money laundering and kept me on video call for six hours. He sent fake arrest documents and forced me to transfer Rs 2,40,000 to two bank accounts for verification.";

const hindiSampleComplaint =
  "मुझे व्हाट्सऐप पर एक व्यक्ति ने कॉल करके स्वयं को सीबीआई अधिकारी बताया। उसने कहा कि मेरा आधार नंबर मनी लॉन्ड्रिंग मामले से जुड़ा है और मुझे छह घंटे तक वीडियो कॉल पर रखा। उसने नकली गिरफ्तारी दस्तावेज भेजे और सत्यापन के नाम पर मुझसे दो बैंक खातों में 2,40,000 रुपये ट्रांसफर करवा लिए।";

const workflowCards = [
  { icon: FileText, title: "Complaint Intake", text: "Victim statement capture" },
  { icon: Sparkles, title: "AI Classification", text: "Meaning-based cyber category" },
  { icon: Gavel, title: "FIR Sections", text: "IT Act and BNS suggestions" },
  { icon: ClipboardList, title: "Evidence", text: "Digital proof checklist" },
  { icon: BadgeCheck, title: "Officer Review", text: "Final verification before FIR" }
];

const uiText = {
  English: {
    pageEyebrow: "Cyber Cell Console",
    pageTitle: "Complaint Intake and FIR Support",
    pageSubtitle: "Enter the complaint statement and review AI-assisted classification output.",
    back: "Back to Overview",
    navIntake: "Intake",
    navAnalysis: "Analysis",
    navSections: "FIR Sections",
    overview: "Overview",
    startCase: "Start Case",
    cyberCell: "Cyber Cell",
    intakeDesk: "Complaint Intake Desk",
    complaintStatement: "Complaint Statement",
    describeIncident: "Describe the incident",
    placeholder: "Paste or type the complaint here...",
    useSample: "Use Sample",
    classify: "Classify",
    characters: "characters",
    readyTitle: "Ready to classify a complaint",
    readyText: "Enter the victim statement, incident details, and available digital evidence. The analysis will appear here after the LLM reviews the complaint.",
    loadingTitle: "AI is analyzing the complaint",
    loadingText: "Reading the statement, identifying the cyber-crime pattern, and preparing FIR section suggestions.",
    loadingSteps: ["Complaint meaning", "Offence category", "Legal sections"],
    classification: "Classification",
    primaryCategory: "Primary category",
    severity: "Severity",
    confidence: "LLM confidence",
    firSections: "Suggested FIR Sections",
    evidence: "Evidence Checklist",
    missing: "Missing Facts",
    actions: "Immediate Actions",
    caveats: "Caveats",
    reportReady: "Analysis complete",
    reportText: "Complaint assessment report is ready",
    download: "Download Report",
    section: "Section",
    notClassified: "Not classified",
    verify: "Verify"
  },
  Hindi: {
    pageEyebrow: "साइबर सेल कंसोल",
    pageTitle: "शिकायत दर्ज एवं FIR सहायता",
    pageSubtitle: "शिकायत का विवरण दर्ज करें और एआई आधारित वर्गीकरण परिणाम देखें।",
    back: "मुख्य पृष्ठ पर वापस जाएँ",
    navIntake: "शिकायत दर्ज",
    navAnalysis: "विश्लेषण",
    navSections: "FIR धाराएँ",
    overview: "मुख्य पृष्ठ",
    startCase: "नई शिकायत",
    cyberCell: "साइबर सेल",
    intakeDesk: "शिकायत दर्ज डेस्क",
    complaintStatement: "शिकायत का विवरण",
    describeIncident: "घटना का पूरा विवरण लिखें",
    placeholder: "शिकायत यहाँ लिखें या पेस्ट करें...",
    useSample: "उदाहरण भरें",
    classify: "वर्गीकरण करें",
    characters: "अक्षर",
    readyTitle: "शिकायत के वर्गीकरण के लिए तैयार",
    readyText: "पीड़ित का बयान, घटना का विवरण और उपलब्ध डिजिटल साक्ष्य दर्ज करें। एआई समीक्षा के बाद विश्लेषण यहाँ दिखाई देगा।",
    loadingTitle: "एआई शिकायत का विश्लेषण कर रहा है",
    loadingText: "बयान पढ़ा जा रहा है, साइबर अपराध की प्रकृति पहचानी जा रही है और FIR धाराओं के सुझाव तैयार किए जा रहे हैं।",
    loadingSteps: ["शिकायत का अर्थ", "अपराध श्रेणी", "कानूनी धाराएँ"],
    classification: "वर्गीकरण",
    primaryCategory: "मुख्य अपराध श्रेणी",
    severity: "गंभीरता",
    confidence: "एआई विश्वास स्तर",
    firSections: "सुझाई गई FIR धाराएँ",
    evidence: "साक्ष्य सूची",
    missing: "आवश्यक अतिरिक्त तथ्य",
    actions: "तत्काल कार्रवाई",
    caveats: "कानूनी सावधानियाँ",
    reportReady: "विश्लेषण पूर्ण",
    reportText: "शिकायत मूल्यांकन रिपोर्ट तैयार है",
    download: "रिपोर्ट डाउनलोड करें",
    section: "धारा",
    notClassified: "वर्गीकृत नहीं",
    verify: "सत्यापन आवश्यक"
  }
};

function isHindiComplaint(text) {
  return /[\u0900-\u097F]/.test(text || "");
}

function getLanguage(result, complaint) {
  return result?.responseLanguage === "Hindi" || isHindiComplaint(complaint) ? "Hindi" : "English";
}

function localizeResultValue(value, language) {
  if (language !== "Hindi") {
    return value;
  }

  const translations = {
    Low: "कम",
    Medium: "मध्यम",
    High: "उच्च",
    Critical: "अत्यंत गंभीर",
    Primary: "मुख्य",
    "Add-on": "अतिरिक्त",
    Verify: "सत्यापन आवश्यक"
  };

  return translations[value] || value;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function reportList(items, emptyText = "None recorded.") {
  if (!Array.isArray(items) || items.length === 0) {
    return `<p>${escapeHtml(emptyText)}</p>`;
  }

  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function downloadReport(complaint, result) {
  const generatedAt = new Date(result.generatedAt || Date.now());
  const sections = Array.isArray(result.suggestedSections) ? result.suggestedSections : [];
  const confidence = Math.round(Number(result.confidence || 0) * 100);
  const language = getLanguage(result, complaint);
  const hindi = language === "Hindi";
  const labels = hindi
    ? {
        title: "साइबर अपराध शिकायत विश्लेषण रिपोर्ट",
        generated: "तैयार करने की तिथि",
        complaint: "शिकायत का विवरण",
        classification: "वर्गीकरण",
        severity: "गंभीरता",
        confidence: "एआई विश्वास स्तर",
        sections: "सुझाई गई FIR धाराएँ",
        evidence: "साक्ष्य सूची",
        missing: "आवश्यक अतिरिक्त तथ्य",
        actions: "तत्काल कार्रवाई",
        caveats: "कानूनी सावधानियाँ",
        none: "कोई जानकारी दर्ज नहीं है।",
        footer: "यह एआई आधारित रिपोर्ट प्रारंभिक शिकायत मूल्यांकन में सहायता के लिए है। लागू कानूनी धाराओं का सत्यापन अधिकृत अधिकारी द्वारा पूर्ण तथ्यों और वर्तमान कानून के अनुसार किया जाना आवश्यक है।"
      }
    : {
        title: "Cyber Crime Complaint Analysis Report",
        generated: "Generated",
        complaint: "Complaint Statement",
        classification: "Classification",
        severity: "Severity",
        confidence: "AI confidence",
        sections: "Suggested FIR Sections",
        evidence: "Evidence Checklist",
        missing: "Missing Facts",
        actions: "Immediate Actions",
        caveats: "Caveats",
        none: "None recorded.",
        footer: "This AI-assisted report supports preliminary complaint assessment. Applicable legal provisions must be verified against the complete facts and current law by the authorised officer."
      };
  const report = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${labels.title}</title>
  <style>
    body { margin: 0; padding: 40px; color: #172033; font: 15px/1.55 Arial, sans-serif; background: #f3f5f7; }
    main { max-width: 900px; margin: auto; padding: 38px; background: white; border-top: 6px solid #0f766e; }
    header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 1px solid #d9e0e7; padding-bottom: 22px; }
    h1 { margin: 0; font-size: 27px; } h2 { margin: 28px 0 10px; color: #0f5f59; font-size: 18px; }
    h3 { margin: 0 0 5px; font-size: 16px; } p { margin: 6px 0; } ul { margin: 8px 0; padding-left: 22px; }
    .meta { color: #5f6b78; text-align: right; } .summary { padding: 16px; background: #eef8f6; border-left: 4px solid #0f766e; }
    .law { margin: 12px 0; padding: 15px; border: 1px solid #d9e0e7; border-radius: 6px; }
    .tag { display: inline-block; margin-left: 8px; padding: 2px 8px; border-radius: 20px; color: #11453f; background: #d8f3ed; font-size: 12px; font-weight: bold; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; } .footer { margin-top: 34px; padding-top: 16px; border-top: 1px solid #d9e0e7; color: #687480; font-size: 12px; }
    @media print { body { padding: 0; background: white; } main { max-width: none; } }
    @media (max-width: 650px) { body { padding: 12px; } main { padding: 20px; } header, .grid { display: block; } .meta { margin-top: 12px; text-align: left; } }
  </style>
</head>
<body>
<main>
  <header><div><strong>Amroha Police - Cyber Cell</strong><h1>${labels.title}</h1></div><div class="meta">${labels.generated}: ${escapeHtml(generatedAt.toLocaleString(hindi ? "hi-IN" : "en-IN"))}</div></header>
  <h2>${labels.complaint}</h2><p>${escapeHtml(complaint)}</p>
  <h2>${labels.classification}</h2><div class="summary"><h3>${escapeHtml(result.primaryCategory)}</h3><p><strong>${labels.severity}:</strong> ${escapeHtml(localizeResultValue(result.severity, language))} &nbsp; <strong>${labels.confidence}:</strong> ${confidence}%</p><p>${escapeHtml(result.complaintSummary)}</p></div>
  <h2>${labels.sections}</h2>
  ${sections.map((item) => `<div class="law"><h3>${escapeHtml(item.law)} - ${hindi ? "धारा" : "Section"} ${escapeHtml(item.section)} <span class="tag">${escapeHtml(localizeResultValue(item.firUse, language))}</span></h3><p><strong>${escapeHtml(item.title)}</strong></p><p>${escapeHtml(item.fitReason)}</p></div>`).join("") || `<p>${labels.none}</p>`}
  <div class="grid"><section><h2>${labels.evidence}</h2>${reportList(result.evidenceChecklist, labels.none)}</section><section><h2>${labels.missing}</h2>${reportList(result.missingFacts, labels.none)}</section></div>
  <div class="grid"><section><h2>${labels.actions}</h2>${reportList(result.immediateActions, labels.none)}</section><section><h2>${labels.caveats}</h2>${reportList(result.caveats, labels.none)}</section></div>
  <p class="footer">${labels.footer}</p>
</main>
</body>
</html>`;

  const blob = new Blob([report], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `cyber-complaint-report-${generatedAt.toISOString().slice(0, 10)}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function Header({ onNavigate, activeSection, language }) {
  const text = uiText[language];

  return (
    <header className="topbar">
      <button className="brand brand-button" type="button" onClick={() => onNavigate("home")}>
        <div className="brand-logos">
          <img src={upPoliceLogo} alt="Uttar Pradesh Police logo" />
        </div>
        <div>
          <span className="brand-name">Amroha Police</span>
          <span className="brand-subtitle">Uttar Pradesh Police</span>
        </div>
      </button>

      <nav className="nav-pills" aria-label="Primary">
        <button
          className={activeSection === "intake" ? "active-nav" : ""}
          type="button"
          onClick={() => onNavigate("intake")}
        >
          {text.navIntake}
        </button>
        <button
          className={activeSection === "analysis" ? "active-nav" : ""}
          type="button"
          onClick={() => onNavigate("analysis")}
        >
          {text.navAnalysis}
        </button>
        <button
          className={activeSection === "sections" ? "active-nav" : ""}
          type="button"
          onClick={() => onNavigate("sections")}
        >
          {text.navSections}
        </button>
      </nav>

      <div className="top-actions">
        <button className="desk-button" type="button" onClick={() => onNavigate("home")}>
          {text.overview}
        </button>
        <button className="start-case-button" type="button" onClick={() => onNavigate("new-case")}>
          {text.startCase}
        </button>
      </div>
    </header>
  );
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="panel">
      <div className="section-title">
        <Icon size={18} />
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function List({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <p className="muted">No items returned.</p>;
  }

  return (
    <ul className="clean-list">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>{item}</li>
      ))}
    </ul>
  );
}

function ConfidenceMeter({ value, label }) {
  const percent = Math.max(0, Math.min(100, Math.round(Number(value || 0) * 100)));

  return (
    <div className="confidence">
      <div className="confidence-head">
        <span>{label}</span>
        <strong>{percent}%</strong>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function LoadingAnalysis({ text }) {
  return (
    <div className="analysis-loading" role="status" aria-live="polite">
      <div className="loading-orbit">
        <Loader2 className="spin" size={34} />
        <Sparkles size={18} />
      </div>
      <h2>{text.loadingTitle}</h2>
      <p>{text.loadingText}</p>
      <div className="loading-steps">
        {text.loadingSteps.map((step) => <span key={step}>{step}</span>)}
      </div>
    </div>
  );
}

function Results({ result, loading, complaint, selectedLanguage }) {
  const language = result?.responseLanguage || selectedLanguage;
  const text = uiText.English;

  if (loading) {
    return <LoadingAnalysis text={text} />;
  }

  if (!result) {
    return (
      <div className="empty-state">
        <ShieldCheck size={38} />
        <h2>{text.readyTitle}</h2>
        <p>{text.readyText}</p>
      </div>
    );
  }

  const sections = Array.isArray(result.suggestedSections) ? result.suggestedSections : [];

  return (
    <div className="results">
      <div className="report-actions">
        <div>
          <span>{text.reportReady}</span>
          <strong>{text.reportText}</strong>
        </div>
        <button type="button" onClick={() => downloadReport(complaint, result)}>
          <Download size={17} />
          {text.download}
        </button>
      </div>
      <Section icon={Sparkles} title={text.classification}>
        <div className="summary-grid">
          <div>
            <span className="label">{text.primaryCategory}</span>
            <h3>{result.primaryCategory || text.notClassified}</h3>
          </div>
          <div>
            <span className="label">{text.severity}</span>
            <Badge tone="warning">
              {localizeResultValue(result.severity, language) || text.verify}
            </Badge>
          </div>
        </div>
        <p className="summary">{result.complaintSummary}</p>
        <ConfidenceMeter value={result.confidence} label={text.confidence} />
        <div className="chips">
          {(result.secondaryCategories || []).map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
        </div>
      </Section>

      <div id="sections">
        <Section icon={Gavel} title={text.firSections}>
        <div className="law-list">
          {sections.map((item, index) => (
            <article className="law-item" key={`${item.law}-${item.section}-${index}`}>
              <div>
                <div className="law-heading">
                  <strong>{item.law}</strong>
                  <Badge tone={item.firUse === "Primary" ? "success" : "neutral"}>
                    {localizeResultValue(item.firUse, language) || text.verify}
                  </Badge>
                </div>
                <h3>{text.section} {item.section}: {item.title}</h3>
                <p>{item.fitReason}</p>
              </div>
            </article>
          ))}
        </div>
        </Section>
      </div>

      <div className="two-col">
        <Section icon={ClipboardList} title={text.evidence}>
          <List items={result.evidenceChecklist} />
        </Section>
        <Section icon={AlertCircle} title={text.missing}>
          <List items={result.missingFacts} />
        </Section>
      </div>

      <div className="two-col">
        <Section icon={BadgeCheck} title={text.actions}>
          <List items={result.immediateActions} />
        </Section>
        <Section icon={Scale} title={text.caveats}>
          <List items={result.caveats} />
        </Section>
      </div>
    </div>
  );
}

function IntakePage({
  complaint,
  setComplaint,
  result,
  error,
  loading,
  isOnline,
  selectedLanguage,
  onLanguageChange,
  classifyComplaint,
  onBack
}) {
  const charCount = complaint.trim().length;
  const language = selectedLanguage;
  const pageText = uiText.English;
  const formText = uiText[language];
  const canSubmit = useMemo(
    () => charCount >= 30 && !loading && isOnline,
    [charCount, loading, isOnline]
  );

  return (
    <section className="intake-page" aria-label="Complaint intake workspace">
      <div className="intake-titlebar">
        <div className="intake-heading">
          <div>
            <span className="eyebrow light">{pageText.pageEyebrow}</span>
            <h1>{pageText.pageTitle}</h1>
            <p>{pageText.pageSubtitle}</p>
          </div>
        </div>
        <div className="intake-title-actions">
          <div className="language-toggle" aria-label="Complaint language">
            <button
              className={language === "English" ? "active" : ""}
              type="button"
              onClick={() => onLanguageChange("English")}
            >
              English
            </button>
            <button
              className={language === "Hindi" ? "active" : ""}
              type="button"
              onClick={() => onLanguageChange("Hindi")}
            >
              हिन्दी
            </button>
          </div>
          <button className="back-button" type="button" onClick={onBack}>
            {pageText.back}
          </button>
        </div>
      </div>

      <div className={`workspace ${result ? "workspace-has-result" : ""}`} id="intake">
        <section className="input-panel">
          <div className="station-strip">
            <img src={upPoliceLogo} alt="" />
            <div>
              <span>{pageText.cyberCell}</span>
              <strong>{pageText.intakeDesk}</strong>
            </div>
          </div>

          <div className="panel-head">
            <FileText size={20} />
            <h2>{formText.complaintStatement}</h2>
          </div>

          {!isOnline && (
            <div className="offline-box" role="alert">
              <AlertCircle size={18} />
              <div>
                <strong>You are not connected to the internet</strong>
                <span>Reconnect to continue complaint classification.</span>
              </div>
            </div>
          )}

          <form onSubmit={classifyComplaint}>
            <label htmlFor="complaint">{formText.describeIncident}</label>
            <textarea
              id="complaint"
              value={complaint}
              onChange={(event) => setComplaint(event.target.value)}
              placeholder={formText.placeholder}
            />

            <div className="form-footer">
              <span className={charCount < 30 ? "counter counter-warn" : "counter"}>
                {charCount}/5000 {formText.characters}
              </span>
              <button
                type="button"
                className="ghost-btn"
                onClick={() => setComplaint(language === "Hindi" ? hindiSampleComplaint : sampleComplaint)}
              >
                {formText.useSample}
              </button>
              <button type="submit" disabled={!canSubmit}>
                {loading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
                {formText.classify}
              </button>
            </div>
          </form>

          {error && (
            <div className="error-box" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

        </section>

        <div id="analysis">
          <Results
            result={result}
            loading={loading}
            complaint={complaint}
            selectedLanguage={selectedLanguage}
          />
        </div>
      </div>
    </section>
  );
}

function HomePage({ onNavigate, setComplaint }) {
  return (
    <>
      <div className="hero-content">
        <div className="hero-copy">
          <span className="eyebrow light">AI Decision Support for Law Enforcement</span>
          <h1>
            Classify cyber complaints and suggest <span>FIR sections</span> fast
          </h1>
          <p>
            A field-ready intake console for UP Police officers to convert victim
            statements into cyber-crime categories, legal section suggestions, missing
            facts, and evidence priorities.
          </p>
          <div className="hero-actions">
            <button className="primary-link" type="button" onClick={() => onNavigate("intake")}>
              Open Intake
            </button>
            <button
              type="button"
              className="secondary-link"
              onClick={() => {
                setComplaint(sampleComplaint);
                onNavigate("intake");
              }}
            >
              Load Sample
            </button>
          </div>
        </div>

        <div className="process-map" aria-label="Workflow map">
          <div className="process-cell muted-cell">Complaint received</div>
          <div className="process-cell active-cell">Meaning analysis</div>
          <div className="process-cell">Cyber category</div>
          <div className="process-cell">IT Act / BNS mapping</div>
          <div className="process-cell">Evidence checklist</div>
          <div className="process-cell wide-cell">Officer verification and FIR support</div>
        </div>
      </div>

      <div className="workflow-strip">
        {workflowCards.map(({ icon: Icon, title, text }) => (
          <article className="workflow-card" key={title}>
            <Icon size={24} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function App() {
  const [page, setPage] = useState("home");
  const [activeSection, setActiveSection] = useState("home");
  const [complaint, setComplaint] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setError("");
    };
    const handleOffline = () => {
      setIsOnline(false);
      setError("You are not connected to the internet. Reconnect and try again.");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  function navigateTo(destination) {
    if (destination === "home") {
      setPage("home");
      setActiveSection("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (destination === "new-case") {
      setComplaint("");
      setResult(null);
      setError("");
      setLoading(false);
      setPage("intake");
      setActiveSection("intake");
      window.setTimeout(() => document.getElementById("complaint")?.focus(), 50);
      return;
    }

    setPage("intake");
    setActiveSection(destination);

    if ((destination === "analysis" || destination === "sections") && !result) {
      setError("Classify a complaint first to view analysis and FIR section suggestions.");
      window.setTimeout(() => document.getElementById("complaint")?.focus(), 50);
      return;
    }

    const targetId = destination === "intake" ? "complaint" : destination;
    window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (destination === "intake") {
        target?.focus();
      } else {
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);
  }

  function changeLanguage(language) {
    if (language === selectedLanguage) {
      return;
    }

    setSelectedLanguage(language);
    setComplaint("");
    setResult(null);
    setError("");
    window.setTimeout(() => document.getElementById("complaint")?.focus(), 50);
  }

  async function classifyComplaint(event) {
    event.preventDefault();

    if (!navigator.onLine) {
      setIsOnline(false);
      setError("You are not connected to the internet. Reconnect and try again.");
      return;
    }

    setError("");
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaint, language: selectedLanguage })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Unable to classify complaint.");
      }

      setResult(payload);
      setActiveSection("analysis");
      window.setTimeout(
        () => document.getElementById("analysis")?.scrollIntoView({ behavior: "smooth", block: "start" }),
        50
      );
    } catch (err) {
      const isConnectionError =
        !navigator.onLine ||
        err instanceof TypeError ||
        /failed to fetch|networkerror|network request failed/i.test(err.message);

      setError(
        isConnectionError
          ? "Unable to connect. Check your internet connection and try again."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-frame" aria-label="Cyber crime classifier overview">
        <img className="hero-photo" src={upPoliceHq} alt="Uttar Pradesh Police headquarters" />
        <Header
          onNavigate={navigateTo}
          activeSection={activeSection}
          language="English"
        />
        {page === "home" ? (
          <HomePage onNavigate={navigateTo} setComplaint={setComplaint} />
        ) : (
          <IntakePage
            complaint={complaint}
            setComplaint={setComplaint}
            result={result}
            error={error}
            loading={loading}
            isOnline={isOnline}
            selectedLanguage={selectedLanguage}
            onLanguageChange={changeLanguage}
            classifyComplaint={classifyComplaint}
            onBack={() => navigateTo("home")}
          />
        )}
      </section>
      <footer className="site-footer">
        <span>Made with</span>
        <Heart size={13} fill="currentColor" aria-label="love" />
        <span>by Krishna Dev Yadav and Rajan Prajapati</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
