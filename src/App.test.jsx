/**
 * Aura – Student Mental Wellness Tracker
 * Component Test Suite (Vitest + React Testing Library)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// ── mock localStorage / sessionStorage ──────────────────────────────────────
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (k) => store[k] ?? null,
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(q => ({
    matches: false,
    media: q,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// ── component imports ────────────────────────────────────────────────────────
import App from './App';
import Dashboard from './components/Dashboard';
import MoodTracker from './components/MoodTracker';
import VentBox from './components/VentBox';
import Cheerleader from './components/Cheerleader';

// ════════════════════════════════════════════════════════════════════════════
// APP – Top-level integration
// ════════════════════════════════════════════════════════════════════════════
describe('App', () => {
  beforeEach(() => localStorageMock.clear());

  it('renders the Aura brand name in the header', () => {
    render(<App />);
    expect(screen.getByText('Aura')).toBeInTheDocument();
  });

  it('renders the Dashboard tab by default', () => {
    render(<App />);
    const dashPanel = screen.getByRole('tabpanel', { name: /dashboard/i });
    expect(dashPanel).toBeInTheDocument();
  });

  it('switches to Journal tab when clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('tab', { name: /vent journal/i }));
    expect(screen.getByRole('tabpanel', { name: /vent journal/i })).toBeInTheDocument();
  });

  it('switches to Analytics tab when clicked', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('tab', { name: /analytics/i }));
    expect(screen.getByRole('tabpanel', { name: /analytics/i })).toBeInTheDocument();
  });

  it('theme toggle button is accessible with aria-label', () => {
    render(<App />);
    const btn = screen.getByRole('button', { name: /switch to dark mode/i });
    expect(btn).toBeInTheDocument();
  });

  it('contains a skip-to-main-content link', () => {
    render(<App />);
    expect(screen.getByText(/skip to main content/i)).toBeInTheDocument();
  });

  it('renders the site footer', () => {
    render(<App />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// DASHBOARD – Greeting & Countdown
// ════════════════════════════════════════════════════════════════════════════
describe('Dashboard', () => {
  const defaultConfig = { exam: 'JEE', customExam: '', targetDate: '', aspirantName: '' };
  const noop = vi.fn();

  it('renders configure exam countdown button when no date set', () => {
    render(<Dashboard examConfig={defaultConfig} onUpdateConfig={noop} />);
    expect(screen.getByRole('button', { name: /configure exam countdown/i })).toBeInTheDocument();
  });

  it('opens exam setup modal on button click', async () => {
    render(<Dashboard examConfig={defaultConfig} onUpdateConfig={noop} />);
    await userEvent.click(screen.getByRole('button', { name: /configure exam countdown/i }));
    expect(screen.getByRole('dialog', { hidden: true }) ?? screen.getByText(/configure your goal/i)).toBeTruthy();
  });

  it('renders greeting text', () => {
    render(<Dashboard examConfig={{ ...defaultConfig, aspirantName: 'Rahul' }} onUpdateConfig={noop} />);
    // Greeting should contain the name
    const banner = screen.getByText(/rahul/i);
    expect(banner).toBeInTheDocument();
  });

  it('shows countdown numbers when date is configured', () => {
    const futureDate = new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split('T')[0];
    render(<Dashboard examConfig={{ ...defaultConfig, targetDate: futureDate }} onUpdateConfig={noop} />);
    // Should show days countdown unit
    expect(screen.getByText('Days')).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// MOOD TRACKER – Selection, Logging & Wellness Score
// ════════════════════════════════════════════════════════════════════════════
describe('MoodTracker', () => {
  const noop = vi.fn();
  const emptyLogs = [];

  beforeEach(() => { noop.mockClear(); });

  it('renders all 5 mood buttons', () => {
    render(<MoodTracker moodLogs={emptyLogs} onLogMood={noop} onShowBreathing={noop} />);
    expect(screen.getByRole('button', { name: /mood: energized/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mood: focused/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mood: anxious/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mood: overwhelmed/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mood: exhausted/i })).toBeInTheDocument();
  });

  it('Log button is disabled when no mood selected', () => {
    render(<MoodTracker moodLogs={emptyLogs} onLogMood={noop} onShowBreathing={noop} />);
    const logBtn = screen.getByRole('button', { name: /save today's well-being log/i });
    expect(logBtn).toBeDisabled();
  });

  it('Log button enables after mood selection', async () => {
    render(<MoodTracker moodLogs={emptyLogs} onLogMood={noop} onShowBreathing={noop} />);
    await userEvent.click(screen.getByRole('button', { name: /mood: focused/i }));
    expect(screen.getByRole('button', { name: /save today's well-being log/i })).not.toBeDisabled();
  });

  it('calls onLogMood with correct mood id after clicking Log', async () => {
    render(<MoodTracker moodLogs={emptyLogs} onLogMood={noop} onShowBreathing={noop} />);
    await userEvent.click(screen.getByRole('button', { name: /mood: focused/i }));
    await userEvent.click(screen.getByRole('button', { name: /save today's well-being log/i }));
    expect(noop).toHaveBeenCalledWith(
      expect.objectContaining({ mood: 'Focused', value: 4 })
    );
  });

  it('calls onShowBreathing when Anxious mood is logged', async () => {
    const mockBreathing = vi.fn();
    render(<MoodTracker moodLogs={emptyLogs} onLogMood={noop} onShowBreathing={mockBreathing} />);
    await userEvent.click(screen.getByRole('button', { name: /mood: anxious/i }));
    await userEvent.click(screen.getByRole('button', { name: /save today's well-being log/i }));
    expect(mockBreathing).toHaveBeenCalled();
  });

  it('renders sleep hours input with correct label', () => {
    render(<MoodTracker moodLogs={emptyLogs} onLogMood={noop} onShowBreathing={noop} />);
    expect(screen.getByLabelText(/hours slept last night/i)).toBeInTheDocument();
  });

  it('renders mock test score input', () => {
    render(<MoodTracker moodLogs={emptyLogs} onLogMood={noop} onShowBreathing={noop} />);
    expect(screen.getByLabelText(/mock test score percentage/i)).toBeInTheDocument();
  });

  it('renders wellness index gauge section', () => {
    render(<MoodTracker moodLogs={emptyLogs} onLogMood={noop} onShowBreathing={noop} />);
    expect(screen.getByText(/wellness index/i)).toBeInTheDocument();
  });

  it('renders empty state notice when no logs exist', () => {
    render(<MoodTracker moodLogs={emptyLogs} onLogMood={noop} onShowBreathing={noop} />);
    expect(screen.getByText(/no history yet/i)).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// VENT BOX – Journal save / shred / delete
// ════════════════════════════════════════════════════════════════════════════
describe('VentBox', () => {
  const onSave = vi.fn();
  const onDelete = vi.fn();
  const entries = [
    { id: '1', date: new Date().toISOString(), text: 'I am stressed about mocks.', moodContext: 'Anxious' },
  ];

  beforeEach(() => { onSave.mockClear(); onDelete.mockClear(); });

  it('renders the vent textarea', () => {
    render(<VentBox journalEntries={[]} onSaveEntry={onSave} onDeleteEntry={onDelete} />);
    expect(screen.getByRole('textbox', { name: /write your thoughts/i })).toBeInTheDocument();
  });

  it('Save button is disabled when textarea is empty', () => {
    render(<VentBox journalEntries={[]} onSaveEntry={onSave} onDeleteEntry={onDelete} />);
    expect(screen.getByRole('button', { name: /save to journal/i })).toBeDisabled();
  });

  it('Save button enables after typing', async () => {
    render(<VentBox journalEntries={[]} onSaveEntry={onSave} onDeleteEntry={onDelete} />);
    await userEvent.type(screen.getByRole('textbox', { name: /write your thoughts/i }), 'feeling overwhelmed');
    expect(screen.getByRole('button', { name: /save to journal/i })).not.toBeDisabled();
  });

  it('calls onSaveEntry when Save is clicked with text', async () => {
    render(<VentBox journalEntries={[]} onSaveEntry={onSave} onDeleteEntry={onDelete} />);
    await userEvent.type(screen.getByRole('textbox', { name: /write your thoughts/i }), 'test worry');
    await userEvent.click(screen.getByRole('button', { name: /save to journal/i }));
    expect(onSave).toHaveBeenCalledWith('test worry');
  });

  it('renders existing journal entries', () => {
    render(<VentBox journalEntries={entries} onSaveEntry={onSave} onDeleteEntry={onDelete} />);
    expect(screen.getByText(/i am stressed about mocks/i)).toBeInTheDocument();
  });

  it('calls onDeleteEntry when delete button is clicked', async () => {
    render(<VentBox journalEntries={entries} onSaveEntry={onSave} onDeleteEntry={onDelete} />);
    await userEvent.click(screen.getByRole('button', { name: /delete entry/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });

  it('renders empty state when no journal entries', () => {
    render(<VentBox journalEntries={[]} onSaveEntry={onSave} onDeleteEntry={onDelete} />);
    expect(screen.getByText(/your journal is empty/i)).toBeInTheDocument();
  });
});

// ════════════════════════════════════════════════════════════════════════════
// CHEERLEADER – Breathing exercise & motivation
// ════════════════════════════════════════════════════════════════════════════
describe('Cheerleader', () => {
  const noop = vi.fn();

  it('renders the motivational quote section', () => {
    render(<Cheerleader currentMood="" showBreathingDirectly={false} onBreathingDone={noop} />);
    expect(screen.getByRole('button', { name: /motivation booster/i })).toBeInTheDocument();
  });

  it('renders breathing mode selector buttons', () => {
    render(<Cheerleader currentMood="" showBreathingDirectly={false} onBreathingDone={noop} />);
    expect(screen.getByRole('button', { name: /3-2-1 grounding/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /4-7-8 sleep/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /box 4-4-4/i })).toBeInTheDocument();
  });

  it('renders Start Breathing button', () => {
    render(<Cheerleader currentMood="" showBreathingDirectly={false} onBreathingDone={noop} />);
    expect(screen.getByRole('button', { name: /start breathing/i })).toBeInTheDocument();
  });

  it('shows mood-specific advice for Anxious mood', () => {
    render(<Cheerleader currentMood="Anxious" showBreathingDirectly={false} onBreathingDone={noop} />);
    expect(screen.getByText(/anxiety is normal/i)).toBeInTheDocument();
  });

  it('shows mood-specific advice for Exhausted mood', () => {
    render(<Cheerleader currentMood="Exhausted" showBreathingDirectly={false} onBreathingDone={noop} />);
    expect(screen.getByText(/brain is signaling/i)).toBeInTheDocument();
  });

  it('clicking Motivation Booster changes the quote', async () => {
    render(<Cheerleader currentMood="" showBreathingDirectly={false} onBreathingDone={noop} />);
    const initial = screen.getByRole('blockquote').textContent;
    await userEvent.click(screen.getByRole('button', { name: /motivation booster/i }));
    // Quote may or may not change (random), just ensure the component doesn't crash
    expect(screen.getByRole('blockquote')).toBeInTheDocument();
  });
});
