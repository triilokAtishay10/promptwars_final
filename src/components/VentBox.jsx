import React, { useState, useRef } from 'react';
import { Scissors, FileText, Trash2, HelpCircle } from 'lucide-react';

export default function VentBox({ journalEntries, onSaveEntry, onDeleteEntry }) {
  const [text, setText] = useState('');
  const [isShredding, setIsShredding] = useState(false);
  const [shredText, setShredText] = useState('');
  const [textareaHeight, setTextareaHeight] = useState(140);
  const textareaRef = useRef(null);

  const handleSave = () => {
    if (!text.trim()) return;
    onSaveEntry(text.trim());
    setText('');
  };

  const handleShred = () => {
    if (!text.trim()) return;
    
    // Capture height and text for the animation strips
    if (textareaRef.current) {
      setTextareaHeight(textareaRef.current.offsetHeight);
    }
    
    setShredText(text);
    setIsShredding(true);
    setText(''); // Clear the main input immediately
    
    // Reset shredding state after the animation finishes (1.8s + delays)
    setTimeout(() => {
      setIsShredding(false);
      setShredText('');
    }, 2500);
  };

  const stripCount = 10;

  return (
    <div className="card">
      <h3 className="card-title">
        <span className="card-title-icon"><Scissors size={20} /></span>
        Anxiety Vent Box
      </h3>
      
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        Write down your worries, stress, or self-doubt. Let them flow out of your mind. Save them to reflect later, or shred them completely.
      </p>

      <div className="vent-box-container">
        {/* Main Textarea */}
        <textarea
          ref={textareaRef}
          className="vent-textarea"
          placeholder="I'm feeling overwhelmed about my upcoming mock test..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isShredding}
          style={{ 
            visibility: isShredding ? 'hidden' : 'visible',
            height: `${textareaHeight}px`
          }}
        />

        {/* Shredding Animation Layer */}
        {isShredding && (
          <div 
            className="shredder-overlay"
            style={{ height: `${textareaHeight}px` }}
          >
            {Array.from({ length: stripCount }).map((_, i) => {
              const left = `${i * (100 / stripCount)}%`;
              const width = `${100 / stripCount}%`;
              
              // Random rotation between -12 and 12 deg
              const rot = (Math.random() - 0.5) * 24;
              // Random X translation between -40 and 40 px
              const transX = (Math.random() - 0.5) * 80;
              
              return (
                <div
                  key={i}
                  className="shred-strip"
                  style={{
                    left,
                    width,
                    height: '100%',
                    '--shred-rotate': `${rot}deg`,
                    '--shred-translate': `${transX}px`,
                    animationDelay: `${i * 0.06}s`
                  }}
                >
                  <div
                    style={{
                      width: `${stripCount * 100}%`,
                      transform: `translateX(-${i * (100 / stripCount) * (stripCount)}%)`,
                      padding: '18px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: 'var(--text-muted)'
                    }}
                  >
                    {shredText}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="vent-buttons">
          <button
            className="btn-vent-shred"
            onClick={handleShred}
            disabled={!text.trim() || isShredding}
            style={{ opacity: text.trim() && !isShredding ? 1 : 0.5 }}
          >
            <Scissors size={16} />
            Shred It
          </button>
          
          <button
            className="btn-vent-save"
            onClick={handleSave}
            disabled={!text.trim() || isShredding}
            style={{ opacity: text.trim() && !isShredding ? 1 : 0.5 }}
          >
            <FileText size={16} />
            Save to Journal
          </button>
        </div>
      </div>

      {/* Journal History Section */}
      <div className="journal-history">
        <div className="journal-header">
          <span>
            <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'middle' }} />
            Saved Journal Entries ({journalEntries.length})
          </span>
        </div>
        
        {journalEntries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '12px', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
            Your journal is empty. Save entries to track your thoughts and reflection milestones.
          </div>
        ) : (
          <div className="journal-list">
            {journalEntries.map(entry => (
              <div key={entry.id} className="journal-entry">
                <div className="journal-entry-date">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div className="journal-entry-text">{entry.text}</div>
                <button
                  className="btn-delete-entry"
                  onClick={() => onDeleteEntry(entry.id)}
                  title="Remove this entry"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
