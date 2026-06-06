import React, { useState, useEffect } from 'react';
import { Brain, Sun, Moon, LogOut, CheckCircle, AlertCircle, LayoutDashboard, FileText, BarChart3, Clock, AlertTriangle, Lightbulb } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MoodTracker from './components/MoodTracker';
import VentBox from './components/VentBox';
import Cheerleader from './components/Cheerleader';
import BurnoutToolkit from './components/BurnoutToolkit';

export default function App() {
  // Authentication status stored in sessionStorage for privacy
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('aura_auth') === 'true';
  });

  // App Theme: system preference or localStorage
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aura_theme');
    if (saved) return saved;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  // Target config
  const [examConfig, setExamConfig] = useState(() => {
    const saved = localStorage.getItem('aura_exam_config');
    return saved ? JSON.parse(saved) : { exam: 'JEE', customExam: '', targetDate: '', aspirantName: '' };
  });

  // Unified Mood & Well-being logs (date, timestamp, mood, value, triggers, sleepHours, mockScore)
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

  // Navigation tab: 'dashboard' | 'journal' | 'analytics'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Hot trigger state to open breathing grounding exercise automatically
  const [showBreathing, setShowBreathing] = useState(false);

  // Toast Notifications list
  const [toasts, setToasts] = useState([]);

  // Theme synchronization effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aura_theme', theme);
  }, [theme]);

  // Toast dispatch helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    sessionStorage.setItem('aura_auth', 'true');
    showToast('Mindful space unlocked. Welcome!', 'success');
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('aura_auth');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const updateExamConfig = (newConfig) => {
    setExamConfig(newConfig);
    localStorage.setItem('aura_exam_config', JSON.stringify(newConfig));
    showToast('Exam target settings updated.');
  };

  const logMood = (newLog) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Create new entry
    const logEntry = {
      date: todayStr,
      timestamp: Date.now(),
      mood: newLog.mood,
      value: newLog.value,
      triggers: newLog.triggers,
      sleepHours: newLog.sleepHours || 7,
      mockScore: newLog.mockScore || null
    };

    setMoodLogs((prev) => {
      // Limit to one log per calendar day by replacing duplicate date logs
      const filtered = prev.filter(l => l.date !== todayStr);
      const updated = [...filtered, logEntry];
      localStorage.setItem('aura_mood_logs', JSON.stringify(updated));
      return updated;
    });

    showToast('Well-being log saved.');
  };

  const saveJournalEntry = (text) => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text,
      // Infer mood context from current day mood if logged
      moodContext: getTodayMood() || 'Neutral'
    };

    setJournalEntries((prev) => {
      const updated = [newEntry, ...prev];
      localStorage.setItem('aura_journal_entries', JSON.stringify(updated));
      return updated;
    });

    showToast('Thought safely stored in digital journal.');
  };

  const deleteJournalEntry = (id) => {
    setJournalEntries((prev) => {
      const updated = prev.filter(e => e.id !== id);
      localStorage.setItem('aura_journal_entries', JSON.stringify(updated));
      return updated;
    });
    showToast('Journal entry deleted.', 'error');
  };

  const logStudySession = (subject, minutes) => {
    const newSession = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      date: new Date().toISOString().split('T')[0],
      subject,
      minutes
    };

    setStudySessions((prev) => {
      const updated = [newSession, ...prev];
      localStorage.setItem('aura_study_sessions', JSON.stringify(updated));
      return updated;
    });

    showToast(`Logged study session: ${minutes}m of ${subject}`);
  };

  // Extract today's logged mood if it exists
  const getTodayMood = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = moodLogs.find(l => l.date === todayStr);
    return todayLog ? todayLog.mood : '';
  };

  // Compute stats for analytics
  const getAnalyticsData = () => {
    // Total focus minutes
    const totalFocusMinutes = studySessions.reduce((acc, curr) => acc + curr.minutes, 0);
    
    // Average sleep
    const averageSleep = moodLogs.length > 0 
      ? (moodLogs.reduce((acc, curr) => acc + curr.sleepHours, 0) / moodLogs.length).toFixed(1)
      : '7.0';

    // Stress triggers frequency count
    const triggerCounts = {};
    moodLogs.forEach(log => {
      log.triggers.forEach(t => {
        triggerCounts[t] = (triggerCounts[t] || 0) + 1;
      });
    });

    const sortedTriggers = Object.keys(triggerCounts)
      .map(name => ({ name, count: triggerCounts[name] }))
      .sort((a, b) => b.count - a.count);

    // Subject breakdown
    const subjectMinutes = {};
    studySessions.forEach(sess => {
      subjectMinutes[sess.subject] = (subjectMinutes[sess.subject] || 0) + sess.minutes;
    });

    return {
      totalFocusMinutes,
      averageSleep,
      sortedTriggers,
      subjectMinutes,
      logsCount: moodLogs.length
    };
  };

  const stats = getAnalyticsData();

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Header bar */}
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">
            <Brain size={24} />
          </div>
          <span className="app-title">Aura</span>
        </div>
        
        <div className="header-actions">
          <button 
            className="btn-icon-toggle" 
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          
          <button 
            className="btn-signout" 
            onClick={handleSignOut}
            title="Lock Journal & Sign Out"
          >
            <LogOut size={16} />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="main-content">
        {/* Navigation Tabs Selector */}
        <nav className="nav-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'journal' ? 'active' : ''}`}
            onClick={() => setActiveTab('journal')}
          >
            <FileText size={16} />
            Vent Journal
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} />
            Analytics
          </button>
        </nav>

        {/* Tab Routing render */}
        {activeTab === 'dashboard' && (
          <>
            <Dashboard 
              examConfig={examConfig} 
              onUpdateConfig={updateExamConfig} 
            />
            
            <div className="dashboard-grid">
              {/* Daily well-being inputs */}
              <div className="grid-column">
                <MoodTracker 
                  moodLogs={moodLogs} 
                  onLogMood={logMood} 
                  onShowBreathing={() => setShowBreathing(true)}
                />
              </div>

              {/* Serene helper tools */}
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
          </>
        )}

        {activeTab === 'journal' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Dashboard 
              examConfig={examConfig} 
              onUpdateConfig={updateExamConfig} 
            />
            <VentBox 
              journalEntries={journalEntries}
              onSaveEntry={saveJournalEntry}
              onDeleteEntry={deleteJournalEntry}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ maxWidth: '960px', margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '22px', marginBottom: '20px' }}>
              Academic & Emotional Analytics
            </h2>

            <div className="analytics-grid">
              {/* Column 1: Sleep, Study and overall logs counts */}
              <div className="grid-column">
                <div className="card">
                  <h3 className="card-title">
                    <span className="card-title-icon"><Clock size={18} /></span>
                    Mindful Engagement Metrics
                  </h3>
                  
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-value">{stats.logsCount}</span>
                      <span className="stat-label">Check-ins</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{stats.averageSleep}h</span>
                      <span className="stat-label">Avg Sleep</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{stats.totalFocusMinutes}m</span>
                      <span className="stat-label">Focus Time</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-value">{studySessions.length}</span>
                      <span className="stat-label">Sessions</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h3 className="card-title">
                    <span className="card-title-icon"><AlertTriangle size={18} /></span>
                    Stress Trigger Analysis
                  </h3>
                  
                  {stats.sortedTriggers.length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                      Log today's well-being checklist to analyze trigger profiles.
                    </p>
                  ) : (
                    <div className="trigger-stat-bar-container">
                      {stats.sortedTriggers.slice(0, 5).map(trig => {
                        const totalLogs = moodLogs.length || 1;
                        const percentage = ((trig.count / totalLogs) * 100).toFixed(0);
                        return (
                          <div key={trig.name} className="trigger-stat-row">
                            <span className="trigger-stat-name">{trig.name}</span>
                            <div className="trigger-progress-bar-bg">
                              <div 
                                className="trigger-progress-bar-fill"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="trigger-stat-count">{trig.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Recommendation Insight */}
                  {stats.sortedTriggers.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', backgroundColor: 'var(--bg-accent)', padding: '12px 16px', borderRadius: '12px', borderLeft: '3px solid var(--color-purple)', marginTop: '18px' }}>
                      <Lightbulb size={18} style={{ color: 'var(--color-purple)', flexShrink: 0, marginTop: '2px' }} />
                      <p style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                        <strong>Aura Insight:</strong> <em>"{stats.sortedTriggers[0].name}"</em> is your top wellness trigger. Focus on scheduling mindfulness resets when studying this category!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 2: Chart Trends and study splits */}
              <div className="grid-column">
                <MoodTracker 
                  moodLogs={moodLogs} 
                  onLogMood={logMood} 
                  onShowBreathing={() => setShowBreathing(true)}
                  onlyShowChart={true}
                />

                <div className="card">
                  <h3 className="card-title">
                    <span className="card-title-icon"><Clock size={18} /></span>
                    Focus Time by Subject
                  </h3>
                  {Object.keys(stats.subjectMinutes).length === 0 ? (
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
                      No study focus sessions completed yet. Use the Pomodoro timer on your Dashboard.
                    </p>
                  ) : (
                    <div className="trigger-stat-bar-container">
                      {Object.keys(stats.subjectMinutes).map(sub => {
                        const maxVal = Math.max(...Object.values(stats.subjectMinutes)) || 1;
                        const percentage = ((stats.subjectMinutes[sub] / maxVal) * 100).toFixed(0);
                        return (
                          <div key={sub} className="trigger-stat-row">
                            <span className="trigger-stat-name">{sub}</span>
                            <div className="trigger-progress-bar-bg">
                              <div 
                                className="trigger-progress-bar-fill"
                                style={{ width: `${percentage}%`, backgroundColor: 'var(--color-green)' }}
                              />
                            </div>
                            <span className="trigger-stat-count">{stats.subjectMinutes[sub]}m</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>Aura &bull; Cultivating mental wellness during academic journeys.</p>
        <p style={{ marginTop: '4px', opacity: 0.6 }}>Designed with empathy for high-stakes exam aspirants.</p>
      </footer>

      {/* Toast Alert Queues */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type === 'error' ? 'error' : ''}`}>
            <span className="toast-icon">
              {t.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
