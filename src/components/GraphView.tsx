import React from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface GraphViewProps {
  graphData: {
    nodes: { id: string; [key: string]: any }[];
    links: { source: string; target: string; [key: string]: any }[];
  };
  onNodeClick: (nodeId: string) => void;
}

const GraphView: React.FC<GraphViewProps> = ({ graphData, onNodeClick }) => {
  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return <div style={{ padding: '20px', color: 'var(--color-text-secondary)' }}>No data to display. Open a vault with linked notes.</div>;
  }

  return (
    <ForceGraph2D
      graphData={graphData}
      nodeLabel="id"
      nodeVal={5} // Node size
      onNodeClick={(node) => onNodeClick(node.id as string)}
      linkDirectionalArrowLength={3.5}
      linkDirectionalArrowRelPos={1}
      linkCurvature={0.1}
      backgroundColor="var(--color-background)"
      linkColor={() => 'rgba(255,255,255,0.2)'}
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.id as string;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'var(--color-text)';
        ctx.fillText(label, node.x || 0, node.y || 0);
      }}
    />
  );
};

export default GraphView;
