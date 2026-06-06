import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flame, Dumbbell, Coffee, Eye, Cloud, Award } from 'lucide-react';

const WELLNESS_ACTIVITIES = [
  {
    id: 'stretch',
    name: '5-Minute Desk Stretch',
    desc: 'Release neck, shoulder, and wrist tension.',
    icon: <Dumbbell size={18} />,
    duration: 60, // 60s demonstration timer
    colorClass: 'green',
    steps: [
      'Slowly roll your head clockwise, then counter-clockwise.',
      'Shrug your shoulders up to your ears, then roll them back and down.',
      'Extend your arms forward, interlock fingers, and push out.',
      'Rotate your wrists clockwise and counter-clockwise to ease typing strain.'
    ]
  },
  {
    id: 'hydrate',
    name: 'Hydration Reset',
    desc: 'Stand up and drink a glass of water slowly.',
    icon: <Coffee size={18} />,
    duration: 30,
    colorClass: 'blue',
    steps: [
      'Stand up from your chair, stretch your legs fully.',
      'Pour yourself a glass of water (warm or room temp).',
      'Take 5 slow, conscious sips, focusing on the cool sensation.',
      'Sit back down, adjusting your posture to be upright and relaxed.'
    ]
  },
  {
    id: 'eyes',
    name: '20-20-20 Eye Care',
    desc: 'Rest your ciliary muscles and reduce screen fatigue.',
    icon: <Eye size={18} />,
    duration: 20,
    colorClass: 'green',
    steps: [
      'Look away from your screen.',
      'Focus on an object at least 20 feet away.',
      'Stare at it for 20 seconds.',
      'Blink slowly 5 times to lubricate and relax your eyes.'
    ]
  },
  {
    id: 'sky',
    name: 'Sky View Reset',
    desc: 'Look out a window to expand your spatial focus.',
    icon: <Cloud size={18} />,
    duration: 45,
    colorClass: 'blue',
    steps: [
      'Walk over to a window or balcony.',
      'Look at the sky or the furthest point on the horizon.',
      'Let your eyes relax into a wide, peripheral gaze.',
      'Inhale the fresh air, letting go of the task you were working on.'
    ]
  }
];

export default function BurnoutToolkit({ onShowToast }) {
  // Pomodoro States
  const [timerMode, setTimerMode] = useState('study'); // study, break
  const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  
  // Wellness Modal States
  const [activeActivity, setActiveActivity] = useState(null);
  const [activityTimeLeft, setActivityTimeLeft] = useState(0);
  const [isActivityRunning, setIsActivityRunning] = useState(false);

  const timerRef = useRef(null);
  const activityTimerRef = useRef(null);

  // Play a browser-synthesized calming chime
  const playSynthesizedChime = (type = 'success') => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'success') {
        // Calming major arpeggio
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.36); // C6
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);
        osc.start(now);
        osc.stop(now + 0.7);
      } else {
        // Single deep bell tone
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(329.63, now); // E4
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
      }
    } catch (e) {
      console.log('Audio Context error: ', e);
    }
  };

  // Pomodoro Tick logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playSynthesizedChime('success');
            
            if (timerMode === 'study') {
              onShowToast('Study session completed! Take a mindful break.');
              setTimerMode('break');
              return 5 * 60; // 5 min break
            } else {
              onShowToast('Break finished! Ready to focus?');
              setTimerMode('study');
              return 25 * 60; // 25 min study
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning, timerMode, onShowToast]);

  // Wellness Activity Tick logic
  useEffect(() => {
    if (isActivityRunning && activityTimeLeft > 0) {
      activityTimerRef.current = setInterval(() => {
        setActivityTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(activityTimerRef.current);
            setIsActivityRunning(false);
            playSynthesizedChime('success');
            onShowToast(`Wellness activity completed! Well done.`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(activityTimerRef.current);
    }

    return () => clearInterval(activityTimerRef.current);
  }, [isActivityRunning, activityTimeLeft, onShowToast]);

  const handleToggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setTimeLeft(timerMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // SVG Progress Ring calculations
  const totalDuration = timerMode === 'study' ? 25 * 60 : 5 * 60;
  const progressPercent = ((totalDuration - timeLeft) / totalDuration) * 100;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const startWellnessActivity = (activity) => {
    setActiveActivity(activity);
    setActivityTimeLeft(activity.duration);
    setIsActivityRunning(true);
  };

  const closeWellnessModal = () => {
    setActiveActivity(null);
    setIsActivityRunning(false);
    if (activityTimerRef.current) clearInterval(activityTimerRef.current);
  };

  return (
    <div className="card">
      <h3 className="card-title">
        <span className="card-title-icon"><Flame size={20} /></span>
        Burnout Prevention
      </h3>

      <div className="pomodoro-container">
        <div className="timer-ring-container">
          <svg className="timer-svg">
            <circle
              className="timer-bg-circle"
              cx="80"
              cy="80"
              r={radius}
            />
            <circle
              className={`timer-progress-circle ${timerMode === 'break' ? 'break' : ''}`}
              cx="80"
              cy="80"
              r={radius}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="timer-text-overlay">
            <div className="timer-display">{formatTime(timeLeft)}</div>
            <div className="timer-label">{timerMode === 'study' ? 'Focus Study' : 'Mindful Break'}</div>
          </div>
        </div>

        <div className="pomodoro-controls">
          <button
            className={`btn-timer-control ${timerMode === 'break' ? 'break' : ''}`}
            onClick={handleToggleTimer}
          >
            {isRunning ? (
              <>
                <Pause size={16} fill="white" />
                Pause
              </>
            ) : (
              <>
                <Play size={16} fill="white" />
                Start {timerMode === 'study' ? 'Study' : 'Break'}
              </>
            )}
          </button>
          <button className="btn-timer-reset" onClick={handleResetTimer}>
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Wellness Breaks Section */}
      <h4 className="toolkit-title">Micro-Break Activities</h4>
      <div className="wellness-cards-grid">
        {WELLNESS_ACTIVITIES.map((act) => (
          <div
            key={act.id}
            className={`wellness-card ${act.colorClass}`}
            onClick={() => startWellnessActivity(act)}
          >
            <div className="wellness-card-icon">{act.icon}</div>
            <div className="wellness-card-info">
              <div className="wellness-card-name">{act.name}</div>
              <div className="wellness-card-desc">{act.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Wellness Activity Modal */}
      {activeActivity && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-close" onClick={closeWellnessModal}>
              &times;
            </button>
            <div className="modal-header">
              <h3 className="modal-title">{activeActivity.name}</h3>
              <p className="modal-subtitle">Take this time to care for yourself.</p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '44px',
                  fontWeight: '700',
                  color: activityTimeLeft > 0 ? 'var(--color-green)' : 'var(--text-muted)',
                  background: 'var(--bg-primary)',
                  display: 'inline-block',
                  padding: '12px 24px',
                  borderRadius: '16px',
                  marginBottom: '16px',
                  border: '1px solid var(--border-color)'
                }}
              >
                {activityTimeLeft > 0 ? `${activityTimeLeft}s` : 'Completed!'}
              </div>

              <div style={{ textAlign: 'left', background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: '600', fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Guided Steps:
                </span>
                <ol style={{ paddingLeft: '20px', fontSize: '13px', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {activeActivity.steps.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '6px' }}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="modal-actions">
              {activityTimeLeft > 0 ? (
                <button
                  className="btn-secondary"
                  onClick={() => setIsActivityRunning(!isActivityRunning)}
                >
                  {isActivityRunning ? 'Pause' : 'Resume'}
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-green)', fontWeight: '600', fontSize: '14px' }}>
                  <Award size={18} />
                  Mindfulness Step Taken!
                </div>
              )}
              <button className="btn-primary" onClick={closeWellnessModal}>
                {activityTimeLeft > 0 ? 'Skip / Close' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
