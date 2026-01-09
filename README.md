# 🕹️ Distributed Real-Time Tic-Tac-Toe
![aws diagram](https://github.com/user-attachments/assets/22847919-318b-4cd5-9dca-94d5a96b0c64)

A real-time, multiplayer Tic-Tac-Toe game developed as part of the **Distributed and Parallel Computing** course.  
The system supports **multiple concurrent game sessions**, built using **Flask-SocketIO**, and deployed on **AWS** using Docker.

---

## 🚀 System Architecture (OOP Design)
![oops diagram](https://github.com/user-attachments/assets/8e69f66a-2da9-482e-a8f9-93c62d35ac05)

The backend is structured using Object-Oriented principles with **ES6 Classes** to ensure **session isolation**, **clean state management**, and **scalability**.

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
- Add **AWS DocumentDB** for persistent game history
- Store player stats, match results, reconnection data
- Enable advanced features like leaderboards

#### **AWS ECR (Advanced)**
- Use Elastic Container Registry for versioned Docker images
- Implement automated CI/CD with GitHub Actions
- Faster deployments by pulling pre-built images

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

See [QUICK_START.md](./QUICK_START.md) for detailed setup instructions.

**Development:**
```bash
# Backend
cd server && npm install && npm run dev

# Frontend (new terminal)
cd client && npm install && npm run dev
```

**Production:**
```bash
docker-compose up --build
```

---
