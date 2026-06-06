import React, { useState, useEffect } from 'react';
import { Brain, Sun, Moon, CheckCircle, AlertCircle, LayoutDashboard, FileText, BarChart3, Clock, AlertTriangle, Lightbulb } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MoodTracker from './components/MoodTracker';
import VentBox from './components/VentBox';
import Cheerleader from './components/Cheerleader';
import BurnoutToolkit from './components/BurnoutToolkit';

export default function App() {
  // App Theme: system preference or localStorage
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aura_theme');
    if (saved) return saved;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  // Exam selection config
  const [examConfig, setExamConfig] = useState(() => {
    const saved = localStorage.getItem('aura_exam_config');
    return saved ? JSON.parse(saved) : { exam: 'JEE', customExam: '', targetDate: '', aspirantName: '' };
  });

  // Unified Mood & Well-being logs
  const [moodLogs, setMoodLogs] = useState(() => {
    const saved = localStorage.getItem('aura_mood_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Private journal entries
  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem('aura_journal_entries');
    return saved ? JSON.parse(saved) : [];
  });

  // Pomodoro study sessions logged
  const [studySessions, setStudySessions] = useState(() => {
    const saved = localStorage.getItem('aura_study_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  // Active tab navigation
  const [activeTab, setActiveTab] = useState('dashboard');

  // Breathing exercise trigger
  const [showBreathing, setShowBreathing] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  // Apply theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const updateExamConfig = (newConfig) => {
    setExamConfig(newConfig);
    localStorage.setItem('aura_exam_config', JSON.stringify(newConfig));
    showToast('Exam target settings updated.');
  };

  const logMood = (newLog) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const logEntry = {
      date: todayStr,
      timestamp: Date.now(),
      mood: newLog.mood,
      value: newLog.value,
      triggers: newLog.triggers,
      sleepHours: newLog.sleepHours || 7,
      mockScore: newLog.mockScore || null,
    };
    setMoodLogs((prev) => {
      const filtered = prev.filter(l => l.date !== todayStr);
      const updated = [...filtered, logEntry];
      localStorage.setItem('aura_mood_logs', JSON.stringify(updated));
      return updated;
    });
    showToast('Well-being check-in saved ✓');
  };

  const saveJournalEntry = (text) => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text,
      moodContext: getTodayMood() || 'Neutral',
    };
    setJournalEntries((prev) => {
      const updated = [newEntry, ...prev];
      localStorage.setItem('aura_journal_entries', JSON.stringify(updated));
      return updated;
    });
    showToast('Thought safely stored in your journal.');
  };

  const deleteJournalEntry = (id) => {
    setJournalEntries((prev) => {
      const updated = prev.filter(e => e.id !== id);
      localStorage.setItem('aura_journal_entries', JSON.stringify(updated));
      return updated;
    });
    showToast('Journal entry removed.', 'error');
  };

  const logStudySession = (subject, minutes) => {
    const newSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      subject,
      minutes,
    };
    setStudySessions((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem('aura_study_sessions', JSON.stringify(updated));
      return updated;
    });
    showToast(`Logged ${minutes}m focus session: ${subject}`);
  };

  const getTodayMood = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = moodLogs.find(l => l.date === todayStr);
    return todayLog ? todayLog.mood : '';
  };

  const getAnalyticsData = () => {
    const totalFocusMinutes = studySessions.reduce((acc, curr) => acc + curr.minutes, 0);
    const averageSleep = moodLogs.length > 0
      ? (moodLogs.reduce((acc, curr) => acc + curr.sleepHours, 0) / moodLogs.length).toFixed(1)
      : '7.0';
    const triggerCounts = {};
    moodLogs.forEach(log => {
      log.triggers.forEach(t => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
    });
    const sortedTriggers = Object.keys(triggerCounts)
      .map(name => ({ name, count: triggerCounts[name] }))
      .sort((a, b) => b.count - a.count);
    const subjectMinutes = {};
    studySessions.forEach(sess => {
      subjectMinutes[sess.subject] = (subjectMinutes[sess.subject] || 0) + sess.minutes;
    });
    return { totalFocusMinutes, averageSleep, sortedTriggers, subjectMinutes, logsCount: moodLogs.length };
  };

  const stats = getAnalyticsData();

  return (
    <div className="app-container">
      {/* Skip-to-content link for keyboard/screen-reader users */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* ── Header ── */}
      <header className="header" role="banner">
        <div className="logo-container">
          <div className="logo-icon" aria-hidden="true">
            <Brain size={24} />
          </div>
          <span className="app-title">Aura</span>
          <span className="sr-only"> — Student Mental Wellness Tracker</span>
        </div>

        <div className="header-actions">
          <button
            id="theme-toggle"
            className="btn-icon-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main id="main-content" className="main-content">
        {/* Tab Navigation */}
        <nav className="nav-tabs" role="navigation" aria-label="Main sections">
          <button
            id="tab-dashboard"
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            aria-selected={activeTab === 'dashboard'}
            aria-controls="panel-dashboard"
            role="tab"
          >
            <LayoutDashboard size={16} aria-hidden="true" />
            Dashboard
          </button>
          <button
            id="tab-journal"
            className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
            onClick={() => setActiveTab('journal')}
            aria-selected={activeTab === 'journal'}
            aria-controls="panel-journal"
            role="tab"
          >
            <FileText size={16} aria-hidden="true" />
            Vent Journal
          </button>
          <button
            id="tab-analytics"
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
            aria-selected={activeTab === 'analytics'}
            aria-controls="panel-analytics"
            role="tab"
          >
            <BarChart3 size={16} aria-hidden="true" />
            Analytics
          </button>
        </nav>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <section id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
            <Dashboard examConfig={examConfig} onUpdateConfig={updateExamConfig} />
            <div className="dashboard-grid">
              <div className="grid-column">
                <MoodTracker
                  moodLogs={moodLogs}
                  onLogMood={logMood}
                  onShowBreathing={() => setShowBreathing(true)}
                />
              </div>
              <div className="grid-column">
                <Cheerleader
                  currentMood={getTodayMood()}
                  showBreathingDirectly={showBreathing}
                  onBreathingDone={() => setShowBreathing(false)}
                />
                <BurnoutToolkit
                  onShowToast={showToast}
                  onLogStudy={logStudySession}
                  studySessions={studySessions}
                />
              </div>
            </div>
          </section>
        )}

        {/* Journal Tab */}
        {activeTab === 'journal' && (
          <section id="panel-journal" role="tabpanel" aria-labelledby="tab-journal" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Dashboard examConfig={examConfig} onUpdateConfig={updateExamConfig} />
            <VentBox
              journalEntries={journalEntries}
              onSaveEntry={saveJournalEntry}
              onDeleteEntry={deleteJournalEntry}
            />
          </section>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <section id="panel-analytics" role="tabpanel" aria-labelledby="tab-analytics" style={{ maxWidth: '960px', margin: '0 auto' }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '22px', marginBottom: '20px' }}>
              Academic & Emotional Analytics
            </h1>

            <div className="analytics-grid">
              {/* Left column */}
              <div className="grid-column">
                <div className="card">
                  <h2 className="card-title">
                    <span className="card-title-icon" aria-hidden="true"><Clock size={18} /></span>
                    Mindful Engagement Metrics
                  </h2>
                  <div className="stats-grid">
                    {[
                      { value: stats.logsCount, label: 'Check-ins' },
                      { value: `${stats.averageSleep}h`, label: 'Avg Sleep' },
                      { value: `${stats.totalFocusMinutes}m`, label: 'Focus Time' },
                      { value: studySessions.length, label: 'Sessions' },
                    ].map(stat => (
                      <div className="stat-card" key={stat.label}>
                        <span className="stat-value" aria-label={`${stat.value} ${stat.label}`}>{stat.value}</span>
                        <span className="stat-label">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h2 className="card-title">
                    <span className="card-title-icon" aria-hidden="true"><AlertTriangle size={18} /></span>
                    Stress Trigger Analysis
                  </h2>

                  {stats.sortedTriggers.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                      Log today's well-being checklist to analyze trigger profiles.
                    </p>
                  ) : (
                    <div className="trigger-stat-bar-container" role="list" aria-label="Stress triggers frequency">
                      {stats.sortedTriggers.slice(0, 5).map(trig => {
                        const percentage = Math.min(((trig.count / (moodLogs.length || 1)) * 100), 100).toFixed(0);
                        return (
                          <div key={trig.name} className="trigger-stat-row" role="listitem">
                            <span className="trigger-stat-name">{trig.name}</span>
                            <div
                              className="trigger-progress-bar-bg"
                              role="progressbar"
                              aria-valuenow={trig.count}
                              aria-valuemin={0}
                              aria-valuemax={moodLogs.length}
                              aria-label={`${trig.name}: ${trig.count} occurrences`}
                            >
                              <div className="trigger-progress-bar-fill" style={{ width: `${percentage}%` }} />
                            </div>
                            <span className="trigger-stat-count" aria-hidden="true">{trig.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {stats.sortedTriggers.length > 0 && (
                    <aside style={{ display: 'flex', gap: '10px', backgroundColor: 'var(--bg-accent)', padding: '12px 16px', borderRadius: '12px', borderLeft: '3px solid var(--color-purple)', marginTop: '18px' }}>
                      <Lightbulb size={18} style={{ color: 'var(--color-purple)', flexShrink: 0, marginTop: '2px' }} aria-hidden="true" />
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                        <strong>Aura Insight: </strong>
                        <em>"{stats.sortedTriggers[0].name}"</em> is your top stress trigger. Schedule mindfulness breaks specifically around this subject area.
                      </p>
                    </aside>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="grid-column">
                <MoodTracker
                  moodLogs={moodLogs}
                  onLogMood={logMood}
                  onShowBreathing={() => setShowBreathing(true)}
                  onlyShowChart={true}
                />

                <div className="card">
                  <h2 className="card-title">
                    <span className="card-title-icon" aria-hidden="true"><Clock size={18} /></span>
                    Focus Time by Subject
                  </h2>
                  {Object.keys(stats.subjectMinutes).length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                      No sessions yet. Use the Pomodoro timer on your Dashboard.
                    </p>
                  ) : (
                    <div className="trigger-stat-bar-container" role="list" aria-label="Study time per subject">
                      {Object.entries(stats.subjectMinutes).map(([sub, mins]) => {
                        const maxVal = Math.max(...Object.values(stats.subjectMinutes)) || 1;
                        const percentage = ((mins / maxVal) * 100).toFixed(0);
                        return (
                          <div key={sub} className="trigger-stat-row" role="listitem">
                            <span className="trigger-stat-name">{sub}</span>
                            <div
                              className="trigger-progress-bar-bg"
                              role="progressbar"
                              aria-valuenow={mins}
                              aria-valuemin={0}
                              aria-valuemax={maxVal}
                              aria-label={`${sub}: ${mins} minutes`}
                            >
                              <div className="trigger-progress-bar-fill" style={{ width: `${percentage}%`, backgroundColor: 'var(--color-green)' }} />
                            </div>
                            <span className="trigger-stat-count" aria-hidden="true">{mins}m</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="footer" role="contentinfo">
        <p>Aura &bull; Cultivating mental wellness during academic journeys.</p>
        <p style={{ marginTop: '4px', opacity: 0.6 }}>Designed with empathy for high-stakes exam aspirants — JEE, NEET, UPSC, Boards.</p>
      </footer>

      {/* Accessible Live Toast Region */}
      <div
        className="toast-container"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.type === 'error' ? 'error' : ''}`}
            role="alert"
            aria-live={t.type === 'error' ? 'assertive' : 'polite'}
          >
            <span className="toast-icon" aria-hidden="true">
              {t.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
