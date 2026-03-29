# TaskPro — Modern Project Management Workspace

TaskPro is a high-performance, dark-themed project management application designed for modern teams. It provides a unified workspace for planning, tracking, and shipping projects with a focus on speed, aesthetics, and user experience.

---

## 🚀 Features

- **Dynamic Kanban Board**: Real-time task management with smooth drag-and-drop transitions.
- **Analytics Dashboard**: Visual data representation for project velocity, team performance, and task status.
- **Project Tracking**: Manage multiple projects simultaneously with specific tags and deadlines.
- **Team Collaboration**: Integrated team member roles and workload tracking.
- **Secure Authentication**: Built-in JWT authentication with real-time signup and login validation.
- **Responsive Design**: A premium "Glassmorphism" UI that works across all devices.

## 🛠 Tech Stack

### Frontend
- **HTML5 & CSS3**: Custom design system using CSS variables and modern layout techniques.
- **Vanilla JavaScript**: High-performance interactions without framework overhead.
- **Chart.js**: Powering the analytics and visual data representations.

### Backend
- **Node.js & Express**: Scalable RESTful API architecture.
- **MongoDB & Mongoose**: Flexible NoSQL data modeling for rapid development.
- **JWT & bcryptjs**: Industry-standard security for identity management.
- **CORS & Dotenv**: Environment-specific configurations and secure cross-origin resource sharing.

## 📦 Setting Up TaskPro

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local instance or Atlas)
- Python3 (for static frontend serving)

### 1. Backend Setup
```bash
cd backend
npm install
# Create a .env file with PORT=5001 and your MONGO_URI
npm start
```

### 2. Frontend Setup
```bash
# From the project root
python3 -m http.server 8080
```
Visit `http://localhost:8080` in your browser to get started.

## 🏗 Architecture Overview

TaskPro follows a decoupled client-server architecture:
- **Client**: Static assets served via a light HTTP server, communicating with the backend via REST.
- **Server**: Stateless Node.js API that manages business logic, authentication, and database interactions.
- **Database**: Persistent storage for projects, tasks, activities, and team members.

## 🔮 The Future: AI Integration Roadmap

While TaskPro is built for speed and clarity, the next evolution involves proactive intelligence:
- **Predictive Velocity**: Use historical data to forecast project completion risks.
- **Smart Resource Allocation**: Recommend task assignments based on team skills and workload.
- **Natural Language Querying**: Ask questions about your project status in plain English.
- **Automated Summary Reports**: Generate daily stand-up summaries for the entire team automatically.

---
*Built with ❤️ for modern engineering teams.*
