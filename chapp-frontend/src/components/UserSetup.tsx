import React, { useState } from 'react';

interface UserSetupProps {
  onUserSet: (username: string) => void;
}

export const UserSetup: React.FC<UserSetupProps> = ({ onUserSet }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onUserSet(username.trim());
    }
  };

  return (
    <div className="user-setup">
      <div className="user-setup-container">
        <h2>Welcome to Chapp!</h2>
        <p>Enter your username to start chatting</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="username-input"
            autoFocus
          />
          <button
            type="submit"
            disabled={!username.trim()}
            className="join-button"
          >
            Join Chat
          </button>
        </form>
      </div>
    </div>
  );
}; 