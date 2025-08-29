import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Layout.css';
import Editor from './Editor';
import FileExplorer from './FileExplorer';
import GraphView from './GraphView'; // Import the new GraphView component

type ViewMode = 'editor' | 'graph';

export const Layout = () => {
  const [currentDoc, setCurrentDoc] = useState('# Welcome to Grapha!\n\nClick "Open Vault" to start.');
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [outgoingLinks, setOutgoingLinks] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] } | null>(null);
  const [vaultPath, setVaultPath] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('editor'); // State for view switching
  const saveTimeoutRef = useRef<number | null>(null);

  const handleFileSelect = useCallback(async (filePath: string) => {
    if (typeof filePath !== 'string') {
      console.error('handleFileSelect was called with an invalid path:', filePath);
      return;
    }
    const result = await window.electronAPI.readFile(filePath);
    if (result) {
      setCurrentDoc(result.content);
      setOutgoingLinks(result.links);
      setActiveFile(filePath);
      setViewMode('editor'); // Switch back to editor view when a file is selected
    }
  }, []);

  const handleOpenVault = useCallback(async (path: string) => {
      setVaultPath(path);
      const data = await window.electronAPI.getGraphData(path);
      // The library expects 'links' instead of 'edges'
      const formattedData = { nodes: data.nodes, links: data.edges };
      setGraphData(formattedData);
      console.log("Graph Data Loaded:", formattedData);
  }, []);

  const handleDocChange = (newContent: string) => {
    setCurrentDoc(newContent);
  };

  const handleFileDelete = useCallback((deletedFilePath: string) => {
    if (activeFile === deletedFilePath) {
      setActiveFile(null);
      setCurrentDoc('# Welcome to Grapha!\n\nSelect a note to continue.');
      setOutgoingLinks([]);
    }
  }, [activeFile]);
  
  const handleNodeClick = useCallback((nodeId: string) => {
      if (!graphData) return;
      const targetNode = graphData.nodes.find(n => n.id === nodeId);
      if (targetNode && targetNode.path) {
          handleFileSelect(targetNode.path);
      }
  }, [graphData, handleFileSelect]);

  useEffect(() => {
    if (!activeFile || !vaultPath) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = window.setTimeout(async () => {
      await window.electronAPI.saveFile({ filePath: activeFile, content: currentDoc });
      const result = await window.electronAPI.readFile(activeFile);
      if (result) setOutgoingLinks(result.links);
      handleOpenVault(vaultPath);
      console.log(`Auto-saved and graph re-fetched for vault: ${vaultPath}`);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [currentDoc, activeFile, vaultPath, handleOpenVault]);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <FileExplorer onFileSelect={handleFileSelect} onFileDelete={handleFileDelete} onVaultOpen={handleOpenVault}/>
      </aside>
      <main className="main-content">
        {/* --- View Switching Logic --- */}
        {viewMode === 'editor' ? (
          <Editor doc={currentDoc} onChange={handleDocChange} />
        ) : (
          <GraphView graphData={graphData!} onNodeClick={handleNodeClick} />
        )}
      </main>
      <footer className="status-bar">
        <span>
          {activeFile ? `Outgoing links: ${outgoingLinks.join(', ') || 'None'}` : 'No file selected'}
        </span>
        {/* --- View Toggle Button --- */}
        <button onClick={() => setViewMode(viewMode === 'editor' ? 'graph' : 'editor')} style={{ marginLeft: 'auto' }}>
          {viewMode === 'editor' ? 'Show Graph' : 'Show Editor'}
        </button>
      </footer>
    </div>
  );
};
