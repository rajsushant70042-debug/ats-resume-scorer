import { type ChangeEvent, type ReactNode, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Clock3,
  Copy,
  Download,
  FileCheck2,
  FileText,
  FileUp,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  UserRound,
  X,
  XCircle,
} from 'lucide-react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const SAMPLE_RESUME = `MAYA CHEN
Product Designer
maya.chen@email.com • San Francisco, CA • linkedin.com/in/mayachen

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

const STOP_WORDS = new Set(
  'the a an and or to of for in on with from by as is are be will you your our this that we it at into have has been what do through across but can'.split(
    ' ',
  ),
);
const ACTION_VERBS = [
  'led',
  'built',
  'reduced',
  'increased',
  'improved',
  'shipped',
  'created',
  'designed',
  'launched',
  'owned',
  'partnered',
  'developed',
  'drove',
  'delivered',
  'managed',
  'optimized',
  'conducted',
];

type Page = 'dashboard' | 'analyze' | 'report' | 'reports' | 'saved' | 'profile' | 'settings';
type Signal = { name: string; score: number; note: string; tone: 'blue' | 'green' | 'orange' | 'purple' };
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
  const terms = phraseList(job || 'professional experience skills communication');
  const matched = terms.filter((term) => normalizedResume.includes(term));
  const missing = terms.filter((term) => !normalizedResume.includes(term)).slice(0, 8);
  const sections = ['experience', 'education', 'skills', 'summary', 'projects'].filter((section) =>
    normalizedResume.includes(section),
  ).length;
  const bullets = resume.split('\n').filter((line) => /^\s*[-•*]/.test(line)).length;
  const quantified = (resume.match(/\b\d+(?:[.,]\d+)?%?|\$\d+/g) ?? []).length;
  const actionVerbCount = ACTION_VERBS.filter((verb) => resumeWords.includes(verb)).length;
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resume);
  const hasPhone = /(?:\+?\d[\d ()-]{7,}\d)/.test(resume);
  const parsing = Math.min(
    100,
    Math.round(
      42 +
        sections * 9 +
        (hasEmail ? 9 : 0) +
        (hasPhone ? 5 : 0) +
        Math.min(bullets, 8) * 2 +
        (resumeWords.length > 140 ? 8 : 0),
    ),
  );
  const keywords = Math.min(100, Math.round((matched.length / Math.max(terms.length, 1)) * 100));
  const impact = Math.min(100, Math.round(35 + actionVerbCount * 4 + quantified * 8 + Math.min(bullets, 8) * 2));
  const clarity = Math.max(
    35,
    Math.min(
      100,
      Math.round(
        92 -
          Math.max(0, resumeWords.length - 520) / 13 -
          resume.split('\n').filter((line) => line.length > 150).length * 7,
      ),
    ),
  );
  const score = Math.round(parsing * 0.3 + keywords * 0.35 + impact * 0.2 + clarity * 0.15);
  const fixes: Fix[] = [];
  if (missing.length) {
    fixes.push({
      title: `Add ${missing.slice(0, 3).join(', ')} where truthful`,
      detail:
        'These terms appear in the target role but not in your resume. ATS matching is literal, so relevant experience can be missed without the same language.',
      example: `Try a skills line or an experience bullet: “${missing.slice(0, 3).join(', ')} across product launches and partner workflows.”`,
    });
  }
  if (!quantified) {
    fixes.push({
      title: 'Put a measurable outcome behind your work',
      detail:
        'Your bullets describe activity, but not enough evidence of what changed. Numbers give a recruiter a fast proof point.',
      example: '“Redesigned onboarding, reducing time-to-value by 28% across 4,200 new accounts.”',
    });
  }
  if (sections < 4) {
    fixes.push({
      title: 'Add clearer resume section labels',
      detail:
        'Standard labels help parsers map your content into the right fields. Keep them plain and consistent.',
      example: 'Use labels such as Summary, Experience, Education, Skills, and Certifications.',
    });
  }
  if (!hasPhone) {
    fixes.push({
      title: 'Include a searchable phone number',
      detail: 'A plain-text contact line gives both parsers and recruiters a reliable way to reach you.',
      example: 'Place a phone number beside your email and location at the top of the document.',
    });
  }
  if (clarity < 78) {
    fixes.push({
      title: 'Trim long lines for a faster scan',
      detail:
        'Several lines are dense. Shorter bullets with one idea each are easier for both humans and parsers.',
      example: 'Aim for one action, one method, and one outcome per bullet.',
    });
  }
  if (!fixes.length) {
    fixes.push({
      title: 'Move your strongest evidence higher',
      detail:
        'Your fundamentals are in place. Lead with the most relevant accomplishment for this role to make the first scan count.',
      example: 'Order experience bullets by relevance and put the strongest metric first.',
    });
  }
  const signals: Signal[] = [
    { name: 'Parsing health', score: parsing, note: `${sections}/5 standard sections detected`, tone: 'blue' },
    { name: 'Keyword alignment', score: keywords, note: `${matched.length} of ${terms.length} role terms found`, tone: 'green' },
    { name: 'Impact signals', score: impact, note: `${quantified} quantified proof points`, tone: 'orange' },
    { name: 'Clarity & scanability', score: clarity, note: `${resumeWords.length} words · ${bullets} bullets`, tone: 'purple' },
  ];
  return {
    score,
    parsing,
    keywords,
    impact,
    clarity,
    wordCount: resumeWords.length,
    matched,
    missing,
    sections,
    quantified,
    actionVerbCount,
    signals,
    fixes: fixes.slice(0, 4),
  };
}

const navItems: { id: Page; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'analyze', label: 'Analyze Resume', icon: FileUp },
  { id: 'reports', label: 'My Reports', icon: FileText },
  { id: 'saved', label: 'Saved Jobs', icon: Bookmark },
];

function ScoreRing({ score }: { score: number }) {
  return (
    <div className="score-ring" style={{ '--score-angle': `${score * 3.6}deg` } as React.CSSProperties}>
      <div className="score-ring-inner">
        <strong>{score}%</strong>
        <span>ATS Score</span>
      </div>
    </div>
  );
}

function AppContent() {
  const [page, setPage] = useState<Page>('dashboard');
  const [resume, setResume] = useState('');
  const [job, setJob] = useState('');
  const [fileName, setFileName] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [expandedFix, setExpandedFix] = useState<number | null>(0);
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeCount = useMemo(() => words(resume).length, [resume]);
  const canAnalyze = resume.trim().length > 30;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const navigate = (nextPage: Page) => {
    setPage(nextPage);
    setSidebarOpen(false);
  };

  const loadSample = (nextPage: Page = 'analyze') => {
    setResume(SAMPLE_RESUME);
    setJob(SAMPLE_JOB);
    setFileName('maya-chen-resume.txt');
    setAnalysis(null);
    navigate(nextPage);
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
    setExpandedFix(0);
    navigate('report');
    window.setTimeout(() => document.getElementById('report')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };

  const reportText = analysis
    ? `ATS Resume Report\nOverall score: ${analysis.score}/100\nParsing health: ${analysis.parsing}/100\nKeyword alignment: ${analysis.keywords}/100\nImpact signals: ${analysis.impact}/100\nClarity & scanability: ${analysis.clarity}/100\n\nPriority fixes:\n${analysis.fixes.map((fix, index) => `${index + 1}. ${fix.title} — ${fix.detail}`).join('\n')}`
    : '';

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

  const renderPage = () => {
    if (page === 'analyze') {
      return (
        <AnalyzePage
          resume={resume}
          setResume={setResume}
          job={job}
          setJob={setJob}
          fileName={fileName}
          resumeCount={resumeCount}
          fileInputRef={fileInputRef}
          handleFile={handleFile}
          canAnalyze={canAnalyze}
          runAnalysis={runAnalysis}
          clearAll={clearAll}
          loadSample={() => loadSample('analyze')}
        />
      );
    }
    if (page === 'report') {
      return (
        <ReportPage
          analysis={analysis ?? analyze(SAMPLE_RESUME, SAMPLE_JOB)}
          onBack={() => navigate('analyze')}
          onCopy={copyReport}
          onDownload={downloadReport}
          expandedFix={expandedFix}
          setExpandedFix={setExpandedFix}
        />
      );
    }
    if (page === 'reports') return <ReportsPage onViewReport={() => { if (!analysis) setAnalysis(analyze(SAMPLE_RESUME, SAMPLE_JOB)); navigate('report'); }} />;
    if (page === 'saved') return <SavedJobsPage onAnalyze={() => loadSample('analyze')} />;
    if (page === 'profile') return <SimplePage icon={<UserRound />} title="Profile" description="Manage the details attached to your resume scoring workspace." action="Edit profile" />;
    if (page === 'settings') return <SimplePage icon={<Settings />} title="Settings" description="Keep your workspace preferences and privacy controls in one place." action="Review settings" />;
    return <DashboardPage onAnalyze={() => navigate('analyze')} onViewReport={() => { if (!analysis) setAnalysis(analyze(SAMPLE_RESUME, SAMPLE_JOB)); navigate('report'); }} />;
  };

  return (
    <div className="product-shell">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-mark"><BarChart3 size={17} strokeWidth={2.8} /></span>
          <span>ATS Resume Scorer</span>
          <button className="sidebar-close mobile-only" onClick={() => setSidebarOpen(false)} aria-label="Close navigation"><X size={16} /></button>
        </div>
        <div className="sidebar-section-label">MAIN MENU</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={`sidebar-link ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}>
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-section-label sidebar-secondary-label">ACCOUNT</div>
        <nav className="sidebar-nav" aria-label="Account navigation">
          <button className={`sidebar-link ${page === 'profile' ? 'active' : ''}`} onClick={() => navigate('profile')}><UserRound size={16} /><span>Profile</span></button>
          <button className={`sidebar-link ${page === 'settings' ? 'active' : ''}`} onClick={() => navigate('settings')}><Settings size={16} /><span>Settings</span></button>
        </nav>
        <div className="sidebar-bottom">
          <button className="sidebar-link"><LogOut size={16} /><span>Log out</span></button>
          <div className="privacy-card"><CheckCircle2 size={15} /><span>Your resume stays private and is analyzed locally.</span></div>
        </div>
      </aside>
      {sidebarOpen && <button className="sidebar-scrim mobile-only" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
      <main className="main-column">
        <header className="app-header">
          <button className="mobile-menu mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
          <div className="header-breadcrumb"><span>ATS Resume Scorer</span><ChevronRight size={14} /><strong>{page === 'report' ? 'Resume Analysis Result' : page === 'analyze' ? 'Analyze Resume' : page === 'dashboard' ? 'Dashboard' : page[0].toUpperCase() + page.slice(1)}</strong></div>
          <div className="header-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={17} /></button>
            <div className="user-menu"><span className="avatar">SC</span><span className="user-name">Account</span><ChevronDown size={13} /></div>
          </div>
        </header>
        <div className="page-content">{renderPage()}</div>
      </main>
      {toast && <div className="toast-note" role="status">{toast}</div>}
    </div>
  );
}

function DashboardPage({ onAnalyze, onViewReport }: { onAnalyze: () => void; onViewReport: () => void }) {
  return (
    <section className="page-section">
      <div className="page-title-row">
        <div><h1>Welcome back</h1><p>Check your resume score and improve it with ATS-friendly suggestions.</p></div>
        <button className="blue-button" onClick={onAnalyze}><Plus size={16} /> Analyze New Resume</button>
      </div>
      <div className="metric-grid">
        <MetricCard icon={<FileCheck2 />} iconTone="blue" value="5" label="Resumes Analyzed" />
        <MetricCard icon={<Target />} iconTone="red" value="3" label="Saved Job Posts" />
        <MetricCard icon={<BarChart3 />} iconTone="green" value="82%" label="Average Score" />
        <MetricCard icon={<Clock3 />} iconTone="purple" value="2" label="This Week" />
      </div>
      <div className="section-heading-row"><div><h2>Recent Analysis</h2><p>Your latest resume checks at a glance.</p></div><button className="text-button" onClick={onViewReport}>View All <ArrowRight size={14} /></button></div>
      <div className="table-card">
        <div className="analysis-table header-row"><span>Resume Name</span><span>Job Title</span><span>Score</span><span>Date</span><span>Action</span></div>
        <AnalysisRow file="Sushant_Resume.pdf" role="Software Engineer" score={88} date="28 Sep 2026" onView={onViewReport} />
        <AnalysisRow file="Resume_DataScience.pdf" role="Data Analyst" score={76} date="26 Sep 2026" onView={onViewReport} />
        <AnalysisRow file="WebDev_Resume.pdf" role="Frontend Developer" score={65} date="24 Sep 2026" onView={onViewReport} />
      </div>
      <div className="tip-banner"><div className="tip-icon"><Lightbulb size={18} /></div><div><strong>Make your next scan count</strong><p>Use the full job description to get more relevant keyword and skills feedback.</p></div><button className="outline-button" onClick={onAnalyze}>Start a scan</button></div>
    </section>
  );
}

function AnalyzePage({
  resume,
  setResume,
  job,
  setJob,
  fileName,
  resumeCount,
  fileInputRef,
  handleFile,
  canAnalyze,
  runAnalysis,
  clearAll,
  loadSample,
}: {
  resume: string;
  setResume: (value: string) => void;
  job: string;
  setJob: (value: string) => void;
  fileName: string;
  resumeCount: number;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFile: (event: ChangeEvent<HTMLInputElement>) => void;
  canAnalyze: boolean;
  runAnalysis: () => void;
  clearAll: () => void;
  loadSample: () => void;
}) {
  return (
    <section className="page-section">
      <div className="page-title-row compact-title"><div><h1>Analyze your resume</h1><p>Upload your resume and optionally add a job description to get an accurate ATS score.</p></div><button className="soft-button" onClick={loadSample}><Sparkles size={15} /> Try demo data</button></div>
      <div className="analyze-layout">
        <div className="form-card">
          <div className="form-card-heading"><div><h2>Resume file</h2><p>Plain text works best for a private local scan.</p></div><span className="step-badge">1</span></div>
          <label className={`upload-zone ${resume ? 'has-file' : ''}`}>
            <input ref={fileInputRef} type="file" accept=".txt,.md,.rtf,text/plain" onChange={handleFile} />
            <span className="upload-icon">{resume ? <CheckCircle2 size={25} /> : <FileUp size={25} />}</span>
            <strong>{fileName || 'Upload your resume'}</strong>
            <span>{fileName ? `${resumeCount} words ready for analysis` : 'Drag and drop your file here, or click to browse'}</span>
            <em>{fileName ? 'Choose a different file' : 'TXT, MD, or RTF files supported'}</em>
          </label>
          <div className="paste-divider"><span>or paste resume text</span></div>
          <div className="textarea-wrap"><textarea className="resume-input" value={resume} onChange={(event) => setResume(event.target.value)} placeholder="Paste the text from your resume here..." aria-label="Resume text" /><span className="textarea-count">{resumeCount} words</span></div>
        </div>
        <div className="form-card">
          <div className="form-card-heading"><div><h2>Job description <small>Optional</small></h2><p>Role context helps improve keyword matching.</p></div><span className="step-badge">2</span></div>
          <textarea className="job-input" value={job} onChange={(event) => setJob(event.target.value)} placeholder="Paste the job description you are applying to for a more accurate score..." aria-label="Job description" />
          <div className="privacy-note"><CircleHelp size={15} /><span>Everything is scored locally in your browser and never uploaded.</span></div>
        </div>
      </div>
      <div className="analyze-actions"><button className="clear-button" onClick={clearAll}><X size={15} /> Clear all</button><button className="blue-button large" onClick={runAnalysis} disabled={!canAnalyze}><Search size={16} /> Analyze Resume</button></div>
    </section>
  );
}

function ReportPage({ analysis, onBack, onCopy, onDownload, expandedFix, setExpandedFix }: { analysis: Analysis; onBack: () => void; onCopy: () => void; onDownload: () => void; expandedFix: number | null; setExpandedFix: (value: number | null) => void }) {
  return (
    <section className="page-section report-page" id="report">
      <div className="report-topline"><button className="back-button" onClick={onBack}><ArrowLeft size={15} /> Back to Analyze Resume</button><div className="report-actions"><button className="outline-button" onClick={onCopy}><Copy size={14} /> Copy Report</button><button className="blue-button" onClick={onDownload}><Download size={14} /> Download Report</button></div></div>
      <div className="page-title-row report-title"><div><h1>Resume Analysis Result</h1><p>Here is what your resume is saying compared to the role you provided.</p></div><span className="report-date">Scanned just now</span></div>
      <div className="report-hero-grid">
        <div className="report-score-card"><ScoreRing score={analysis.score} /><div className="report-score-copy"><span className="success-badge"><Check size={13} /> Good job!</span><h2>{analysis.score >= 75 ? 'Your resume is well optimized for this role.' : 'Your resume has a solid starting point.'}</h2><p>Make a few targeted improvements below to increase your chances even more.</p></div></div>
        <div className="score-bars-card"><div className="card-title-row"><h2>Resume health</h2><span>4 signals</span></div>{analysis.signals.map((signal) => <div className="score-bar-row" key={signal.name}><div><span>{signal.name}</span><strong>{signal.score}%</strong></div><div className="score-bar"><span className={`bar-fill ${signal.tone}`} style={{ width: `${signal.score}%` }} /></div></div>)}</div>
      </div>
      <div className="report-columns">
        <div className="report-panel"><div className="card-title-row"><h2>Keyword Analysis</h2><span>{analysis.matched.length + analysis.missing.length} total terms</span></div><div className="keyword-summary"><span className="keyword-dot green" /><strong>{analysis.matched.length}</strong><span>Matched keywords</span><span className="keyword-dot red" /><strong>{analysis.missing.length}</strong><span>Missing keywords</span></div><div className="keyword-section"><h3>Top matched keywords</h3><div className="chip-list">{(analysis.matched.length ? analysis.matched.slice(0, 8) : ['experience', 'skills']).map((keyword) => <span className="keyword-chip green-chip" key={keyword}>{keyword}</span>)}</div></div><div className="keyword-section"><h3>Missing keywords <small>(add these)</small></h3><div className="chip-list">{(analysis.missing.length ? analysis.missing.slice(0, 6) : ['communication', 'leadership']).map((keyword) => <span className="keyword-chip red-chip" key={keyword}>{keyword}</span>)}</div></div></div>
        <div className="report-panel"><div className="card-title-row"><h2>Suggestions for improvement</h2><span>{analysis.fixes.length} actions</span></div><div className="suggestion-list">{analysis.fixes.map((fix, index) => <div className="suggestion-item" key={fix.title}><span className="suggestion-number">{index + 1}</span><div><strong>{fix.title}</strong><p>{fix.detail}</p>{expandedFix === index && <div className="suggestion-example">{fix.example}</div>}<button className="small-text-button" onClick={() => setExpandedFix(expandedFix === index ? null : index)}>{expandedFix === index ? 'Hide example' : 'See example'} <ChevronRight size={12} /></button></div></div>)}</div></div>
      </div>
      <div className="report-footnote"><ShieldLineIcon /><span>Signal scores are directional. This tool is a practical checklist, not a hiring prediction.</span></div>
    </section>
  );
}

function ReportsPage({ onViewReport }: { onViewReport: () => void }) {
  return <section className="page-section"><div className="page-title-row"><div><h1>My Reports</h1><p>Review your recent resume scans and compare improvements over time.</p></div><button className="blue-button" onClick={onViewReport}><FileText size={15} /> Open latest report</button></div><div className="reports-list"><AnalysisRow file="Sushant_Resume.pdf" role="Software Engineer" score={88} date="28 Sep 2026" onView={onViewReport} /><AnalysisRow file="Resume_DataScience.pdf" role="Data Analyst" score={76} date="26 Sep 2026" onView={onViewReport} /><AnalysisRow file="WebDev_Resume.pdf" role="Frontend Developer" score={65} date="24 Sep 2026" onView={onViewReport} /></div></section>;
}

function SavedJobsPage({ onAnalyze }: { onAnalyze: () => void }) {
  return <section className="page-section"><div className="page-title-row"><div><h1>Saved Jobs</h1><p>Keep target roles nearby so each resume scan is tailored to the right opportunity.</p></div><button className="blue-button" onClick={onAnalyze}><Plus size={16} /> Analyze a role</button></div><div className="job-grid"><JobCard company="Northstar Labs" role="Product Designer" match="92%" color="blue" /><JobCard company="Vertex Analytics" role="UX Designer" match="86%" color="green" /><JobCard company="Forma Studio" role="Senior Product Designer" match="78%" color="orange" /></div></section>;
}

function SimplePage({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action: string }) {
  return <section className="page-section"><div className="page-title-row"><div><h1>{title}</h1><p>{description}</p></div><button className="blue-button"><Settings size={15} /> {action}</button></div><div className="empty-page"><div className="empty-page-icon">{icon}</div><h2>{title} controls are ready for your workspace</h2><p>Keep your resume scoring workflow focused, private, and easy to return to.</p></div></section>;
}

function MetricCard({ icon, iconTone, value, label }: { icon: ReactNode; iconTone: string; value: string; label: string }) {
  return <div className="metric-card"><div className={`metric-icon ${iconTone}`}>{icon}</div><div><strong>{value}</strong><span>{label}</span></div><MoreHorizontal size={16} className="metric-more" /></div>;
}

function AnalysisRow({ file, role, score, date, onView }: { file: string; role: string; score: number; date: string; onView: () => void }) {
  return <div className="analysis-table data-row"><span className="file-cell"><span className="file-mini-icon"><FileText size={14} /></span>{file}</span><span>{role}</span><span><span className={`score-pill ${score >= 80 ? 'high' : score >= 70 ? 'mid' : 'low'}`}>{score}%</span></span><span>{date}</span><span><button className="view-button" onClick={onView}>View <ChevronRight size={13} /></button></span></div>;
}

function JobCard({ company, role, match, color }: { company: string; role: string; match: string; color: string }) {
  return <div className="job-card"><div className={`company-logo ${color}`}>{company.slice(0, 1)}</div><div className="job-card-copy"><strong>{role}</strong><span>{company}</span><small>{match} profile match</small></div><Bookmark size={16} className="job-bookmark" /></div>;
}

function ShieldLineIcon() {
  return <div className="footnote-check"><CheckCircle2 size={15} /></div>;
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