import React, { useState } from 'react';
import { Heart, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

const MOODS = [
  { id: 'Energized', label: 'Energized', emoji: '⚡', value: 5, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.4)' },
  { id: 'Focused',   label: 'Focused',   emoji: '🎯', value: 4, color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.4)'  },
  { id: 'Anxious',   label: 'Anxious',   emoji: '😰', value: 3, color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.4)'  },
  { id: 'Overwhelmed',label:'Overwhelmed',emoji:'😵', value: 2, color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.4)'  },
  { id: 'Exhausted', label: 'Exhausted', emoji: '😫', value: 1, color: '#6b7280', bg: 'rgba(107,114,128,0.12)',border: 'rgba(107,114,128,0.4)' },
];

const TRIGGERS = [
  'Mock test scores','Backlog','Lack of sleep','Peer pressure',
  'Long study hours','Fear of failure','Family expectations','Difficulty focusing',
];

/** Compute a 0-100 wellness score from mood, sleep, and triggers */
function computeWellnessScore(mood, sleepHours, triggers) {
  if (!mood) return null;
  const moodVal = MOODS.find(m => m.id === mood)?.value ?? 3; // 1-5
  const moodScore = ((moodVal - 1) / 4) * 50;               // 0-50
  const clampedSleep = Math.min(Math.max(sleepHours, 3), 9);
  const sleepScore = ((clampedSleep - 3) / 6) * 30;         // 0-30
  const triggerPenalty = Math.min(triggers.length * 2.5, 20); // 0-20 penalty
  return Math.round(moodScore + sleepScore + (20 - triggerPenalty));
}

function WellnessGauge({ score }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const pct = score === null ? 0 : score / 100;
  const offset = circumference - pct * circumference;

  const color = score === null
    ? 'var(--border-color)'
    : score >= 70 ? '#10b981'
    : score >= 40 ? '#f97316'
    : '#ef4444';

  const label = score === null
    ? '—'
    : score >= 70 ? 'Good'
    : score >= 40 ? 'Fair'
    : 'Low';

  return (
    <div
      className="wellness-score-container"
      role="img"
      aria-label={`Wellness index: ${score !== null ? score + ' out of 100, ' + label : 'not yet logged'}`}
    >
      <svg className="score-gauge-svg" viewBox="0 0 110 110" aria-hidden="true">
        <circle className="score-gauge-bg" cx="55" cy="55" r={radius} />
        <circle
          className="score-gauge-progress"
          cx="55" cy="55" r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ stroke: color, transformOrigin: '55px 55px', transform: 'rotate(-90deg)' }}
        />
      </svg>
      <div className="score-text-overlay">
        <span className="score-val" style={{ color }}>{score !== null ? score : '—'}</span>
        <span className="score-unit">/100</span>
      </div>
      <p className="score-label" style={{ color }}>{label}</p>
    </div>
  );
}

export default function MoodTracker({ moodLogs, onLogMood, onShowBreathing, onlyShowChart }) {
  const [selectedMood, setSelectedMood]       = useState(null);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [sleepHours, setSleepHours]           = useState(7);
  const [mockScore, setMockScore]             = useState('');
  const [hoveredPoint, setHoveredPoint]       = useState(null);

  const toggleTrigger = (t) => setSelectedTriggers(prev =>
    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
  );

  const handleLog = () => {
    if (!selectedMood) return;
    onLogMood({ mood: selectedMood.id, value: selectedMood.value, triggers: selectedTriggers, sleepHours, mockScore: mockScore ? Number(mockScore) : null });
    setSelectedMood(null);
    setSelectedTriggers([]);
    setSleepHours(7);
    setMockScore('');
    if (selectedMood.id === 'Anxious' || selectedMood.id === 'Overwhelmed') onShowBreathing();
  };

  // ── Chart helpers ──
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });
  const chartData = last7Days.map(dateStr => {
    const log = moodLogs.find(l => l.date === dateStr);
    return {
      dateStr,
      dayName: new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
      hasLog: !!log,
      mood: log?.mood ?? null,
      value: log?.value ?? null,
      triggers: log?.triggers ?? [],
      sleepHours: log?.sleepHours ?? null,
      mockScore: log?.mockScore ?? null,
    };
  });

  const W = 500, H = 150, pL = 40, pR = 20, pT = 10, pB = 24;
  const cW = W - pL - pR, cH = H - pT - pB;
  const getX = i => pL + i * (cW / 6);
  const getY = v => (v == null) ? pT + cH / 2 : pT + cH - ((v - 1) / 4) * cH;

  const pathD = chartData.reduce((p, pt, i) => {
    if (!pt.hasLog) return p;
    const x = getX(i), y = getY(pt.value);
    return p === '' ? `M ${x} ${y}` : `${p} L ${x} ${y}`;
  }, '');

  const wellnessNow = computeWellnessScore(
    selectedMood?.id ?? null, sleepHours, selectedTriggers
  );

  if (onlyShowChart) {
    return (
      <div className="card">
        <h2 className="card-title">
          <span className="card-title-icon" aria-hidden="true"><TrendingUp size={18} /></span>
          Weekly Mood Trend
        </h2>
        <ChartSVG chartData={chartData} W={W} H={H} pL={pL} pR={pR} pT={pT} pB={pB} pathD={pathD} getX={getX} getY={getY} hoveredPoint={hoveredPoint} setHoveredPoint={setHoveredPoint} />
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="card-title">
        <span className="card-title-icon" aria-hidden="true"><Heart size={20} /></span>
        Daily Well-being Log
      </h2>

      <div className="tracker-split">
        {/* Left: mood + triggers */}
        <div>
          <p className="section-label" id="mood-label">How do you feel right now?</p>
          <div className="mood-selector-grid" role="group" aria-labelledby="mood-label">
            {MOODS.map(m => (
              <button
                key={m.id}
                id={`mood-btn-${m.id}`}
                className={`mood-btn ${selectedMood?.id === m.id ? 'active' : ''}`}
                style={{ '--mood-color-bg': m.bg, '--mood-color-border': m.border }}
                onClick={() => setSelectedMood(m)}
                aria-pressed={selectedMood?.id === m.id}
                aria-label={`Mood: ${m.label}`}
              >
                <span className="mood-emoji" aria-hidden="true">{m.emoji}</span>
                <span className="mood-label" style={{ color: m.color }}>{m.label}</span>
              </button>
            ))}
          </div>

          {/* Sleep & Score inputs */}
          <div className="inputs-row">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="sleep-hours-input">
                Sleep Hours (last night)
              </label>
              <input
                id="sleep-hours-input"
                type="number"
                className="form-input"
                min="1" max="12" step="0.5"
                value={sleepHours}
                onChange={e => setSleepHours(Number(e.target.value))}
                aria-label="Hours slept last night"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" htmlFor="mock-score-input">
                Mock Test Score % <span style={{ fontWeight: 400 }}>(optional)</span>
              </label>
              <input
                id="mock-score-input"
                type="number"
                className="form-input"
                min="0" max="100"
                placeholder="e.g. 72"
                value={mockScore}
                onChange={e => setMockScore(e.target.value)}
                aria-label="Mock test score percentage, optional"
              />
            </div>
          </div>

          <p className="section-label" id="triggers-label">Stress Triggers today</p>
          <div className="triggers-grid" role="group" aria-labelledby="triggers-label">
            {TRIGGERS.map(t => {
              const checked = selectedTriggers.includes(t);
              return (
                <label key={t} className={`trigger-checkbox-label ${checked ? 'checked' : ''}`}>
                  <input
                    type="checkbox"
                    className="trigger-checkbox"
                    checked={checked}
                    onChange={() => toggleTrigger(t)}
                    aria-label={t}
                  />
                  <span className="custom-checkbox" aria-hidden="true" />
                  {t}
                </label>
              );
            })}
          </div>
        </div>

        {/* Right: wellness gauge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
          <p className="section-label" style={{ textAlign: 'center' }}>Wellness Index</p>
          <WellnessGauge score={wellnessNow} />
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', lineHeight: '1.4' }}>
            Live preview based on your selections. Saved on log.
          </p>
        </div>
      </div>

      <button
        id="log-wellbeing-btn"
        className="btn-action-primary"
        onClick={handleLog}
        disabled={!selectedMood}
        aria-disabled={!selectedMood}
        aria-label="Save today's well-being log"
        style={{ opacity: selectedMood ? 1 : 0.55, cursor: selectedMood ? 'pointer' : 'not-allowed' }}
      >
        <CheckCircle2 size={18} aria-hidden="true" />
        Log Today's Well-being
      </button>

      {/* Weekly Trend Chart */}
      <div className="chart-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <p className="chart-title">
            <TrendingUp size={14} style={{ display: 'inline', marginRight: '5px', verticalAlign: 'text-bottom' }} aria-hidden="true" />
            Weekly Mood Trend
          </p>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Hover points for details</span>
        </div>
        <ChartSVG
          chartData={chartData} W={W} H={H} pL={pL} pR={pR} pT={pT} pB={pB}
          pathD={pathD} getX={getX} getY={getY}
          hoveredPoint={hoveredPoint} setHoveredPoint={setHoveredPoint}
        />
        {moodLogs.length === 0 && (
          <div role="status" style={{ display:'flex', alignItems:'center', gap:'8px', marginTop:'10px', padding:'10px', backgroundColor:'var(--bg-primary)', borderRadius:'8px', border:'1px solid var(--border-color)' }}>
            <AlertTriangle size={15} style={{ color:'var(--color-orange)', flexShrink:0 }} aria-hidden="true" />
            <p style={{ fontSize:'11px', color:'var(--text-secondary)' }}>
              No history yet. Log your first check-in to see your weekly pattern!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChartSVG({ chartData, W, H, pL, pR, pT, pB, pathD, getX, getY, hoveredPoint, setHoveredPoint }) {
  return (
    <div style={{ position: 'relative' }}>
      <svg
        className="trend-svg"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Weekly mood trend chart showing the last 7 days of emotional states"
      >
        {[1,2,3,4,5].map(v => (
          <g key={v}>
            <line className="chart-grid-line" x1={pL} y1={getY(v)} x2={W - pR} y2={getY(v)} />
            <text className="chart-axis-text" x={pL - 8} y={getY(v) + 4} textAnchor="end" aria-hidden="true">
              {v === 5 ? '⚡' : v === 4 ? '🎯' : v === 3 ? '😰' : v === 2 ? '😵' : '😫'}
            </text>
          </g>
        ))}

        {pathD && <path className="chart-line" d={pathD} />}

        {chartData.map((d, i) => {
          const x = getX(i), y = getY(d.value ?? 3);
          const m = MOODS.find(m => m.id === d.mood);
          return d.hasLog ? (
            <circle
              key={i}
              className="chart-point"
              cx={x} cy={y} r={5}
              style={{ stroke: m?.color }}
              tabIndex={0}
              role="button"
              aria-label={`${d.dayName}: ${d.mood}, sleep ${d.sleepHours}h${d.mockScore ? ', score ' + d.mockScore + '%' : ''}`}
              onMouseEnter={() => setHoveredPoint({ ...d, x, y })}
              onMouseLeave={() => setHoveredPoint(null)}
              onFocus={() => setHoveredPoint({ ...d, x, y })}
              onBlur={() => setHoveredPoint(null)}
            />
          ) : (
            <circle key={i} cx={x} cy={y} r={2.5} fill="var(--border-color)" aria-hidden="true" />
          );
        })}

        {chartData.map((d, i) => (
          <text key={i} className="chart-axis-text" x={getX(i)} y={H - 4} textAnchor="middle" aria-hidden="true">
            {d.dayName}
          </text>
        ))}
      </svg>

      {hoveredPoint && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            left: `${(hoveredPoint.x / W) * 100}%`,
            top: `${(hoveredPoint.y / H) * 100 - 10}%`,
            transform: 'translate(-50%, -100%)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '8px 12px',
            boxShadow: 'var(--shadow-lg)',
            pointerEvents: 'none',
            zIndex: 10,
            minWidth: '140px',
            fontSize: '12px',
            lineHeight: '1.4',
          }}
        >
          <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
            {MOODS.find(m => m.id === hoveredPoint.mood)?.emoji} {hoveredPoint.mood}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
            {new Date(hoveredPoint.dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
          {hoveredPoint.sleepHours && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '3px' }}>
              😴 {hoveredPoint.sleepHours}h sleep
            </div>
          )}
          {hoveredPoint.mockScore && (
            <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
              📝 Score: {hoveredPoint.mockScore}%
            </div>
          )}
          {hoveredPoint.triggers.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '4px', paddingTop: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Triggers:</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                {hoveredPoint.triggers.map(t => (
                  <span key={t} style={{ background: 'var(--bg-primary)', padding: '1px 5px', borderRadius: '4px', fontSize: '9px', border: '1px solid var(--border-color)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
