
---


# 🖧 Network Topology Simulator

An interactive React-based simulator for designing and analyzing computer network topologies. Ideal for students, educators, and professionals to visualize, simulate, and test network configurations in real time.

---

## 🚀 Features

- **Drag-and-Drop Interface**  
  Easily add and position components like routers, switches, servers, computers, and firewalls.

- **Component Palette**  
  Includes five essential network devices with realistic SVG icons:
  - Server
  - Switch
  - Router
  - Computer
  - Firewall

- **Connection System**  
  Create connections via:
  - Right-click → Connect
  - Sequential double-clicks
  - Dedicated "Connect" button  
  Connections show directional flow with arrowheads.

- **Simulation Engine**  
  Real-time metrics:
  - Speed (Mbps)
  - Latency (ms)
  - Packet Loss (%)
  - Network Health (Good, Fair, Degraded)  
  Animated data flow visualizes traffic across connections.

- **Component Management**  
  - Rename components via double-click
  - Status indicators (active, inactive, degraded)
  - Context menus for connect, rename, delete

- **Persistence & Scenarios**  
  - Save/load topologies via `localStorage`
  - Predefined setups:
    - LAN
    - WAN
    - Data Center

---

## 📦 Installation

```bash
git clone https://github.com/BEASTROHO/Network-Topology-Simulator.git
cd Network-Topology-Simulator
npm install
npm start
```

---

## 📁 Folder Structure

```
Network-Topology-Simulator/
├── public/
├── src/
│   └── App.jsx
├── test/
├── docs/
├── README.md
├── LICENSE
└── package.json
```

---

## 🎓 Educational Use

- Learn network fundamentals visually
- Experiment with topologies without hardware
- Understand device interactions and performance

## 🧠 Professional Use

- Sketch network designs
- Simulate performance before deployment
- Demonstrate concepts to clients or teams

---

## 🔮 Future Enhancements

- Export diagrams as images/PDFs
- Advanced bandwidth analysis
- More device types (e.g., access points)
- Collaboration features
- Import/export standard formats

---

## ✨ Author

**Rohit M**  
Passionate about networking, embedded systems, and simulation tools.  


