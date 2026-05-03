import React, { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import './AuthModal.css';

const AuthModal = ({ isOpen, onClose }) => {
  const [isSignIn, setIsSignIn] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="modal-header">
          <h2>{isSignIn ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isSignIn ? 'Sign in to access your saved wallpapers' : 'Sign up to start curating your collection'}</p>
        </div>

        <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
          {!isSignIn && (
            <div className="input-group">
              <User size={18} className="input-icon" />
              <input type="text" placeholder="Username" required />
            </div>
          )}
          
          <div className="input-group">
            <Mail size={18} className="input-icon" />
            <input type="email" placeholder="Email Address" required />
          </div>
          
          <div className="input-group">
            <Lock size={18} className="input-icon" />
            <input type="password" placeholder="Password" required />
          </div>

          <button type="submit" className="submit-btn">
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="modal-divider">
          <span>OR</span>
        </div>

        <button className="social-btn">
          Continue with GitHub
        </button>

        <div className="modal-footer">
          <p>
            {isSignIn ? "Don't have an account? " : "Already have an account? "}
            <span className="toggle-auth" onClick={() => setIsSignIn(!isSignIn)}>
              {isSignIn ? 'Sign up' : 'Sign in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
