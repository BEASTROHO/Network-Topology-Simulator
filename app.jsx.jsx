import React, { useState, useEffect, useRef } from 'react';

function App() {
  // State management
  const [components, setComponents] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [connectionMode, setConnectionMode] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [metrics, setMetrics] = useState({
    speed: 0,
    latency: 0,
    packetLoss: 0,
    health: 'Good',
  });
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    type: null,
    id: null,
  });
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [propertiesPanel, setPropertiesPanel] = useState({
    editingId: null,
    newName: '',
  });

  // Refs
  const canvasRef = useRef(null);
  const componentRefs = useRef({});
  const nextId = useRef(1);
  const connectionStart = useRef(null);

  // Component types and colors
  const componentTypes = [
    { id: 'server', name: 'Server', color: '#ef4444' }, // red
    { id: 'switch', name: 'Switch', color: '#3b82f6' }, // blue
    { id: 'router', name: 'Router', color: '#10b981' }, // green
    { id: 'computer', name: 'Computer', color: '#f59e0b' }, // yellow
    { id: 'firewall', name: 'Firewall', color: '#8b5cf6' }, // purple
  ];

  // Connection status types and colors
  const connectionStatuses = {
    active: '#10b981',   // green
    congested: '#f59e0b', // yellow
    inactive: '#ef4444',  // red
  };

  // Component status types and colors
  const componentStatuses = {
    active: '#10b981',
    inactive: '#ef4444',
    degraded: '#f59e0b',
  };

  // Generate unique ID
  const generateUniqueId = (type) => {
    let id;
    do {
      id = `${type}${nextId.current++}`;
    } while (components.some(c => c.id === id));
    return id;
  };

  // Add a new component
  const addComponent = (type) => {
    const newComponent = {
      id: generateUniqueId(type),
      type,
      x: 100,
      y: 100,
      width: 80,
      height: 80,
      status: 'active',
      connections: [],
    };
    
    setComponents(prev => [...prev, newComponent]);
    showNotification('Component added successfully', 'success');
  };

  // Handle component drag start
  const handleComponentDragStart = (e, component) => {
    e.dataTransfer.setData('componentId', component.id);
  };

  // Handle canvas drop
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const componentId = e.dataTransfer.getData('componentId');
    if (!componentId) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setComponents(prev => 
      prev.map(c => 
        c.id === componentId ? { ...c, x, y } : c
      )
    );
  };

  // Handle drag over canvas
  const handleCanvasDragOver = (e) => {
    e.preventDefault();
  };

  // Handle component click
  const handleComponentClick = (component) => {
    setSelectedComponent(component.id);
    setSelectedConnection(null);
    setPropertiesPanel({
      editingId: null,
      newName: '',
    });
  };

  // Handle component double click (rename)
  const handleComponentDoubleClick = (component) => {
    setPropertiesPanel({
      editingId: component.id,
      newName: component.id,
    });
  };

  // Handle component right click (context menu)
  const handleComponentRightClick = (e, component) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'component',
      id: component.id,
    });
  };

  // Handle connection right click (context menu)
  const handleConnectionRightClick = (e, connection) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      type: 'connection',
      id: connection.id,
    });
  };

  // Handle canvas right click (close context menu)
  const handleCanvasRightClick = (e) => {
    e.preventDefault();
    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
  };

  // Handle canvas click (deselect)
  const handleCanvasClick = () => {
    setSelectedComponent(null);
    setSelectedConnection(null);
    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
  };

  // Handle rename action
  const handleRename = (id, newName) => {
    if (!newName || newName.trim() === '') {
      showNotification('Component ID cannot be empty', 'error');
      return;
    }
    
    if (components.some(c => c.id === newName && c.id !== id)) {
      showNotification('Component ID must be unique', 'error');
      return;
    }

    setComponents(prev => 
      prev.map(c => c.id === id ? { ...c, id: newName } : c)
    );
    
    setConnections(prev => 
      prev.map(conn => {
        if (conn.from === id) return { ...conn, from: newName };
        if (conn.to === id) return { ...conn, to: newName };
        return conn;
      })
    );

    setPropertiesPanel({
      editingId: null,
      newName: '',
    });
    
    showNotification('Component renamed successfully', 'success');
  };

  // Handle delete component
  const handleDeleteComponent = (id) => {
    const connectionsToRemove = connections.filter(
      conn => conn.from === id || conn.to === id
    );
    
    setConnections(prev => 
      prev.filter(conn => !connectionsToRemove.includes(conn))
    );
    
    setComponents(prev => prev.filter(c => c.id !== id));
    
    setSelectedComponent(null);
    setSelectedConnection(null);
    
    showNotification('Component deleted successfully', 'success');
  };

  // Handle delete connection
  const handleDeleteConnection = (id) => {
    setConnections(prev => prev.filter(conn => conn.id !== id));
    setSelectedConnection(null);
    showNotification('Connection deleted successfully', 'success');
  };

  // Handle connect button click
  const handleConnectMode = () => {
    if (selectedComponent) {
      setConnectionMode(selectedComponent);
    } else {
      setConnectionMode(true);
    }
  };

  // Handle connection creation
  const handleCanvasClickForConnection = (e) => {
    if (!connectionMode) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedComponent = components.find(c => 
      x >= c.x && x <= c.x + c.width &&
      y >= c.y && y <= c.y + c.height
    );

    if (!clickedComponent) return;

    if (typeof connectionMode === 'string') {
      const fromId = connectionMode;
      const toId = clickedComponent.id;

      if (fromId === toId) {
        showNotification('Cannot connect a component to itself', 'error');
        setConnectionMode(false);
        return;
      }

      if (connections.some(conn => 
        (conn.from === fromId && conn.to === toId) || 
        (conn.from === toId && conn.to === fromId)
      )) {
        showNotification('Connection already exists', 'warning');
        setConnectionMode(false);
        return;
      }

      const newConnection = {
        id: `conn${Date.now()}`,
        from: fromId,
        to: toId,
        status: 'active',
      };

      setConnections(prev => [...prev, newConnection]);
      setConnectionMode(false);
      showNotification('Connection created successfully', 'success');

      setComponents(prev => 
        prev.map(c => {
          if (c.id === fromId) {
            return { ...c, connections: [...c.connections, newConnection.id] };
          }
          if (c.id === toId) {
            return { ...c, connections: [...c.connections, newConnection.id] };
          }
          return c;
        })
      );
    } else {
      setConnectionMode(clickedComponent.id);
    }
  };

  // Handle connection click
  const handleConnectionClick = (connection) => {
    setSelectedConnection(connection.id);
    setSelectedComponent(null);
  };

  // Handle edit connection status
  const handleEditConnectionStatus = (id, status) => {
    setConnections(prev => 
      prev.map(conn => conn.id === id ? { ...conn, status } : conn)
    );
    showNotification(`Connection status updated to ${status}`, 'success');
  };

  // Handle simulation start/stop
  const toggleSimulation = () => {
    if (components.length < 2) {
      showNotification('At least two components are required for simulation', 'error');
      return;
    }
    
    setSimulating(!simulating);
    
    if (!simulating) {
      setMetrics({
        speed: Math.floor(Math.random() * 100) + 50,
        latency: Math.floor(Math.random() * 50) + 10,
        packetLoss: Math.floor(Math.random() * 5),
        health: 'Good',
      });
    }
  };

  // Simulate metrics update
  useEffect(() => {
    if (!simulating) return;

    const interval = setInterval(() => {
      setMetrics(prev => {
        const newSpeed = Math.max(10, Math.min(prev.speed + (Math.random() * 10 - 5), 200));
        const newLatency = Math.max(10, Math.min(prev.latency + (Math.random() * 2 - 1), 100));
        const newPacketLoss = Math.max(0, Math.min(prev.packetLoss + (Math.random() * 0.5 - 0.25), 10));
        
        let newHealth = 'Good';
        if (newPacketLoss > 5 || newLatency > 50) {
          newHealth = 'Fair';
        }
        if (newPacketLoss > 8 || newLatency > 80) {
          newHealth = 'Degraded';
        }
        
        return {
          speed: Math.round(newSpeed * 10) / 10,
          latency: Math.round(newLatency * 10) / 10,
          packetLoss: Math.round(newPacketLoss * 10) / 10,
          health: newHealth,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [simulating]);

  // Handle save topology
  const saveTopology = () => {
    try {
      const topology = {
        components,
        connections,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem('networkTopology', JSON.stringify(topology));
      showNotification('Topology saved successfully', 'success');
    } catch (error) {
      console.error('Error saving topology:', error);
      showNotification('Failed to save topology', 'error');
    }
  };

  // Handle load topology
  const loadTopology = () => {
    try {
      const saved = localStorage.getItem('networkTopology');
      if (!saved) {
        showNotification('No saved topology found', 'warning');
        return;
      }
      
      const topology = JSON.parse(saved);
      setComponents(topology.components);
      setConnections(topology.connections);
      showNotification('Topology loaded successfully', 'success');
    } catch (error) {
      console.error('Error loading topology:', error);
      showNotification('Failed to load topology', 'error');
    }
  };

  // Handle predefined scenarios
  const loadScenario = (scenario) => {
    let newComponents = [];
    let newConnections = [];
    
    switch(scenario) {
      case 'LAN':
        newComponents = [
          { id: 'router1', type: 'router', x: 400, y: 200, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'pc1', type: 'computer', x: 200, y: 150, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'pc2', type: 'computer', x: 200, y: 250, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'server1', type: 'server', x: 600, y: 200, width: 80, height: 80, status: 'active', connections: [] },
        ];
        newConnections = [
          { id: 'conn1', from: 'router1', to: 'pc1', status: 'active' },
          { id: 'conn2', from: 'router1', to: 'pc2', status: 'active' },
          { id: 'conn3', from: 'router1', to: 'server1', status: 'active' },
        ];
        break;
        
      case 'WAN':
        newComponents = [
          { id: 'router1', type: 'router', x: 300, y: 200, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'router2', type: 'router', x: 500, y: 200, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'pc1', type: 'computer', x: 150, y: 150, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'pc2', type: 'computer', x: 650, y: 150, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'server1', type: 'server', x: 150, y: 250, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'server2', type: 'server', x: 650, y: 250, width: 80, height: 80, status: 'active', connections: [] },
        ];
        newConnections = [
          { id: 'conn1', from: 'router1', to: 'pc1', status: 'active' },
          { id: 'conn2', from: 'router1', to: 'server1', status: 'active' },
          { id: 'conn3', from: 'router1', to: 'router2', status: 'active' },
          { id: 'conn4', from: 'router2', to: 'pc2', status: 'active' },
          { id: 'conn5', from: 'router2', to: 'server2', status: 'active' },
        ];
        break;
        
      case 'DataCenter':
        newComponents = [
          { id: 'switch1', type: 'switch', x: 300, y: 150, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'switch2', type: 'switch', x: 300, y: 250, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'router1', type: 'router', x: 150, y: 200, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'firewall1', type: 'firewall', x: 450, y: 200, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'server1', type: 'server', x: 600, y: 150, width: 80, height: 80, status: 'active', connections: [] },
          { id: 'server2', type: 'server', x: 600, y: 250, width: 80, height: 80, status: 'active', connections: [] },
        ];
        newConnections = [
          { id: 'conn1', from: 'switch1', to: 'switch2', status: 'active' },
          { id: 'conn2', from: 'switch1', to: 'router1', status: 'active' },
          { id: 'conn3', from: 'switch1', to: 'firewall1', status: 'active' },
          { id: 'conn4', from: 'firewall1', to: 'server1', status: 'active' },
          { id: 'conn5', from: 'firewall1', to: 'server2', status: 'active' },
        ];
        break;
        
      default:
        return;
    }
    
    setComponents(newComponents);
    setConnections(newConnections);
    showNotification(`Loaded ${scenario} scenario`, 'success');
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedComponent || selectedConnection)) {
        e.preventDefault();
        if (selectedComponent) {
          handleDeleteComponent(selectedComponent);
        } else if (selectedConnection) {
          handleDeleteConnection(selectedConnection);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, selectedConnection]);

  // Show toast notification
  const showNotification = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'info' });
    }, 3000);
  };

  // SVG Icons for components
  const icons = {
    server: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="3" y="5" width="18" height="10" rx="2" ry="2" className="fill-current" />
        <line x1="3" y1="10" x2="21" y2="10" className="stroke-current stroke-1" />
        <line x1="3" y1="15" x2="21" y2="15" className="stroke-current stroke-1" />
        <rect x="2" y="2" width="20" height="2" rx="1" ry="1" className="fill-current" />
        <rect x="2" y="17" width="20" height="2" rx="1" ry="1" className="fill-current" />
      </svg>
    ),
    switch: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="4" y="5" width="16" height="12" rx="2" ry="2" className="fill-current" />
        <circle cx="8" cy="9" r="1" className="fill-current" />
        <circle cx="12" cy="9" r="1" className="fill-current" />
        <circle cx="16" cy="9" r="1" className="fill-current" />
        <circle cx="8" cy="13" r="1" className="fill-current" />
        <circle cx="12" cy="13" r="1" className="fill-current" />
        <circle cx="16" cy="13" r="1" className="fill-current" />
        <line x1="8" y1="17" x2="8" y2="19" className="stroke-current stroke-1" />
        <line x1="12" y1="17" x2="12" y2="19" className="stroke-current stroke-1" />
        <line x1="16" y1="17" x2="16" y2="19" className="stroke-current stroke-1" />
      </svg>
    ),
    router: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="5" y="5" width="14" height="10" rx="2" ry="2" className="fill-current" />
        <circle cx="12" cy="8" r="1" className="fill-current" />
        <circle cx="12" cy="12" r="1" className="fill-current" />
        <path d="M6 17L6 19" className="stroke-current stroke-1" />
        <path d="M18 17L18 19" className="stroke-current stroke-1" />
        <circle cx="6" cy="18" r="1" className="fill-current" />
        <circle cx="18" cy="18" r="1" className="fill-current" />
      </svg>
    ),
    computer: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <rect x="3" y="3" width="18" height="12" rx="2" ry="2" className="fill-current" />
        <rect x="7" y="16" width="10" height="3" rx="1" ry="1" className="fill-current" />
        <rect x="10" y="19" width="4" height="1" rx="0.5" ry="0.5" className="fill-current" />
      </svg>
    ),
    firewall: (
      <svg viewBox="0 0 24 24" className="w-full h-full">
        <path d="M3 12L7 3L17 3L21 12L17 21L7 21L3 12Z" className="fill-current" />
        <path d="M10 8L14 16" className="stroke-current stroke-1" />
        <path d="M14 8L10 16" className="stroke-current stroke-1" />
        <path d="M7 12L10 15" className="stroke-current stroke-1" />
        <path d="M17 12L14 15" className="stroke-current stroke-1" />
      </svg>
    ),
  };

  // Draw connections between components
  const drawConnections = () => {
    return connections.map(conn => {
      const fromComponent = components.find(c => c.id === conn.from);
      const toComponent = components.find(c => c.id === conn.to);
      
      if (!fromComponent || !toComponent) return null;
      
      const fromX = fromComponent.x + fromComponent.width / 2;
      const fromY = fromComponent.y + fromComponent.height / 2;
      const toX = toComponent.x + toComponent.width / 2;
      const toY = toComponent.y + toComponent.height / 2;
      
      const angle = Math.atan2(toY - fromY, toX - fromX);
      
      const arrowLength = 10;
      const arrowWidth = 4;
      
      const x1 = toX - arrowLength * Math.cos(angle);
      const y1 = toY - arrowLength * Math.sin(angle);
      const x2 = x1 + arrowWidth * Math.sin(angle);
      const y2 = y1 - arrowWidth * Math.cos(angle);
      const x3 = x1 - arrowWidth * Math.sin(angle);
      const y3 = y1 + arrowWidth * Math.cos(angle);
      
      return (
        <g key={conn.id}>
          <line
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            stroke={connectionStatuses[conn.status]}
            strokeWidth="2"
            className="cursor-pointer"
            onClick={() => handleConnectionClick(conn)}
            onContextMenu={(e) => handleConnectionRightClick(e, conn)}
          />
          
          <polygon
            points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
            fill={connectionStatuses[conn.status]}
          />
          
          {simulating && (
            <circle
              cx={fromX}
              cy={fromY}
              r="3"
              fill={connectionStatuses[conn.status]}
              style={{
                animation: `dataFlow ${Math.max(2, 10 - conn.status === 'congested' ? 5 : 0)}s linear infinite`,
              }}
            />
          )}
        </g>
      );
    });
  };

  // Properties panel content
  const renderPropertiesPanel = () => {
    if (propertiesPanel.editingId) {
      return (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Rename Component</h3>
          <input
            type="text"
            value={propertiesPanel.newName}
            onChange={(e) => setPropertiesPanel({
              ...propertiesPanel,
              newName: e.target.value
            })}
            className="w-full p-2 border rounded mb-2"
            placeholder="Enter new ID"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleRename(propertiesPanel.editingId, propertiesPanel.newName)}
              className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => setPropertiesPanel({
                editingId: null,
                newName: '',
              })}
              className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    if (selectedComponent) {
      const component = components.find(c => c.id === selectedComponent);
      if (!component) return null;
      
      return (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Component Properties</h3>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">ID:</label>
            <span className="block p-2 bg-gray-100 rounded">{component.id}</span>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Type:</label>
            <span className="block p-2 bg-gray-100 rounded">
              {componentTypes.find(t => t.id === component.type)?.name}
            </span>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Status:</label>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: componentStatuses[component.status] }}
              ></div>
              <span className="capitalize">{component.status}</span>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => setPropertiesPanel({
                editingId: component.id,
                newName: component.id,
              })}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Rename
            </button>
          </div>
        </div>
      );
    }

    if (selectedConnection) {
      const connection = connections.find(c => c.id === selectedConnection);
      if (!connection) return null;
      
      return (
        <div className="p-4">
          <h3 className="text-lg font-bold mb-2">Connection Properties</h3>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">From:</label>
            <span className="block p-2 bg-gray-100 rounded">{connection.from}</span>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">To:</label>
            <span className="block p-2 bg-gray-100 rounded">{connection.to}</span>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Status:</label>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: connectionStatuses[connection.status] }}
              ></div>
              <span className="capitalize">{connection.status}</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleEditConnectionStatus(connection.id, 'active')}
              className="bg-green-500 text-white py-2 rounded hover:bg-green-600 transition-colors"
            >
              Active
            </button>
            <button
              onClick={() => handleEditConnectionStatus(connection.id, 'congested')}
              className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition-colors"
            >
              Congested
            </button>
            <button
              onClick={() => handleEditConnectionStatus(connection.id, 'inactive')}
              className="bg-red-500 text-white py-2 rounded hover:bg-red-600 transition-colors"
            >
              Inactive
            </button>
            <button
              onClick={() => handleDeleteConnection(connection.id)}
              className="bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 text-center">
        <h3 className="text-lg font-bold mb-2">Select an item</h3>
        <p className="text-gray-600">
          Click on a component or connection to view its properties.
        </p>
      </div>
    );
  };

  // Empty state SVG
  const EmptyStateSVG = () => (
    <svg viewBox="0 0 200 200" className="w-40 h-40 mx-auto my-8">
      <rect x="40" y="40" width="120" height="120" rx="10" ry="10" fill="#e5e7eb" />
      <path d="M60 60L140 140" stroke="#9ca3af" strokeWidth="2" />
      <path d="M60 140L140 60" stroke="#9ca3af" strokeWidth="2" />
    </svg>
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-lg">
        <h1 className="text-2xl font-bold">Network Topology Simulator</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Component Palette */}
        <div className="w-64 bg-gray-100 p-4 border-r border-gray-300 overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Components</h2>
          <div className="grid grid-cols-2 gap-4">
            {componentTypes.map(type => (
              <button
                key={type.id}
                className="p-3 rounded-lg border border-gray-300 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
                draggable
                onDragStart={(e) => handleComponentDragStart(e, { id: type.id })}
              >
                <div 
                  className="w-10 h-10 mb-2" 
                  style={{ color: type.color }}
                >
                  {icons[type.id]}
                </div>
                <span className="text-sm capitalize">{type.name}</span>
              </button>
            ))}
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-semibold mb-2">Predefined Scenarios</h3>
            <div className="space-y-2">
              <button
                onClick={() => loadScenario('LAN')}
                className="w-full text-left p-2 rounded hover:bg-gray-200 transition-colors"
              >
                LAN (Local Area Network)
              </button>
              <button
                onClick={() => loadScenario('WAN')}
                className="w-full text-left p-2 rounded hover:bg-gray-200 transition-colors"
              >
                WAN (Wide Area Network)
              </button>
              <button
                onClick={() => loadScenario('DataCenter')}
                className="w-full text-left p-2 rounded hover:bg-gray-200 transition-colors"
              >
                Data Center
              </button>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-300">
            <button
              onClick={saveTopology}
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Save Topology
            </button>
            <button
              onClick={loadTopology}
              className="w-full bg-green-500 text-white py-2 rounded mt-2 hover:bg-green-600 transition-colors"
            >
              Load Topology
            </button>
          </div>
        </div>

        {/* Center Canvas */}
        <div 
          className="flex-1 relative overflow-auto bg-gray-200"
          ref={canvasRef}
          onDrop={handleCanvasDrop}
          onDragOver={handleCanvasDragOver}
          onClick={handleCanvasClickForConnection}
          onContextMenu={handleCanvasRightClick}
        >
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {drawConnections()}
          </svg>
          
          {/* Components */}
          {components.map(component => {
            const typeInfo = componentTypes.find(t => t.id === component.type);
            
            return (
              <div
                key={component.id}
                ref={el => componentRefs.current[component.id] = el}
                className={`absolute border-2 rounded shadow-md cursor-move ${
                  selectedComponent === component.id ? 'ring-2 ring-blue-500 z-10' : ''
                }`}
                style={{
                  left: `${component.x}px`,
                  top: `${component.y}px`,
                  width: `${component.width}px`,
                  height: `${component.height}px`,
                  borderColor: typeInfo.color,
                  backgroundColor: '#ffffff',
                }}
                draggable
                onDragStart={(e) => handleComponentDragStart(e, component)}
                onClick={() => handleComponentClick(component)}
                onDoubleClick={() => handleComponentDoubleClick(component)}
                onContextMenu={(e) => handleComponentRightClick(e, component)}
              >
                <div className="p-2 h-full flex flex-col items-center justify-center">
                  <div 
                    className="w-8 h-8 mb-1" 
                    style={{ color: typeInfo.color }}
                  >
                    {icons[component.type]}
                  </div>
                  <div className="text-center text-xs font-medium">
                    {component.id}
                  </div>
                  <div className="mt-1 flex items-center">
                    <div 
                      className="w-2 h-2 rounded-full mr-1" 
                      style={{ backgroundColor: componentStatuses[component.status] }}
                    ></div>
                    <span className="text-xs capitalize">
                      {component.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Empty state */}
          {components.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <EmptyStateSVG />
              <p className="text-lg font-medium">No components added yet</p>
              <p className="text-sm">Drag components from the left panel to start building your network</p>
            </div>
          )}
          
          {/* Connection mode indicator */}
          {connectionMode && (
            <div className="absolute bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg animate-pulse">
              Click on a component to complete the connection
            </div>
          )}
        </div>

        {/* Right Panel - Properties and Simulation Controls */}
        <div className="w-80 bg-white p-4 border-l border-gray-300 flex flex-col">
          {/* Properties Panel */}
          <div className="flex-1 overflow-y-auto border-b border-gray-300 pb-4">
            {renderPropertiesPanel()}
          </div>
          
          {/* Simulation Controls */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Simulation Controls</h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Network Health:</span>
                <span className={`font-bold ${
                  metrics.health === 'Good' ? 'text-green-600' : 
                  metrics.health === 'Fair' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metrics.health}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${
                    metrics.health === 'Good' ? 'bg-green-500' : 
                    metrics.health === 'Fair' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.health === 'Good' ? '100%' : metrics.health === 'Fair' ? '60%' : '30%'}` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-sm text-gray-600">Speed</div>
                <div className="text-lg font-bold">{metrics.speed} Mbps</div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-sm text-gray-600">Latency</div>
                <div className="text-lg font-bold">{metrics.latency} ms</div>
              </div>
              <div className="bg-gray-100 p-2 rounded text-center">
                <div className="text-sm text-gray-600">Packet Loss</div>
                <div className="text-lg font-bold">{metrics.packetLoss}%</div>
              </div>
            </div>
            
            <button
              onClick={toggleSimulation}
              className={`w-full py-2 rounded font-bold ${
                simulating 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              } transition-colors`}
            >
              {simulating ? 'Stop Simulation' : 'Start Simulation'}
            </button>
          </div>
        </div>
        
        {/* Context Menu */}
        {contextMenu.visible && (
          <div
            className="absolute bg-white border rounded shadow-lg z-50"
            style={{ top: contextMenu.y, left: contextMenu.x }}
          >
            {contextMenu.type === 'component' && (
              <ul>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    handleConnectMode();
                    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
                  }}
                >
                  Connect
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    setPropertiesPanel({
                      editingId: contextMenu.id,
                      newName: contextMenu.id,
                    });
                    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
                  }}
                >
                  Rename
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    handleDeleteComponent(contextMenu.id);
                    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
                  }}
                >
                  Delete
                </li>
              </ul>
            )}
            
            {contextMenu.type === 'connection' && (
              <ul>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    handleEditConnectionStatus(contextMenu.id, 'active');
                    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
                  }}
                >
                  Set Status: Active
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    handleEditConnectionStatus(contextMenu.id, 'congested');
                    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
                  }}
                >
                  Set Status: Congested
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    handleEditConnectionStatus(contextMenu.id, 'inactive');
                    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
                  }}
                >
                  Set Status: Inactive
                </li>
                <li
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  onClick={() => {
                    handleDeleteConnection(contextMenu.id);
                    setContextMenu({ visible: false, x: 0, y: 0, type: null, id: null });
                  }}
                >
                  Delete
                </li>
              </ul>
            )}
          </div>
        )}
        
        {/* Toast Notification */}
        {toast.visible && (
          <div
            className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              toast.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
            } text-white animate-fade-in-down`}
          >
            {toast.message}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 p-2 text-center text-sm text-gray-600 border-t border-gray-300">
        Network Topology Simulator v1.0 | Created with React
      </footer>
      
      {/* CSS for animations and styles */}
      <style jsx>{`
        @keyframes dataFlow {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { 
            transform: translate(${Math.random() * 200}px, ${Math.random() * 100}px); 
            opacity: 0;
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.5s ease-out forwards;
        }
        
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default App;