import React, { useState } from 'react';
import { Heart, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';

const MOODS = [
  { id: 'Energized', label: 'Energized', emoji: '⚡', value: 5, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.4)' },
  { id: 'Focused', label: 'Focused', emoji: '🎯', value: 4, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.4)' },
  { id: 'Anxious', label: 'Anxious', emoji: '😰', value: 3, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)', border: 'rgba(139, 92, 246, 0.4)' },
  { id: 'Overwhelmed', label: 'Overwhelmed', emoji: '😵', value: 2, color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.4)' },
  { id: 'Exhausted', label: 'Exhausted', emoji: '😫', value: 1, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)', border: 'rgba(107, 114, 128, 0.4)' }
];

const TRIGGERS = [
  'Mock test scores',
  'Backlog',
  'Lack of sleep',
  'Peer pressure',
  'Long study hours',
  'Fear of failure',
  'Family expectations',
  'Difficulty focusing'
];

export default function MoodTracker({ moodLogs, onLogMood, onShowBreathing }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTriggers, setSelectedTriggers] = useState([]);
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const toggleTrigger = (trigger) => {
    if (selectedTriggers.includes(trigger)) {
      setSelectedTriggers(selectedTriggers.filter(t => t !== trigger));
    } else {
      setSelectedTriggers([...selectedTriggers, trigger]);
    }
  };

  const handleLog = () => {
    if (!selectedMood) return;
    
    onLogMood({
      mood: selectedMood.id,
      value: selectedMood.value,
      triggers: selectedTriggers
    });

    // Reset selectors
    setSelectedMood(null);
    setSelectedTriggers([]);

    // If Anxious or Overwhelmed, prompt/trigger breathing exercise
    if (selectedMood.id === 'Anxious' || selectedMood.id === 'Overwhelmed') {
      if (onShowBreathing) {
        onShowBreathing();
      }
    }
  };

  // Prepare chart data - last 7 days
  const getChartData = () => {
    const sortedLogs = [...moodLogs]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-7);

    // If no logs, fill with mock data for demonstration, but let user see actual if they have some.
    // We will generate the last 7 calendar days to plot.
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(dateStr => {
      const log = sortedLogs.find(l => l.date === dateStr);
      const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
      return {
        dateStr,
        dayName,
        hasLog: !!log,
        mood: log ? log.mood : null,
        value: log ? log.value : null,
        triggers: log ? log.triggers : []
      };
    });
  };

  const chartData = getChartData();

  // SVG Chart Dimensions & Computations
  const width = 500;
  const height = 140;
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 10;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // X coordinate mapping
  const getX = (index) => {
    return paddingLeft + (index * (chartWidth / 6));
  };

  // Y coordinate mapping: values range from 1 to 5
  const getY = (value) => {
    if (value === null) return 0;
    // value 5 goes to top (paddingTop), value 1 goes to bottom (paddingTop + chartHeight)
    return paddingTop + chartHeight - ((value - 1) * (chartHeight / 4));
  };

  // Generate SVG Path for line
  const loggedPoints = chartData.filter(d => d.hasLog);
  const pathD = chartData.reduce((path, point, idx) => {
    if (!point.hasLog) return path;
    const x = getX(idx);
    const y = getY(point.value);
    return path === '' ? `M ${x} ${y}` : `${path} L ${x} ${y}`;
  }, '');

  return (
    <div className="card">
      <h3 className="card-title">
        <span className="card-title-icon"><Heart size={20} /></span>
        Daily Well-being Log
      </h3>

      <div style={{ marginBottom: '20px' }}>
        <p className="section-label">How do you feel right now?</p>
        <div className="mood-selector-grid">
          {MOODS.map(m => (
            <button
              key={m.id}
              className={`mood-btn ${selectedMood?.id === m.id ? 'active' : ''}`}
              style={{
                '--mood-color-bg': m.bg,
                '--mood-color-border': m.border
              }}
              onClick={() => setSelectedMood(m)}
            >
              <span className="mood-emoji">{m.emoji}</span>
              <span className="mood-label" style={{ color: m.color }}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <p className="section-label">Identify Stress Triggers (Select all that apply)</p>
        <div className="triggers-grid">
          {TRIGGERS.map(t => {
            const checked = selectedTriggers.includes(t);
            return (
              <label key={t} className={`trigger-checkbox-label ${checked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  className="trigger-checkbox"
                  checked={checked}
                  onChange={() => toggleTrigger(t)}
                />
                <span className="custom-checkbox"></span>
                {t}
              </label>
            );
          })}
        </div>
      </div>

      <button
        className="btn-action-primary"
        onClick={handleLog}
        disabled={!selectedMood}
        style={{ opacity: selectedMood ? 1 : 0.6, cursor: selectedMood ? 'pointer' : 'not-allowed' }}
      >
        <CheckCircle2 size={18} />
        Log Today's Well-being
      </button>

      {/* Custom SVG Trend Chart */}
      <div className="chart-container">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <p className="chart-title">
            <TrendingUp size={16} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            Weekly Mood Trend
          </p>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Hover points for details
          </span>
        </div>

        <div style={{ position: 'relative' }}>
          <svg className="trend-svg" viewBox={`0 0 ${width} ${height}`}>
            {/* Grid Lines */}
            {[1, 2, 3, 4, 5].map(val => (
              <g key={val}>
                <line
                  className="chart-grid-line"
                  x1={paddingLeft}
                  y1={getY(val)}
                  x2={width - paddingRight}
                  y2={getY(val)}
                />
                {/* Y-axis labels (emoji hints) */}
                <text
                  className="chart-axis-text"
                  x={paddingLeft - 10}
                  y={getY(val) + 4}
                  textAnchor="end"
                  style={{ fontSize: '10px' }}
                >
                  {val === 5 ? '⚡' : val === 4 ? '🎯' : val === 3 ? '😰' : val === 2 ? '😵' : '😫'}
                </text>
              </g>
            ))}

            {/* Connecting line */}
            {pathD && (
              <path
                className="chart-line"
                d={pathD}
              />
            )}

            {/* Interactive Data Points */}
            {chartData.map((d, idx) => {
              if (!d.hasLog) {
                // Render placeholder empty dots for missing days
                return (
                  <circle
                    key={idx}
                    cx={getX(idx)}
                    cy={getY(3)}
                    r={2}
                    fill="var(--border-color)"
                  />
                );
              }

              const x = getX(idx);
              const y = getY(d.value);
              const m = MOODS.find(m => m.id === d.mood);

              return (
                <circle
                  key={idx}
                  className="chart-point"
                  cx={x}
                  cy={y}
                  r={5}
                  style={{ stroke: m?.color }}
                  onMouseEnter={() => setHoveredPoint({ ...d, x, y })}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              );
            })}

            {/* X Axis Labels */}
            {chartData.map((d, idx) => (
              <text
                key={idx}
                className="chart-axis-text"
                x={getX(idx)}
                y={height - 2}
                textAnchor="middle"
              >
                {d.dayName}
              </text>
            ))}
          </svg>

          {/* Point Tooltip */}
          {hoveredPoint && (
            <div
              style={{
                position: 'absolute',
                left: `${(hoveredPoint.x / width) * 100}%`,
                top: `${(hoveredPoint.y / height) * 100 - 15}%`,
                transform: 'translate(-50%, -100%)',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '8px 12px',
                boxShadow: 'var(--shadow-lg)',
                pointerEvents: 'none',
                zIndex: 10,
                minWidth: '130px',
                fontSize: '12px',
                lineHeight: '1.4'
              }}
            >
              <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>
                {MOODS.find(m => m.id === hoveredPoint.mood)?.emoji} {hoveredPoint.mood}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                {new Date(hoveredPoint.dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              {hoveredPoint.triggers.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '4px', paddingTop: '4px' }}>
                  <span style={{ fontWeight: '500', display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Triggers:</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
                    {hoveredPoint.triggers.map(t => (
                      <span key={t} style={{ backgroundColor: 'var(--bg-primary)', padding: '1px 4px', borderRadius: '4px', fontSize: '9px', border: '1px solid var(--border-color)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empty state disclaimer */}
        {moodLogs.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px', backgroundColor: 'var(--bg-primary)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <AlertTriangle size={16} style={{ color: 'var(--color-orange)', flexShrink: 0 }} />
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              No history logged yet. Complete today's log to see your mindfulness pattern!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
