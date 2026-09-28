import { type ChangeEvent, useMemo, useRef, useState } from 'react';
import { ArrowRight, BarChart3, Clipboard, FileText, Info, RotateCcw, ShieldCheck, Sparkles, Target, Upload, X } from 'lucide-react';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const SAMPLE_RESUME = `MAYA CHEN
Product Designer
maya.chen@email.com  •  San Francisco, CA  •  linkedin.com/in/mayachen

SUMMARY
Product designer with 5+ years of experience turning complex workflows into clear, accessible digital products.

EXPERIENCE
Product Designer — Northstar Labs | 2021–Present
• Led end-to-end design for a B2B analytics platform used by 18,000 monthly users.
• Partnered with research and engineering to reduce onboarding time by 34%.
• Built a component library that cut design-to-development handoff time by 25%.

UX Designer — Forma Studio | 2019–2021
• Shipped mobile and web experiences for three early-stage clients.
• Ran 22 user interviews and synthesized findings into product direction.

SKILLS
Figma, prototyping, user research, design systems, accessibility, SQL, HTML, CSS, agile`;

const SAMPLE_JOB = `Product Designer

We are looking for a Product Designer to shape intuitive experiences for our analytics platform. You will work closely with product managers, engineers, and researchers from discovery through launch.

What you'll do:
• Own end-to-end product design across web applications
• Conduct user research, interviews, and usability testing
• Create wireframes, prototypes, and polished UI in Figma
• Build and evolve our design system
• Partner with engineering to ship accessible, high-quality experiences

You have:
• 4+ years of product or UX design experience
• Strong portfolio demonstrating measurable product impact
• Excellent communication and cross-functional collaboration skills`;

const STOP_WORDS = new Set('the a an and or to of for in on with from by as is are be will you your our this that we it at into have has has been what do through across but can'.split(' '));
const ACTION_VERBS = ['led', 'built', 'reduced', 'increased', 'improved', 'shipped', 'created', 'designed', 'launched', 'owned', 'partnered', 'developed', 'drove', 'delivered', 'managed', 'optimized', 'conducted'];

type Signal = { name: string; score: number; note: string; tone: 'coral' | 'teal' | 'gold' };
type Fix = { title: string; detail: string; example: string };
type Analysis = {
  score: number;
  parsing: number;
  keywords: number;
  impact: number;
  clarity: number;
  wordCount: number;
  matched: string[];
  missing: string[];
  sections: number;
  quantified: number;
  actionVerbCount: number;
  signals: Signal[];
  fixes: Fix[];
};

function words(text: string): string[] {
  return text.toLowerCase().match(/[a-z][a-z+#.-]{1,}/g) ?? [];
}

function phraseList(job: string) {
  const all = words(job).filter((word) => word.length > 3 && !STOP_WORDS.has(word));
  return Array.from(new Set(all)).slice(0, 34);
}

function analyze(resume: string, job: string): Analysis {
  const resumeWords = words(resume);
  const normalizedResume = resume.toLowerCase();
  const terms = phraseList(job);
  const matched = terms.filter((term) => normalizedResume.includes(term));
  const missing = terms.filter((term) => !normalizedResume.includes(term)).slice(0, 8);
  const sections = ['experience', 'education', 'skills', 'summary', 'projects'].filter((section) => normalizedResume.includes(section)).length;
  const bullets = resume.split('\n').filter((line) => /^\s*[-•*]/.test(line)).length;
  const quantified = (resume.match(/\b\d+(?:[.,]\d+)?%?|\$\d+/g) ?? []).length;
  const actionVerbCount = ACTION_VERBS.filter((verb) => resumeWords.includes(verb)).length;
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resume);
  const hasPhone = /(?:\+?\d[\d ()-]{7,}\d)/.test(resume);
  const parsing = Math.min(100, Math.round(42 + sections * 9 + (hasEmail ? 9 : 0) + (hasPhone ? 5 : 0) + Math.min(bullets, 8) * 2 + (resumeWords.length > 140 ? 8 : 0)));
  const keywords = Math.min(100, Math.round((matched.length / Math.max(terms.length, 1)) * 100));
  const impact = Math.min(100, Math.round(35 + actionVerbCount * 4 + quantified * 8 + Math.min(bullets, 8) * 2));
  const clarity = Math.max(35, Math.min(100, Math.round(92 - Math.max(0, resumeWords.length - 520) / 13 - (resume.split('\n').filter((line) => line.length > 150).length * 7))));
  const score = Math.round(parsing * .3 + keywords * .35 + impact * .2 + clarity * .15);
  const fixes: Fix[] = [];
  if (missing.length) fixes.push({ title: `Add ${missing.slice(0, 3).join(', ')} where truthful`, detail: 'These terms appear in the target role but not in your resume. ATS matching is literal, so relevant experience can be missed without the same language.', example: `Try a skills line or an experience bullet: “${missing.slice(0, 3).join(', ')} across product launches and partner workflows.”` });
  if (!quantified) fixes.push({ title: 'Put a measurable outcome behind your work', detail: 'Your bullets describe activity, but not enough evidence of what changed. Numbers give a recruiter a fast proof point.', example: '“Redesigned onboarding, reducing time-to-value by 28% across 4,200 new accounts.”' });
  if (sections < 4) fixes.push({ title: 'Add clearer resume section labels', detail: 'Standard labels help parsers map your content into the right fields. Keep them plain and consistent.', example: 'Use labels such as Summary, Experience, Education, Skills, and Certifications.' });
  if (!hasPhone) fixes.push({ title: 'Include a searchable phone number', detail: 'A plain-text contact line gives both parsers and recruiters a reliable way to reach you.', example: 'Place a phone number beside your email and location at the top of the document.' });
  if (clarity < 78) fixes.push({ title: 'Trim long lines for a faster scan', detail: 'Several lines are dense. Shorter bullets with one idea each are easier for both humans and parsers.', example: 'Aim for one action, one method, and one outcome per bullet.' });
  if (!fixes.length) fixes.push({ title: 'Move your strongest evidence higher', detail: 'Your fundamentals are in place. Lead with the most relevant accomplishment for this role to make the first scan count.', example: 'Order experience bullets by relevance and put the strongest metric first.' });
  const signals: Signal[] = [
    { name: 'Parsing health', score: parsing, note: `${sections}/5 standard sections detected`, tone: 'teal' },
    { name: 'Keyword alignment', score: keywords, note: `${matched.length} of ${terms.length} role terms found`, tone: 'coral' },
    { name: 'Impact signals', score: impact, note: `${quantified} quantified proof points`, tone: 'gold' },
    { name: 'Clarity & scanability', score: clarity, note: `${resumeWords.length} words · ${bullets} bullets`, tone: 'teal' },
  ];
  return { score, parsing, keywords, impact, clarity, wordCount: resumeWords.length, matched, missing, sections, quantified, actionVerbCount, signals, fixes: fixes.slice(0, 4) };
}

function AppContent() {
  const [resume, setResume] = useState('');
  const [job, setJob] = useState('');
  const [fileName, setFileName] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [expandedFix, setExpandedFix] = useState<number | null>(0);
  const [toast, setToast] = useState('');
  const [recentScore, setRecentScore] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canAnalyze = resume.trim().length > 30 && job.trim().length > 30;
  const resumeCount = useMemo(() => words(resume).length, [resume]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const loadSample = () => {
    setResume(SAMPLE_RESUME);
    setJob(SAMPLE_JOB);
    setFileName('');
    setAnalysis(null);
    showToast('Demo resume and role loaded');
  };

  const clearAll = () => {
    setResume('');
    setJob('');
    setFileName('');
    setAnalysis(null);
    setExpandedFix(0);
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    if (!/\.(txt|md|rtf)$/i.test(file.name)) {
      showToast('Choose a TXT, MD, or RTF file for local parsing');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setResume(String(reader.result ?? ''));
      showToast(`${file.name} ready to analyze`);
    };
    reader.onerror = () => showToast('We could not read that file');
    reader.readAsText(file);
  };

  const runAnalysis = () => {
    if (!canAnalyze) return;
    const result = analyze(resume, job);
    setAnalysis(result);
    setRecentScore(result.score);
    setExpandedFix(0);
    window.setTimeout(() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const clearFile = () => {
    setFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const reportText = analysis ? `ATS Resume Report\nOverall score: ${analysis.score}/100\nParsing health: ${analysis.parsing}/100\nKeyword alignment: ${analysis.keywords}/100\nImpact signals: ${analysis.impact}/100\nClarity & scanability: ${analysis.clarity}/100\n\nPriority fixes:\n${analysis.fixes.map((fix, index) => `${index + 1}. ${fix.title} — ${fix.detail}`).join('\n')}` : '';

  const copyReport = async () => {
    if (!reportText) return;
    try {
      await navigator.clipboard.writeText(reportText);
      showToast('Concise report copied');
    } catch {
      showToast('Copy is unavailable in this browser');
    }
  };

  const downloadReport = () => {
    if (!reportText) return;
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'resume-scan-report.txt';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Report downloaded');
  };

  return (
    <div className="app-shell">
      <div className="noise-layer" />
      <header className="topbar">
        <a className="brand-lockup" href="/" data-testid="link-brand">
          <span className="brand-mark"><BarChart3 size={18} strokeWidth={2.5} /></span>
          <span className="brand-name">Signal<span className="brand-sub">resume intelligence</span></span>
        </a>
        <div className="topbar-meta">
          <a className="topbar-link" href="#method" data-testid="link-method">How scoring works</a>
          <span className="local-badge"><span className="local-dot" /> runs in your browser</span>
        </div>
      </header>

      <main className="page-wrap">
        <section className="hero">
          <div>
            <div className="eyebrow"><span className="eyebrow-line" /> a sharper first read</div>
            <h1>Know what your resume <em>signals</em>.</h1>
            <p className="hero-copy">A fast, honest read on how your resume parses and matches a specific role. No uploads, no mystery score — just evidence you can act on before you apply.</p>
          </div>
          <div className="principle-card">
            <strong>Good scores are explainable.</strong>
            <p>We look for the same things a parser and a busy recruiter do: clean structure, relevant language, proof of impact, and a quick path through your story.</p>
          </div>
        </section>

        <section className="workbench" aria-label="Resume analysis inputs">
          <div className="workbench-head">
            <div>
              <div className="section-kicker">01 / build your scan</div>
              <div className="workbench-title">Give the role something real to react to</div>
            </div>
            <button className="sample-button" onClick={loadSample} data-testid="button-load-demo">Try demo data <ArrowRight size={14} /></button>
          </div>
          <div className="input-grid">
            <div className="input-panel">
              <label className="field-label" htmlFor="resume-input">Your resume <span className="field-label-note">{resumeCount} words</span></label>
              <textarea id="resume-input" className="resume-textarea" value={resume} onChange={(event) => setResume(event.target.value)} placeholder="Paste the text from your resume here. Plain text works best." data-testid="input-resume" />
              <div className="field-foot">
                <label className="file-button" data-testid="button-upload-resume">
                  <Upload size={13} /> Choose a text file
                  <input ref={fileInputRef} type="file" accept=".txt,.md,.rtf,text/plain" onChange={handleFile} data-testid="input-resume-file" />
                </label>
                {fileName ? <span className="file-name" title={fileName}>{fileName} <button onClick={clearFile} aria-label="Clear selected file" className="fix-toggle" data-testid="button-clear-file"><X size={11} /></button></span> : <span>Nothing leaves this tab</span>}
              </div>
            </div>
            <div className="input-panel">
              <label className="field-label" htmlFor="job-input">Target job description <span className="field-label-note">{words(job).length} words</span></label>
              <textarea id="job-input" className="jd-textarea" value={job} onChange={(event) => setJob(event.target.value)} placeholder="Paste the job description you are applying to." data-testid="input-job-description" />
              <div className="field-foot"><span>Use the full description for better matching</span><Target size={15} /></div>
            </div>
          </div>
          <div className="workbench-actions">
            <div className="action-hint">{canAnalyze ? 'Ready for a local, deterministic scan.' : 'Add both text blocks to unlock your scan.'}</div>
            <div style={{ display: 'flex', gap: 9 }}>
              <button className="secondary-button" onClick={clearAll} data-testid="button-clear-all"><RotateCcw size={14} /> Clear</button>
              <button className="primary-button" onClick={runAnalysis} disabled={!canAnalyze} data-testid="button-run-analysis"><Sparkles size={15} /> Score my resume</button>
            </div>
          </div>
        </section>

        <div className="helper-strip" id="method">
          <div className="helper-item"><ShieldCheck size={17} className="helper-icon" /><div><strong>Private by design</strong><span>Text is scored in this tab and never sent to a server.</span></div></div>
          <div className="helper-item"><Target size={17} className="helper-icon" /><div><strong>Role-aware matching</strong><span>Terms are compared to the job you actually want.</span></div></div>
          <div className="helper-item"><Info size={17} className="helper-icon" /><div><strong>Not a hiring prediction</strong><span>A practical checklist, not a promise or rejection.</span></div></div>
        </div>

        {!analysis ? (
          <div className="empty-result" data-testid="empty-result">
            <div className="empty-result-mark"><FileText size={19} /></div>
            <div><strong>Your evidence report will appear here.</strong><div>Paste a resume and target role above. We will break one score into signals you can actually improve.</div></div>
          </div>
        ) : (
          <section className="result-area" id="report" aria-label="Resume score report" data-testid="result-report">
            <div className="result-head">
              <div><div className="eyebrow" style={{ marginBottom: 0 }}><span className="eyebrow-line" /> 02 / your evidence report</div><h2>Here is what your resume is saying.</h2><p>Compared locally against the role description you provided.</p></div>
              <div className="result-actions"><button className="secondary-button" onClick={copyReport} data-testid="button-copy-report"><Clipboard size={14} /> Copy report</button><button className="secondary-button" onClick={downloadReport} data-testid="button-download-report"><FileText size={14} /> Download</button></div>
            </div>
            <div className="summary-grid">
              <div className="score-card">
                <div><div className="score-label">overall signal</div><div className="score-reading"><span className="score-number" data-testid="text-overall-score">{analysis.score}</span><span className="score-denom">/ 100</span></div></div>
                <div className="score-verdict">{analysis.score >= 75 ? 'Strong foundation. A few precise edits can make this application easier to match and faster to trust.' : analysis.score >= 55 ? 'Promising, with clear opportunities to make your match and evidence more obvious.' : 'The story may be getting lost in translation. Start with the priority fixes below before you apply.'}</div>
              </div>
              <div className="signal-card">
                <div className="signal-card-head"><h3>Signal breakdown</h3><span className="signal-summary">weighted, not averaged</span></div>
                <div className="signal-list">{analysis.signals.map((signal) => <div className="signal-row" key={signal.name} data-testid={`signal-${signal.name.toLowerCase().replaceAll(' ', '-')}`}><div className="signal-name">{signal.name}<span className="signal-note">{signal.note}</span></div><div className="signal-track"><div className={`signal-fill ${signal.tone}`} style={{ width: `${signal.score}%` }} /></div><div className="signal-value">{signal.score}</div></div>)}</div>
              </div>
            </div>
            <div className="report-grid">
              <div className="report-card">
                <div className="report-card-head"><h3>Priority edits</h3><span>{analysis.fixes.length} practical moves</span></div>
                <div className="fix-list">{analysis.fixes.map((fix, index) => <div className="fix-row" key={fix.title} data-testid={`fix-row-${index}`}><div className="fix-rank">0{index + 1}</div><div><p className="fix-title">{fix.title}</p><p className="fix-detail">{fix.detail}</p>{expandedFix === index && <div className="fix-example"><strong>Possible direction:</strong> {fix.example}</div>}</div><button className="fix-toggle" onClick={() => setExpandedFix(expandedFix === index ? null : index)} data-testid={`button-expand-fix-${index}`}>{expandedFix === index ? 'Hide' : 'See example'}</button></div>)}</div>
              </div>
              <div className="report-card">
                <div className="report-card-head"><h3>Parser readout</h3><span>what we found</span></div>
                <div className="detail-stack">
                  <div className="detail-item"><span>Sections recognized</span><strong className={analysis.sections >= 4 ? 'detail-good' : 'detail-warn'}>{analysis.sections} / 5</strong></div>
                  <div className="detail-item"><span>Matched role terms</span><strong className={analysis.keywords >= 65 ? 'detail-good' : 'detail-warn'}>{analysis.matched.length} found</strong></div>
                  <div className="detail-item"><span>Proof points</span><strong className={analysis.quantified > 1 ? 'detail-good' : 'detail-warn'}>{analysis.quantified} numbers</strong></div>
                  <div className="detail-item"><span>Action language</span><strong className={analysis.actionVerbCount > 3 ? 'detail-good' : 'detail-warn'}>{analysis.actionVerbCount} verbs</strong></div>
                  <div className="detail-item"><span>Resume length</span><strong>{analysis.wordCount} words</strong></div>
                </div>
                <div className="method-note"><strong>How to read this:</strong> signal scores are directional. We reward plain structure and terms that appear in the target role; we do not judge your career or guarantee an interview.</div>
              </div>
            </div>
            <div className="recent-row"><span>Session history</span><span className="recent-pill">Latest scan · {recentScore}/100</span><span>Stored only while this tab is open</span></div>
          </section>
        )}
      </main>
      {toast && <div className="toast-note" role="status" data-testid="status-toast">{toast}</div>}
    </div>
  );
}

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={AppContent} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;