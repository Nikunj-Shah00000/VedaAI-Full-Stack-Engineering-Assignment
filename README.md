# VedaAI-Full-Stack-Engineering-Assignment
# VedaAI – AI Assessment Creator

> An AI-powered assessment generation platform built for educators to create structured, professional question papers with real-time AI workflows, intelligent formatting, and scalable backend architecture.

---

## 🚀 Overview

VedaAI is a full-stack AI assessment generation platform designed to help teachers create high-quality examination papers in minutes.

The platform combines:

* ✨ Modern SaaS UI
* 🤖 AI-powered question generation
* ⚡ Real-time job processing
* 📄 Professional exam formatting
* 🔄 Background worker architecture
* 📡 Live WebSocket updates

Built as part of the **VedaAI Full Stack Engineering Assignment**.

---

# ✨ Key Features

## 🎯 Assignment Creation

* Multi-step intelligent form
* Upload PDF / DOC / TXT materials
* Configure:

  * Question types
  * Marks
  * Difficulty
  * Number of questions
* Due date & instruction management
* Validation for all fields

---

## 🤖 AI Question Generation

* Structured prompt engineering
* AI-generated:

  * Sections
  * Questions
  * Difficulty levels
  * Marks distribution
* Clean JSON parsing layer
* No raw LLM rendering

---

## ⚡ Real-Time Processing

* BullMQ background workers
* Redis queue management
* WebSocket live status updates
* AI generation progress tracking

---

## 📄 Professional Output Generator

* Real exam-paper style UI
* Section-based layout
* Difficulty badges
* Marks visualization
* Print-friendly formatting
* Mobile responsive design

---

## 📦 Export Features

* PDF generation
* Regenerate question paper
* Download formatted paper

---

# 🧠 Architecture Overview

```text
┌──────────────────┐
│   Next.js Frontend
└────────┬─────────┘
         │ REST API + WebSocket
         ▼
┌──────────────────┐
│ Express Backend  │
└────────┬─────────┘
         │
         ├──────────────► MongoDB
         │                 Store assignments/results
         │
         ├──────────────► Redis
         │                 Cache + Queue State
         │
         └──────────────► BullMQ
                           Background AI Jobs
                                   │
                                   ▼
                           AI Generation Worker
                                   │
                                   ▼
                           WebSocket Events
```

---

# 🛠️ Tech Stack

## Frontend

* **Next.js**
* **TypeScript**
* **TailwindCSS**
* **Zustand / Redux**
* **Framer Motion**
* **Socket.IO Client**
* **shadcn/ui**

---

## Backend

* **Node.js**
* **Express.js**
* **TypeScript**
* **MongoDB**
* **Redis**
* **BullMQ**
* **Socket.IO**

---

## AI

* OpenAI / Claude / OSS LLM
* Structured Prompt Engineering
* JSON Output Parsing

---

# 🖼️ Screenshots

## Dashboard

* AI statistics
* Recent assignments
* Activity feed
* Queue insights

## Assignment Creator

* Multi-step form
* Smart configuration
* Upload workflow

## AI Generation

* Real-time progress
* Worker logs
* Queue states

## Generated Paper

* Structured sections
* Difficulty tags
* Professional formatting

> Add screenshots/gifs here for maximum recruiter impact.

---

# ⚙️ System Design Highlights

## 🔄 Queue-Based Architecture

Instead of generating AI responses directly inside the API request cycle, all heavy AI operations are delegated to BullMQ workers.

### Benefits:

* Scalable
* Fault tolerant
* Better UX
* Non-blocking APIs
* Retry support

---

## 📡 WebSocket Real-Time Updates

Implemented live event streaming to provide:

* Job status
* Generation stages
* Completion notifications
* Error updates

This creates a production-grade real-time experience.

---

## 🧠 Structured AI Parsing

The LLM response is:

1. Prompt engineered
2. Parsed into schema
3. Validated
4. Stored as structured JSON

This prevents:

* malformed responses
* broken UI rendering
* inconsistent formatting

---

# 📂 Folder Structure

```bash
.
├── client
│   ├── app
│   ├── components
│   ├── store
│   ├── hooks
│   └── services
│
├── server
│   ├── src
│   │   ├── controllers
│   │   ├── routes
│   │   ├── workers
│   │   ├── queues
│   │   ├── sockets
│   │   ├── services
│   │   └── models
│
└── README.md
```

---

# 🔥 Advanced Features Added

✅ AI difficulty balancing
✅ Real-time generation tracker
✅ Queue visualization architecture
✅ Modern SaaS UI
✅ Mobile responsive design
✅ Clean component architecture
✅ Background worker separation
✅ Optimized API flow
✅ Error boundaries & validations
✅ Professional assessment formatting

---

# 🚀 Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/your-username/vedaai-assessment-creator.git
```

---

## 2. Install Dependencies

### Frontend

```bash
cd client
npm install
```

### Backend

```bash
cd server
npm install
```

---

# 🔐 Environment Variables

## Frontend

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOCKET_URL=
```

## Backend

```env
PORT=
MONGODB_URI=
REDIS_URL=
OPENAI_API_KEY=
```

---

# ▶️ Running the Project

## Start Frontend

```bash
npm run dev
```

## Start Backend

```bash
npm run dev
```

## Start Worker

```bash
npm run worker
```

---

# 📄 API Flow

```text
Teacher submits assignment
        ↓
Backend creates BullMQ job
        ↓
Worker processes AI generation
        ↓
Structured paper stored in MongoDB
        ↓
WebSocket sends live update
        ↓
Frontend displays generated paper
```

---

# 🎨 Design Philosophy

The UI was designed with focus on:

* clarity
* readability
* educational workflows
* professional examination layouts
* modern SaaS aesthetics

Inspired by:

* Notion
* Linear
* ChatGPT
* Google Classroom

---
---

# 💡 Engineering Decisions

## Why BullMQ?

Needed reliable background processing for:

* AI generation
* PDF exports
* heavy async tasks

---

## Why Redis?

Used for:

* Queue state
* Job caching
* Real-time scalability

---

## Why WebSockets?

Provides immediate feedback for:

* generation progress
* better UX
* real-time updates

---

# 📌 Assignment Requirements Covered

| Requirement          | Status |
| -------------------- | ------ |
| Next.js + TypeScript | ✅      |
| Node.js + Express    | ✅      |
| MongoDB              | ✅      |
| Redis                | ✅      |
| BullMQ               | ✅      |
| WebSockets           | ✅      |
| AI Generation        | ✅      |
| Structured Parsing   | ✅      |
| Responsive UI        | ✅      |
| PDF Export           | ✅      |
| State Management     | ✅      |

---

---

# 👨‍💻 Author

**Nikunj Shah**
Full Stack Developer

* GitHub: https://github.com/Nikunj-Shah00000
* LinkedIn: https://www.linkedin.com/in/nikunjshah0000/

---


