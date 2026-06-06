import React, { useState, useEffect, useRef } from 'react';
import { Compass, Sparkles, Wind, Play, Square } from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  "An exam is just a snapshot of a performance on a single day. It does not measure your intelligence, potential, or value.",
  "Your mock test score is a diagnostic tool, not a final verdict. It is showing you what to review, not where you will end up.",
  "High-stakes preparation is a test of stamina and emotional stability, not just memory. Guard your peace fiercely.",
  "You do not need to study 16 hours a day to succeed. Focused, sustainable, and calm hours beat sleep-deprived cramming every time.",
  "Do not trade your health for a grade. A rested brain recalls information twice as fast and remains stable under mock exam pressure.",
  "If you feel like you have forgotten everything today, that is just anxiety talking. The recall will spark back when you focus on the paper.",
  "Be gentle with yourself. You are studying complex, difficult concepts. It is okay if they take time to settle in your mind.",
  "Rest is not a reward for studying; it is a prerequisite for learning. The brain reorganizes and stores knowledge while you sleep."
];

const ADVICE_BY_MOOD = {
  Energized: "Awesome energy! Channel this stamina into your most challenging subjects or backlogs today. But remember: pace yourself so you don't trigger exhaustion later.",
  Focused: "You're in the flow state. Protect this focus—silence notifications, clear your desk, and work on your active recall. Take a visual rest (20-20-20 rule) every half hour.",
  Anxious: "Anxiety is normal when you care about the result. It is just excess energy looking for a place to go. Let's redirect it. Try the 3-2-1 breathing box below to calm your pulse.",
  Overwhelmed: "A mountain is climbed one boulder at a time. Stop looking at the entire syllabus. Choose exactly ONE simple subtopic to study next, ignore the rest, and breathe.",
  Exhausted: "Your brain is signaling that it has hit its limit. Forcing more hours now has negative returns. Go sleep, take a walk, or step away completely. Rest is productive.",
  Default: "Welcome to your mindfulness space. Check in with how you're feeling. Remember: focus on the journey, not just the final score."
};

export default function Cheerleader({ currentMood, showBreathingDirectly, onBreathingDone }) {
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('idle'); // idle, inhale, hold, exhale
  const [breathingTimer, setBreathingTimer] = useState(3);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (showBreathingDirectly) {
      setIsBreathingActive(true);
    }
  }, [showBreathingDirectly]);

  // Handle Breathing State Machine
  useEffect(() => {
    if (!isBreathingActive) {
      setBreathingPhase('idle');
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setBreathingPhase('inhale');
    setBreathingTimer(3);

    timerRef.current = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev > 1) {
          return prev - 1;
        } else {
          // Transition phase
          let nextPhase = 'inhale';
          let nextTime = 3;

          setBreathingPhase((currentPhase) => {
            if (currentPhase === 'inhale') {
              nextPhase = 'hold';
              nextTime = 2;
            } else if (currentPhase === 'hold') {
              nextPhase = 'exhale';
              nextTime = 1;
            } else if (currentPhase === 'exhale') {
              nextPhase = 'inhale';
              nextTime = 3;
            }
            return nextPhase;
          });

          return nextTime;
        }
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isBreathingActive]);

  const handleBoost = () => {
    const currentIndex = MOTIVATIONAL_QUOTES.indexOf(quote);
    let nextIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    }
    setQuote(MOTIVATIONAL_QUOTES[nextIndex]);
  };

  const stopBreathing = () => {
    setIsBreathingActive(false);
    if (onBreathingDone) {
      onBreathingDone();
    }
  };

  const getAdviceText = () => {
    return ADVICE_BY_MOOD[currentMood] || ADVICE_BY_MOOD.Default;
  };

  return (
    <div className="card">
      <h3 className="card-title">
        <span className="card-title-icon"><Sparkles size={20} /></span>
        Mindfulness & Support
      </h3>

      {/* Mood specific advice */}
      <div className="advice-box">
        <strong style={{ display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>
          {currentMood ? `Logged Mood: ${currentMood}` : 'Mindful Reflection'}
        </strong>
        {getAdviceText()}
      </div>

      {/* Motivation quotes bubble */}
      <div className="motivation-container">
        <div className="quote-bubble">
          "{quote}"
        </div>
        <button className="btn-motivation-boost" onClick={handleBoost}>
          <Sparkles size={16} />
          Motivation Booster
        </button>
      </div>

      {/* Breathing Grounding Section */}
      <div className="grounding-section">
        <p className="section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Wind size={16} style={{ color: 'var(--color-green)' }} />
          3-2-1 Grounding & Breathing Reset
        </p>
        
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Take a minute to quiet your sympathetic nervous system. Inhale deeply (3s), hold (2s), and let go completely (1s).
        </p>

        <div className="breathing-card">
          <div className={`breathing-circle-outer ${isBreathingActive ? breathingPhase : ''}`}>
            <div className="breathing-circle-inner">
              {isBreathingActive ? (
                <>
                  <span className="breathing-action">
                    {breathingPhase === 'inhale' ? 'Inhale' : breathingPhase === 'hold' ? 'Hold' : 'Exhale'}
                  </span>
                  <span className="breathing-timer">{breathingTimer}s</span>
                </>
              ) : (
                <>
                  <Wind size={28} style={{ color: 'var(--color-green)', marginBottom: '4px' }} />
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ready</span>
                </>
              )}
            </div>
          </div>

          <div className="breathing-instruction">
            {isBreathingActive ? (
              <span style={{ fontWeight: '500' }}>
                {breathingPhase === 'inhale' && 'Expand your chest, breathing in through your nose.'}
                {breathingPhase === 'hold' && 'Pause. Allow the oxygen to settle and calm you.'}
                {breathingPhase === 'exhale' && 'Release. Blow all stress and anxiety out.'}
              </span>
            ) : (
              <span>Click Start to begin the calming breathing cycle.</span>
            )}
          </div>

          <button
            className="btn-breathing-control"
            onClick={() => isBreathingActive ? stopBreathing() : setIsBreathingActive(true)}
            style={{ 
              backgroundColor: isBreathingActive ? '#dc2626' : 'var(--color-green)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isBreathingActive ? (
              <>
                <Square size={12} fill="white" />
                Stop Exercise
              </>
            ) : (
              <>
                <Play size={12} fill="white" />
                Start Breathing
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
