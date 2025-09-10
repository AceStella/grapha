import React, { useState, useCallback } from 'react';
import './Layout.css';
import { EditorModal } from './Editor';
import FileExplorer from './FileExplorer';
import GraphView from './GraphView';
import { useStore } from '../store';

export const Layout = () => {
  const { openEditor } = useStore();
  const [graphData, setGraphData] = useState<{ nodes: any[], edges: any[] } | null>(null);
  const [vaultPath, setVaultPath] = useState<string | null>(null);

  const handleNodeDoubleClick = useCallback(async (nodeId: string) => {
    if (!graphData) return;
    const targetNode = graphData.nodes.find(n => n.id === nodeId);
    if (targetNode && targetNode.path) {
      const result = await window.electronAPI.readFile(targetNode.path);
      if (result) {
        openEditor({
          id: targetNode.id,
          path: targetNode.path,
          content: result.content
        });
      }
    }
  }, [graphData, openEditor]);

  const handleOpenVault = useCallback(async (path: string) => {
      setVaultPath(path);
      const data = await window.electronAPI.getGraphData(path);
      const formattedData = { nodes: data.nodes, links: data.edges };
      setGraphData(formattedData);
      console.log("Graph Data Loaded:", formattedData);
  }, []);
  
  // These handlers are now simplified as they don't control the editor directly
  const handleFileSelect = useCallback((filePath: string) => {
    // In a graph-centric model, selecting a file might mean focusing it on the graph.
    // For now, we'll keep this simple.
    console.log("File selected, but not opening editor automatically:", filePath);
  }, []);

  const handleFileDelete = useCallback((deletedFilePath: string) => {
    console.log("File deleted:", deletedFilePath);
    if (vaultPath) handleOpenVault(vaultPath); // Refresh graph after delete
  }, [vaultPath, handleOpenVault]);

  return (
    <>
      <div className="app-layout">
        <aside className="sidebar">
          <FileExplorer onFileSelect={handleFileSelect} onFileDelete={handleFileDelete} onVaultOpen={handleOpenVault}/>
        </aside>
        <main className="main-content">
          <GraphView graphData={graphData!} onNodeClick={handleNodeDoubleClick} />
        </main>
      </div>
      {/* The Editor is now a modal, rendered on top of everything */}
      <EditorModal />
    </>
  );
};
