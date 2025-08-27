import React from 'react';
import './Layout.css'; 

// A simple placeholder for the editor component we will build later
const Editor = () => {
  const editorStyle: React.CSSProperties = {
    flexGrow: 1,
    border: 'none',
    outline: 'none',
    padding: '20px',
    fontSize: '16px',
    lineHeight: 1.6,
    backgroundColor: 'transparent',
    color: 'var(--color-text)',
    fontFamily: 'var(--font-family)',
    resize: 'none',
  };
  return <textarea style={editorStyle} placeholder="Write your notes here..."></textarea>;
};


export const Layout = () => {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        {/* We will add file list here later */}
        <span>File Explorer</span>
      </aside>
      <main className="main-content">
        {/* This is where the editor will live */}
        <Editor />
      </main>
      <footer className="status-bar">
        {/* We will add status info here later */}
        <span>Ready</span>
      </footer>
    </div>
  );
};