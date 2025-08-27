import React, { useState } from 'react';

// Define the type for our file/directory nodes
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

  const handleOpenDirectory = async () => {
    const result = await window.electronAPI.openDirectory();
    if (result) {
      setVaultPath(result.path);
      setFileTree(result.tree);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <button onClick={handleOpenDirectory} style={{ marginBottom: '10px' }}>Open Vault</button>
      {vaultPath && <h4 style={{ margin: '0 0 5px 0', wordWrap: 'break-word' }}>{vaultPath}</h4>}
      <div style={{ overflowY: 'auto', flexGrow: 1 }}>
        {fileTree && <FileTree nodes={fileTree} onFileSelect={onFileSelect} />}
      </div>
    </div>
  );
};

export default FileExplorer;
