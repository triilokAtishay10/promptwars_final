import React, { useState, useEffect } from 'react';
import { Brain, Sun, Moon, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MoodTracker from './components/MoodTracker';
import VentBox from './components/VentBox';
import Cheerleader from './components/Cheerleader';
import BurnoutToolkit from './components/BurnoutToolkit';

export default function App() {
  // Authentication status stored in sessionStorage for security/privacy
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('aura_auth') === 'true';
  });

  // App Theme: defaults to system preference or light
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('aura_theme');
    if (saved) return saved;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  // Exam Selection Target configuration
  const [examConfig, setExamConfig] = useState(() => {
    const saved = localStorage.getItem('aura_exam_config');
    return saved ? JSON.parse(saved) : { exam: 'JEE', customExam: '', targetDate: '', aspirantName: '' };
  });

  // Daily Mood Log list
  const [moodLogs, setMoodLogs] = useState(() => {
    const saved = localStorage.getItem('aura_mood_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // Private Journal entries
  const [journalEntries, setJournalEntries] = useState(() => {
    const saved = localStorage.getItem('aura_journal_entries');
    return saved ? JSON.parse(saved) : [];
  });

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
    showToast('Journal space unlocked. Welcome back!', 'success');
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
    showToast('Exam target updated successfully.');
  };

  const logMood = (newLog) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Create new entry
    const logEntry = {
      date: todayStr,
      timestamp: Date.now(),
      mood: newLog.mood,
      value: newLog.value,
      triggers: newLog.triggers
    };

    setMoodLogs((prev) => {
      // Limit to one log per calendar day by replacing duplicate date logs
      const filtered = prev.filter(l => l.date !== todayStr);
      const updated = [...filtered, logEntry];
      localStorage.setItem('aura_mood_logs', JSON.stringify(updated));
      return updated;
    });

    showToast(`Logged feeling: ${newLog.mood}`);
  };

  const saveJournalEntry = (text) => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      text
    };

    setJournalEntries((prev) => {
      const updated = [newEntry, ...prev];
      localStorage.setItem('aura_journal_entries', JSON.stringify(updated));
      return updated;
    });

    showToast('Thought committed to journal safely.');
  };

  const deleteJournalEntry = (id) => {
    setJournalEntries((prev) => {
      const updated = prev.filter(e => e.id !== id);
      localStorage.setItem('aura_journal_entries', JSON.stringify(updated));
      return updated;
    });
    showToast('Entry removed.', 'error');
  };

  // Extract today's logged mood if it exists
  const getTodayMood = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLog = moodLogs.find(l => l.date === todayStr);
    return todayLog ? todayLog.mood : '';
  };

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
        {/* Banner with dynamically updating greeting & setup CTA */}
        <Dashboard 
          examConfig={examConfig} 
          onUpdateConfig={updateExamConfig} 
        />

        {/* Dashboard split content */}
        <div className="dashboard-grid">
          {/* Main workspace column: daily tracking and venting */}
          <div className="grid-column">
            <MoodTracker 
              moodLogs={moodLogs} 
              onLogMood={logMood} 
              onShowBreathing={() => setShowBreathing(true)}
            />
            
            <VentBox 
              journalEntries={journalEntries}
              onSaveEntry={saveJournalEntry}
              onDeleteEntry={deleteJournalEntry}
            />
          </div>

          {/* Supportive tools column: pomodoro, breaking activities, breathing grounding */}
          <div className="grid-column">
            <Cheerleader 
              currentMood={getTodayMood()}
              showBreathingDirectly={showBreathing}
              onBreathingDone={() => setShowBreathing(false)}
            />
            
            <BurnoutToolkit 
              onShowToast={showToast} 
            />
          </div>
        </div>
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
