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
      nodeVal={10} // Slightly larger node for the circle
      onNodeClick={(node) => onNodeClick(node.id as string)}
      linkDirectionalArrowLength={4}
      linkDirectionalArrowRelPos={1}
      linkCurvature={0.15}
      // Link color for light background
      linkColor={() => 'rgba(150, 150, 150, 0.5)'} 
      // Background color changed to white
      backgroundColor="#ffffff" 
      nodeCanvasObject={(node, ctx, globalScale) => {
        const label = node.id as string;
        const fontSize = 14 / globalScale;
        ctx.font = `${fontSize}px Sans-Serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Draw a circle (node "box")
        const r = 8; // Radius of the circle
        ctx.beginPath();
        ctx.arc(node.x || 0, node.y || 0, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = '#f0f0f0'; // Light grey fill for the node background
        ctx.fill();
        ctx.strokeStyle = '#333333'; // Darker grey stroke for the border
        ctx.lineWidth = 1 / globalScale; // Make border thin
        ctx.stroke();

        // Draw the text (node label)
        ctx.fillStyle = '#333333'; // Dark text color for white background
        ctx.fillText(label, node.x || 0, node.y || 0);
      }}
    />
  );
};

export default GraphView;
