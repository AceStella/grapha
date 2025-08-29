import React, { useState, useRef, useEffect } from 'react';

interface FileNode {
  name: string;
  path: string;
  children?: FileNode[];
}

interface FileExplorerProps {
  onFileSelect: (filePath: string) => void;
}

const FileTree: React.FC<{ nodes: FileNode[], onFileSelect: (filePath: string) => void }> = ({ nodes, onFileSelect }) => {
  return (
    <ul style={{ listStyleType: 'none', paddingLeft: '15px', margin: '0' }}>
      {nodes.map(node => (
        <li key={node.path}>
          {node.children ? (
            <>
              <span style={{ cursor: 'default' }}>📁 {node.name}</span>
              <FileTree nodes={node.children} onFileSelect={onFileSelect} />
            </>
          ) : (
            <span onClick={() => onFileSelect(node.path)} style={{ cursor: 'pointer', display: 'block' }}>
              📄 {node.name}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect }) => {
  const [fileTree, setFileTree] = useState<FileNode[] | null>(null);
  const [vaultPath, setVaultPath] = useState<string>('');
  // --- Start: State for the new note input ---
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteName, setNewNoteName] = useState('');
  const newNoteInputRef = useRef<HTMLInputElement>(null);
  // --- End: State for the new note input ---

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
      // Reset state
      setNewNoteName('');
      setIsCreatingNote(false);
    } else if (e.key === 'Escape') {
      // Reset state on escape
      setNewNoteName('');
      setIsCreatingNote(false);
    }
  };

  // --- Effect to focus the input field when it appears ---
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
        {/* --- Start: Conditionally render the input field --- */}
        {isCreatingNote && (
          <div style={{ paddingLeft: '15px' }}>
            <input
              ref={newNoteInputRef}
              type="text"
              value={newNoteName}
              onChange={(e) => setNewNoteName(e.target.value)}
              onKeyDown={handleNewNoteConfirm}
              onBlur={() => setIsCreatingNote(false)} // Hide on blur
              placeholder="New note name..."
              style={{ width: 'calc(100% - 20px)', boxSizing: 'border-box' }}
            />
          </div>
        )}
        {/* --- End: Conditionally render the input field --- */}
        {fileTree && <FileTree nodes={fileTree} onFileSelect={onFileSelect} />}
      </div>
    </div>
  );
};

export default FileExplorer;
