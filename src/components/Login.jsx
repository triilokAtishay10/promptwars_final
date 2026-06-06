import React, { useState } from 'react';
import { Brain, Lock, User, Eye, EyeOff } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    // Simulate a gentle transition
    setTimeout(() => {
      if (username.trim().toLowerCase() === 'admin' && password === '12345') {
        onLogin();
      } else {
        setError('Incorrect username or password. Take a deep breath and try again.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="login-screen">
      <div className="login-bg-decor login-bg-decor-1"></div>
      <div className="login-bg-decor login-bg-decor-2"></div>
      
      <div className="login-card">
        <div className="login-logo">
          <Brain size={36} />
        </div>
        
        <h1 className="login-title">Aura</h1>
        <p className="login-subtitle">Your personal space for mindful exam preparation.</p>
        
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label" htmlFor="username">
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
              <input
                id="username"
                type="text"
                className="login-input"
                style={{ paddingLeft: '40px' }}
                placeholder="Enter admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
          </div>
          
          <div className="login-form-group">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock 
                size={18} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-muted)' 
                }} 
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                style={{ paddingLeft: '40px', paddingRight: '40px' }}
                placeholder="Enter 12345"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center'
                }}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Entering Space...' : 'Unlock Journal'}
          </button>
        </form>
        
        <p className="login-footer-hint">
          All data is saved locally in your browser and never leaves your device.
        </p>
      </div>
    </div>
  );
}
