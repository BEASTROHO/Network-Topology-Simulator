# 🖧 Network Topology Simulator - Project Overview

## 📘 Introduction
The Network Topology Simulator is an interactive web application built with React. It enables users to design, visualize, and simulate computer network configurations with real-time performance metrics and animated data flow.

---

## 🔑 Key Features

### 1. Interactive Component Palette
Includes five essential network devices:
- **Server**: Data storage and processing
- **Switch**: LAN device for interconnectivity
- **Router**: Packet forwarding across networks
- **Computer**: End-user device
- **Firewall**: Traffic monitoring and control

### 2. Drag-and-Drop Interface
- Drag components from palette to canvas
- Position and arrange freely
- Build custom network layouts

### 3. Connection System
- Connect via button, right-click, or double-click
- Visual arrowheads show data flow direction
- Prevents duplicate or self-connections

### 4. Component Management
- Rename via double-click
- Status indicators: active, inactive, degraded
- Context menu: connect, rename, delete
- Color-coded by device type

### 5. Simulation Engine
- Real-time metrics:
  - Speed (Mbps)
  - Latency (ms)
  - Packet Loss (%)
  - Health: Good / Fair / Degraded
- Animated data flow across connections

### 6. Persistence & Scenarios
- Save/load topologies via `localStorage`
- Predefined setups:
  - **LAN**: Router + PCs + Server
  - **WAN**: Multi-location routers and endpoints
  - **Data Center**: Switches, firewall, servers

---

## 🧠 Educational & Practical Applications

### For Students
- Learn network fundamentals
- Visualize device interactions
- Simulate performance without hardware

### For Professionals
- Sketch network designs
- Test configurations before deployment
- Demonstrate concepts to clients or teams

---

## 🔮 Future Enhancements
- Export diagrams as images/PDFs
- Bandwidth and congestion modeling
- More device types (e.g., access points)
- Team collaboration features
- Import/export standard formats

---

## 🛠 Technical Stack
- **Framework**: React
- **State Management**: React Hooks
- **Storage**: localStorage
- **UI**: Custom CSS + SVG icons
- **Architecture**: Single component with modular logic

---

## ✨ Author
**Rohit M**  
Passionate about networking, embedded systems, and simulation tools.  
Explore more at [Haveloc](https://app.haveloc.com/jobs/6005-79cc2fae-ad56-490d-a28d-4e187b35a760/b40a0a9e-47b8-4778-949a-08fb6254ca37)

