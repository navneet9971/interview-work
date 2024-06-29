/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Panel,
  MiniMap,
  Controls,
  Background,
} from "reactflow";
import "reactflow/dist/base.css";

import { toPng } from "html-to-image"; // Import the toPng method

import "../tailwind.config.js";
import Sidebar from "./component/sidebar";
import TextNode from "./component/TextNode";

// Initial node setup
const initialNodes = [
  {
    id: "1",
    type: "textnode",
    data: { label: "Node 1" },
    position: { x: 250, y: 5 },
  },
];

let id = 1; 

// Function for generating unique IDs for nodes
const getId = () => `node_${id++}`;

const App = () => {
  const nodeTypes = useMemo(
    () => ({
      textnode: TextNode,
    }),
    []
  );

  // States and hooks setup
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [selectedElements, setSelectedElements] = useState([]);
  const [nodeName, setNodeName] = useState("");
  const [nodeCount, setNodeCount] = useState(initialNodes.length);

  // Update nodes data when nodeName or selectedElements changes
  useEffect(() => {
    if (selectedElements.length > 0) {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === selectedElements[0]?.id) {
            node.data = {
              ...node.data,
              label: nodeName,
            };
          }
          return node;
        })
      );
    } else {
      setNodeName(""); 
    }
  }, [nodeName, selectedElements, setNodes]);

  //Reset nodes here
  const onResetFlow = () => {
    setNodes(initialNodes);
    setEdges([]);
    setSelectedElements([]);
    setNodeName("");
    setNodeCount(initialNodes.length); 
  };

  // Handle node click
  const onNodeClick = useCallback((event, node) => {
    setSelectedElements([node]);
    setNodeName(node.data.label);
    setNodes((nodes) =>
      nodes.map((n) => ({
        ...n,
        selected: n.id === node.id,
      }))
    );
  }, []);

  // Handle edge connection
  const onConnect = useCallback(
    (params) => {
      console.log("Edge created: ", params);
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  // Enable drop effect on drag over
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop event to add a new node
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `Node ${id}` },
      };

      console.log("Node created: ", newNode);
      setNodes((nds) => nds.concat(newNode));
      setNodeCount((count) => count + 1); 
    },
    [reactFlowInstance]
  );

  const saveImage = useCallback(() => {
    if (reactFlowWrapper.current === null) {
      return;
    }

    toPng(reactFlowWrapper.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = "flowchart.png";
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const rfStyle = {
    backgroundColor: "#ffffff",
  };

  return (
    <div className="flex flex-row min-h-screen lg:flex-row">
      <div className="flex-grow h-screen" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          style={rfStyle}
          onNodeClick={onNodeClick}
          onPaneClick={() => {
            setSelectedElements([]);
            setNodes((nodes) =>
              nodes.map((n) => ({
                ...n,
                selected: false, 
              }))
            );
          }}
          fitView
        >
          <Background variant="lines" gap={12} size={3} />
          <Controls />
          <MiniMap zoomable pannable />
          <Panel>
            <button
              className="m-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={onResetFlow}
            >
              Reset Flow
            </button>
            <button
              className="m-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              onClick={saveImage}
            >
              Save Image
            </button>
          </Panel>
        </ReactFlow>
      </div>

      <Sidebar
        nodeName={nodeName}
        setNodeName={setNodeName}
        selectedNode={selectedElements[0]}
        setSelectedElements={setSelectedElements}
        nodeCount={nodeCount}
        setNodeCount={setNodeCount}
      />
    </div>
  );
};

// Wrap App with ReactFlowProvider
function FlowWithProvider() {
  return (
    <ReactFlowProvider>
      <App />
    </ReactFlowProvider>
  );
}

export default FlowWithProvider;
