# 🕹️ Distributed Real-Time Tic-Tac-Toe

A real-time, multiplayer Tic-Tac-Toe game developed as part of the **Distributed and Parallel Computing** course.  
The system supports **multiple concurrent game sessions**, built using **Node.js + Express + Socket.IO**, and deployed on **AWS EC2** using Docker.

---

## 🚀 System Architecture

The application uses Object-Oriented principles with **ES6 Classes** for the backend to ensure **session isolation**, **clean state management**, and **scalability**.

### **Core Components**

#### **1. Server (Express + Socket.IO)**
- Central controller built with **Express.js** and **Socket.IO**
- Maintains:
  - `activeGamingRooms` – array of all active GameRoom instances
  - `connectedToPortalUsers` – array of all connected Player instances
- Handles core socket events: **connect**, **disconnect**, **check-game-room**, **turn**, **startGame**

#### **2. GameRoom Class (1:N)**
- Represents a single active match
- Enforces **2-player limit** per room
- Methods:
  - `addPlayer()` - Add player to room
  - `getRandomActivePlayer()` - Randomly select starting player
  - `getSwapPlayer()` - Alternate turns
  - `roomAvailable()` - Check if room has space
- Ensures each game instance is fully isolated

#### **3. Player Class (1:2)**
- Represents a connected user
- Properties:
  - `id` - Unique Socket ID
  - `name` - Player username
  - `gameMark` - Assigned mark (**X** or **O**)
  - `gameStartIntention` - Ready to start flag
- Methods:
  - `setUserName()`, `setGameMark()`, `setStartGameIntention()`

#### **4. React Frontend (SPA)**
- Built with **React 18** and **Vite**
- Component hierarchy:
  - `App` → `SocketProvider` → `Greetings` / `Lobby` / `GameBoard`
- **Socket Context** provides real-time communication across components
- Game logic: Turn validation, win detection via `checkWinner()`

---

## ☁️ Cloud Infrastructure (AWS Deployment)

The game is deployed on **AWS EC2** using **Docker** for containerization and portability.

### **Deployment Architecture**

#### **AWS EC2 Instance**
- **Instance Type:** t2.micro or t3.micro
- Runs **Amazon Linux 2023**
- Hosts **Docker** and **Docker Compose**
- Pulls code directly from **GitHub repository**
- Builds and runs the containerized application

#### **Game Server Container**
- Multi-stage Docker build:
  1. **Stage 1:** Build React frontend (Vite)
  2. **Stage 2:** Copy build + run Node.js server
- Runs on port **5000** (configurable)
- Serves both API and static React files in production
- Maintains **in-memory state** for all active game sessions

### **Security Configuration**

#### **Security Group Rules**
- Port 22 (SSH): Restricted to your IP for secure access
- Port 5000 (App): Open to 0.0.0.0/0 for public access
- Port 80 (Optional): For future Nginx reverse proxy

### **Optional Enhancements**

#### **MongoDB Integration**
- Add **AWS DocumentDB** or **MongoDB Atlas** for persistent game history
- Store player stats, match results, reconnection data
- Enable advanced features like leaderboards

---

## 🛠️ Tech Stack

- **Backend:** Node.js 18+, Express, Socket.IO
- **Frontend:** React 18, Vite
- **Real-time:** Socket.IO (native WebSocket support)
- **Deployment:** Docker, AWS EC2
- **Version Control:** GitHub
- **Package Manager:** npm

---

## 🚀 Quick Start

**Development:**
```bash
# Backend
cd server && npm install && npm run dev

# Frontend (new terminal)
cd client && npm install && npm run dev
```

**Production (Docker):**
```bash
docker build -t tic-tac-toe-app .
docker run -d -p 5000:5000 -e NODE_ENV=production --name tic-tac-toe-app tic-tac-toe-app
```

Access the game at `http://localhost:5000` (development: React at `http://localhost:5173`)

---

## 🌐 AWS EC2 Deployment

### **Prerequisites**
- AWS account with EC2 access
- EC2 instance (t2.micro) running Amazon Linux 2023
- Security group with ports 22 (SSH) and 5000 (app) open

### **Deployment Steps**

1. **Connect to EC2:**
```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

2. **Install Docker:**
```bash
sudo yum update -y
sudo yum install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user
```

3. **Clone and Build:**
```bash
git clone https://github.com/yourusername/tic-tac-toe.git
cd tic-tac-toe
docker build -t tic-tac-toe-app .
```

4. **Run Container:**
```bash
docker run -d -p 5000:5000 -e NODE_ENV=production -e SESSION_SECRET=your-secret --name tic-tac-toe-app --restart always tic-tac-toe-app
```

Access your game at `http://your-ec2-ip:5000`

---

## 🎮 Features

- Real-time multiplayer gameplay using WebSocket
- Multiple concurrent game rooms
- Player lobby with room creation
- Turn-based validation
- Win/draw detection
- Session management
- Responsive React UI

---

## 🚀 Future Enhancements

- **Persistent Storage:** Integrate MongoDB for game history and player stats
- **Authentication:** Add user login system with OAuth
- **Leaderboards:** Track wins/losses across all players
- **Reconnection:** Allow players to rejoin after disconnection
- **Mobile App:** Build native iOS/Android apps
- **AI Opponent:** Add single-player mode with bot
- **Custom Game Modes:** Larger boards (5x5, 4x4), time limits

---
