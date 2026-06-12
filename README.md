<div align="center">
  
# 🎙️ NexusAI: Intelligent Meeting-to-Tasks Converter

An enterprise-grade, full-stack AI application that effortlessly converts audio, video, and text meetings into highly accurate, natively translated transcripts, professional summaries, and actionable task lists.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Backend-green?style=flat&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb)](https://www.mongodb.com/)
[![Groq](https://img.shields.io/badge/Groq-AI_Engine-f55036?style=flat)](https://groq.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Whisper-412991?style=flat&logo=openai)](https://openai.com/)

</div>

## 🚀 Overview

**NexusAI** is a premium web platform designed to streamline productivity by completely automating post-meeting workflows. By leveraging state-of-the-art AI models (Whisper-Large-v3 and Llama-3.3), the system processes uploaded meetings, automatically detects the spoken language (English, Urdu, Spanish, Punjabi, etc.), and generates native-language transcripts along with intelligent, priority-sorted action items.

The architecture strictly separates the frontend client from the background AI processing engine to guarantee high performance, smooth UI rendering, and asynchronous heavy-lifting.

## ✨ Features

- **Multi-Modal Uploads**: Seamlessly upload `.mp4` video files, `.mp3`/`.wav` audio files, or plain text meeting notes.
- **Auto-Language Detection**: The AI natively identifies the spoken language and transcribes it directly in that exact language with near 100% accuracy.
- **Smart Provider Auto-Routing**: Paste your API key in settings, and the backend intelligently auto-routes processing to **Groq** (insanely fast, free) or **OpenAI** (premium) based on the key signature (`gsk_` vs `sk-`).
- **Automated Task Extraction**: Automatically parses transcripts to find actionable "To-Do" items, assigning them titles, descriptions, and dynamic priority levels (High, Medium, Low).
- **Beautiful Dashboard**: A "Mariana Trench" level UI built with Next.js, Tailwind CSS, and Recharts, featuring full Dark Mode support, gorgeous micro-animations, and dynamic data visualization.
- **Asynchronous Processing Pipeline**: Videos are processed in the background. The UI automatically polls and updates from a "Processing" state to "Completed" with smooth transitions.

## 🏗️ Tech Stack

**Frontend:**
- Framework: Next.js (React)
- Styling: Tailwind CSS & Framer Motion
- UI Components: shadcn/ui & Radix UI
- State Management: Zustand

**Backend:**
- Runtime: Node.js with TypeScript
- Framework: Express.js
- Database: MongoDB (Mongoose ORM)
- AI SDK: Official OpenAI Node SDK (Routed to Groq/OpenAI)

## ⚙️ Local Installation & Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** (Running locally on `mongodb://localhost:27017` or Atlas)
- **Groq API Key** (Free from console.groq.com)

### 2. Clone the Repository
```bash
git clone https://github.com/yourusername/nexus-ai-converter.git
cd nexus-ai-converter
```

### 3. Install Dependencies
This project uses a monorepo structure. You need to install dependencies for both the frontend and backend.
```bash
# Install frontend packages
cd apps/frontend
npm install

# Install backend packages
cd ../backend
npm install
```

### 4. Environment Variables
Create a `.env` file in the `apps/backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/meeting-tasks-db
JWT_SECRET=your_super_secret_key_here
```

### 5. Run the Application
You can run both the frontend and backend concurrently from the root directory.
```bash
# Start the entire stack
npm run dev
```
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000

## 📝 Usage Guide

1. **Create an Account**: Register and log in.
2. **Configure AI Engine**: Go to the **Settings** page and paste your Groq API Key (`gsk_...`). The system will auto-detect and route your requests to Groq's high-speed Whisper servers.
3. **Upload a Meeting**: Go to the Dashboard and click "New Meeting". Select a video/audio file.
4. **View Results**: Click on the processing meeting. Once complete, view your perfectly translated transcript, summary, and organized action items!

---

<div align="center">
  <i>Developed with ❤️ by Muhammad Taimoor Ajmal</i>
</div>
