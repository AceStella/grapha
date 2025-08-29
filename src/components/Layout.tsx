import React, { useState, useEffect, useRef } from 'react';
import './Layout.css';
import Editor from './Editor';
import FileExplorer from './FileExplorer';

export const Layout = () => {
  const [currentDoc, setCurrentDoc] = useState('# Welcome to Grapha!\n\nClick "Open Vault" to start.');
  // --- Add state to track the active file path ---
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  const handleFileSelect = async (filePath: string) => {
    const content = await window.electronAPI.readFile(filePath);
    if (content !== null) {
      setCurrentDoc(content);
      setActiveFile(filePath); // Set the active file
    }
  };

  const handleDocChange = (newContent: string) => {
    setCurrentDoc(newContent);
  };
  
  // --- Auto-saving effect ---
  useEffect(() => {
    if (activeFile && currentDoc !== null) {
      // Clear previous timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set a new timeout to save after 1 second of inactivity
      saveTimeoutRef.current = window.setTimeout(() => {
        window.electronAPI.saveFile({ filePath: activeFile, content: currentDoc });
        console.log(`Auto-saved: ${activeFile}`);
      }, 1000);
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [currentDoc, activeFile]); // This effect runs whenever the document content or active file changes

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <FileExplorer onFileSelect={handleFileSelect} />
      </aside>
      <main className="main-content">
        <Editor doc={currentDoc} onChange={handleDocChange} />
      </main>
      <footer className="status-bar">
        <span>{activeFile ? activeFile : 'No file selected'}</span>
      </footer>
    </div>
  );
};
