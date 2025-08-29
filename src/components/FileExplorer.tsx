import React, { useState, useRef, useEffect } from 'react';

interface FileNode {
  name: string;
  path: string;
  children?: FileNode[];
}

interface FileExplorerProps {
  onFileSelect: (filePath: string) => void;
  onFileDelete: (filePath: string) => void;
}

const FileTree: React.FC<{
  nodes: FileNode[],
  onFileSelect: (filePath: string) => void,
  handleDeleteFile: (filePath: string) => void,
}> = ({ nodes, onFileSelect, handleDeleteFile }) => {
  return (
    <ul style={{ listStyleType: 'none', paddingLeft: '15px', margin: '0' }}>
      {nodes.map(node => (
        <li key={node.path}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
            {node.children ? (
              <span style={{ cursor: 'default', flexGrow: 1 }}>📁 {node.name}</span>
            ) : (
              <span onClick={() => onFileSelect(node.path)} style={{ cursor: 'pointer', flexGrow: 1 }}>
                📄 {node.name}
              </span>
            )}
            {!node.children && (
               <button onClick={(e) => { e.stopPropagation(); handleDeleteFile(node.path); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b6b', padding: '2px 5px', fontWeight: 'bold' }}>
                X
              </button>
            )}
          </div>
          {node.children && (
            <FileTree nodes={node.children} onFileSelect={onFileSelect} handleDeleteFile={handleDeleteFile} />
          )}
        </li>
      ))}
    </ul>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect, onFileDelete }) => {
  const [fileTree, setFileTree] = useState<FileNode[] | null>(null);
  const [vaultPath, setVaultPath] = useState<string>('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteName, setNewNoteName] = useState('');
  const newNoteInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDirectory = async () => {
    const result = await window.electronAPI.openDirectory();
    if (result) {
      setVaultPath(result.path);
      setFileTree(result.tree);
    }
  };

  const handleNewNoteClick = () => {
    if (!vaultPath) {
      alert("Please open a vault first.");
      return;
    }
    setIsCreatingNote(true);
  };

  const handleNewNoteConfirm = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newNoteName.trim() !== '') {
      const result = await window.electronAPI.createFile({ directoryPath: vaultPath, fileName: newNoteName });
      if (result.success) {
        setFileTree(result.newTree);
      } else {
        alert(`Error creating file: ${result.error}`);
      }
      setNewNoteName('');
      setIsCreatingNote(false);
    } else if (e.key === 'Escape') {
      setNewNoteName('');
      setIsCreatingNote(false);
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    // --- Start: Fix for path.basename ---
    // Use simple string manipulation to get the filename, avoiding Node.js 'path' module in renderer.
    const fileName = filePath.split(/[\\/]/).pop() || filePath;
    // --- End: Fix for path.basename ---

    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
      const result = await window.electronAPI.deleteFile({ vaultPath, filePath });
      if (result.success) {
        setFileTree(result.newTree);
        onFileDelete(filePath);
      } else {
        alert(`Error deleting file: ${result.error}`);
      }
    }
  };

  useEffect(() => {
    if (isCreatingNote) {
      newNoteInputRef.current?.focus();
    }
  }, [isCreatingNote]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '10px' }}>
        <button onClick={handleOpenDirectory}>Open Vault</button>
        <button onClick={handleNewNoteClick} style={{ marginLeft: '5px' }}>New Note</button>
      </div>
      {vaultPath && <h4 style={{ margin: '0 0 5px 0', wordWrap: 'break-word', fontSize: '12px' }}>{vaultPath}</h4>}
      <div style={{ overflowY: 'auto', flexGrow: 1 }}>
        {isCreatingNote && (
          <div style={{ paddingLeft: '15px' }}>
            <input
              ref={newNoteInputRef}
              type="text"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              onKeyDown={handleNewNoteConfirm}
              onBlur={() => setIsCreatingNote(false)}
              placeholder="New note name..."
              style={{ width: 'calc(100% - 20px)', boxSizing: 'border-box' }}
            />
          </div>
        )}
        {fileTree && <FileTree nodes={fileTree} onFileSelect={onFileSelect} handleDeleteFile={handleDeleteFile} />}
      </div>
    </div>
  );
};

export default FileExplorer;
