import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Layout.css';
import Editor from './Editor';
import FileExplorer from './FileExplorer';

export const Layout = () => {
  const [currentDoc, setCurrentDoc] = useState('# Welcome to Grapha!\n\nClick "Open Vault" to start.');
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const handleFileSelect = useCallback(async (filePath: string) => {
    if (typeof filePath !== 'string') {
      console.error('handleFileSelect was called with an invalid path:', filePath);
      return;
    }
    const content = await window.electronAPI.readFile(filePath);
    if (content !== null) {
      setCurrentDoc(content);
      setActiveFile(filePath);
    }
  }, []);

  const handleDocChange = (newContent: string) => {
    setCurrentDoc(newContent);
  };
  
  const handleFileDelete = useCallback((deletedFilePath: string) => {
    // If the currently active file is the one that was deleted, reset the editor.
    if (activeFile === deletedFilePath) {
      setActiveFile(null);
      setCurrentDoc('# Welcome to Grapha!\n\nSelect a note to continue.');
    }
  }, [activeFile]);

  useEffect(() => {
    if (!activeFile) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = window.setTimeout(() => {
      window.electronAPI.saveFile({ filePath: activeFile, content: currentDoc });
      console.log(`Auto-saved: ${activeFile}`);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentDoc, activeFile]);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <FileExplorer onFileSelect={handleFileSelect} onFileDelete={handleFileDelete} />
      </aside>
      <main className="main-content">
        <Editor doc={currentDoc} onChange={handleDocChange} />
      </main>
      <footer className="status-bar">
        <span>{activeFile || 'No file selected'}</span>
      </footer>
    </div>
  );
};
