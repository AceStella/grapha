// src/renderer/src/components/Layout.tsx

import React from 'react';
import './Layout.css';
import Editor from './Editor'; // Import our new professional editor

export const Layout = () => {
  return (
    <div className="app-layout">
      <aside className="sidebar">
        {/* We will add file list here later */}
        <span>File Explorer</span>
      </aside>
      <main className="main-content">
        {/* Use the new Editor component */}
        <Editor />
      </main>
      <footer className="status-bar">
        {/* We will add status info here later */}
        <span>Ready</span>
      </footer>
    </div>
  );
};