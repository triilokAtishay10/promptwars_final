import React, { useState, useEffect } from 'react';
import { Settings, Calendar, Award, Compass, Moon, Sun, Sunrise } from 'lucide-react';

export default function Dashboard({ examConfig, onUpdateConfig }) {
  const [showModal, setShowModal] = useState(false);
  const [exam, setExam] = useState(examConfig.exam || 'JEE');
  const [customExam, setCustomExam] = useState(examConfig.customExam || '');
  const [targetDate, setTargetDate] = useState(examConfig.targetDate || '');
  const [aspirantName, setAspirantName] = useState(examConfig.aspirantName || 'Aspirant');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState(null);

  // Time-of-day dynamic greeting
  useEffect(() => {
    const updateGreeting = () => {
      const hours = new Date().getHours();
      let roleAdjective = 'Aspirant';
      const currentExam = exam === 'Custom' ? customExam : exam;

      if (currentExam === 'NEET') roleAdjective = 'Healer';
      else if (currentExam === 'JEE') roleAdjective = 'Innovator';
      else if (currentExam === 'UPSC') roleAdjective = 'Leader';
      else if (currentExam === 'Board Exams') roleAdjective = 'Scholar';

      const displayName = aspirantName.trim() ? aspirantName : roleAdjective;

      if (hours >= 5 && hours < 12) {
        setGreeting(`Good morning, ${displayName}. Rise & shine. Every small step counts.`);
        setGreetingIcon(<Sunrise size={24} style={{ color: 'var(--color-orange)' }} />);
      } else if (hours >= 12 && hours < 17) {
        setGreeting(`Good afternoon, ${displayName}. Keep taking steady, mindful steps.`);
        setGreetingIcon(<Sun size={24} style={{ color: 'var(--color-orange)' }} />);
      } else if (hours >= 17 && hours < 21) {
        setGreeting(`Good evening, ${displayName}. Focus on how far you've come, not just how far you have to go.`);
        setGreetingIcon(<Compass size={24} style={{ color: 'var(--color-blue)' }} />);
      } else {
        setGreeting(`Good night, ${displayName}. Sleep is an active, vital part of preparation.`);
        setGreetingIcon(<Moon size={24} style={{ color: 'var(--color-purple)' }} />);
      }
    };

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, [exam, customExam, aspirantName]);

  // Countdown timer logic
  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeftData = { days: 0, hours: 0, minutes: 0 };

      if (difference > 0) {
        timeLeftData = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        };
      }
      setTimeLeft(timeLeftData);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // update every minute
    return () => clearInterval(interval);
  }, [targetDate]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!targetDate) return;
    
    onUpdateConfig({
      exam,
      customExam: exam === 'Custom' ? customExam : '',
      targetDate,
      aspirantName,
    });
    setShowModal(false);
  };

  const getExamDisplay = () => {
    if (exam === 'Custom') return customExam || 'Your Goal';
    return exam;
  };

  return (
    <>
      <div className="welcome-banner">
        <div className="banner-decor">
          <Award size={120} />
        </div>
        <div className="welcome-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {greetingIcon}
            <h2>{greeting.split('.')[0]}.</h2>
          </div>
          <p>{greeting.substring(greeting.indexOf('.') + 1).trim()}</p>
        </div>
        <button className="exam-setup-button" onClick={() => setShowModal(true)}>
          <Settings size={16} />
          {targetDate ? `${getExamDisplay()} Target Set` : 'Configure Exam Countdown'}
        </button>
      </div>

      <div className="card" style={{ marginBottom: '32px' }}>
        <h3 className="card-title">
          <span className="card-title-icon"><Calendar size={20} /></span>
          {targetDate ? `${getExamDisplay()} Journey Countdown` : 'Set Your Focus Target'}
        </h3>
        
        <div className="countdown-container">
          {targetDate ? (
            <>
              <div className="countdown-numbers">
                <div className="countdown-unit">
                  <span className="countdown-val">{timeLeft.days}</span>
                  <span className="countdown-lbl">Days</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-val">{timeLeft.hours}</span>
                  <span className="countdown-lbl">Hours</span>
                </div>
                <div className="countdown-unit">
                  <span className="countdown-val">{timeLeft.minutes}</span>
                  <span className="countdown-lbl">Mins</span>
                </div>
              </div>
              <p className="countdown-message">
                "Days left: Focus on the journey, not just the destination."
              </p>
            </>
          ) : (
            <div style={{ padding: '20px 0', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '16px' }}>Configure your target exam to track the journey mindfully.</p>
              <button className="btn-action-primary" style={{ maxWidth: '200px' }} onClick={() => setShowModal(true)}>
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              &times;
            </button>
            <div className="modal-header">
              <h3 className="modal-title">Configure Your Goal</h3>
              <p className="modal-subtitle">Track your timeline with a calm perspective.</p>
            </div>
            
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label" htmlFor="aspirantName">Your Name / Title</label>
                <input 
                  type="text" 
                  id="aspirantName" 
                  className="form-input"
                  placeholder="e.g. Rahul, future doctor"
                  value={aspirantName}
                  onChange={(e) => setAspirantName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="examSelect">Exam Selected</label>
                <select 
                  id="examSelect" 
                  className="form-select"
                  value={exam}
                  onChange={(e) => setExam(e.target.value)}
                >
                  <option value="JEE">JEE (Engineering)</option>
                  <option value="NEET">NEET (Medical)</option>
                  <option value="UPSC">UPSC Civil Services</option>
                  <option value="Board Exams">Board Exams</option>
                  <option value="Custom">Custom Exam Target</option>
                </select>
              </div>

              {exam === 'Custom' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="customExamInput">Exam Name</label>
                  <input 
                    type="text" 
                    id="customExamInput" 
                    className="form-input"
                    placeholder="Enter exam name..."
                    value={customExam}
                    onChange={(e) => setCustomExam(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="targetDateInput">Target Exam Date</label>
                <input 
                  type="date" 
                  id="targetDateInput" 
                  className="form-input"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Set Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
