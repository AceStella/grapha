import React, { useState } from 'react';
import './Layout.css';
import Editor from './Editor';
import FileExplorer from './FileExplorer';

export const Layout = () => {
  const [currentDoc, setCurrentDoc] = useState('# Welcome to Grapha!\n\nClick "Open Vault" to start.');

  const handleFileSelect = async (filePath: string) => {
    const content = await window.electronAPI.readFile(filePath);
    if (content !== null) {
      setCurrentDoc(content);
    }
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <FileExplorer onFileSelect={handleFileSelect} />
      </aside>
      <main className="main-content">
        <Editor doc={currentDoc} />
      </main>
      <footer className="status-bar">
        <span>Ready</span>
      </footer>
    </div>
  );
};
