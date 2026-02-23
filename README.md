# 🚀 MockMate AI: Advanced Technical Interview Intelligence

**MockMate AI** is a precision-engineered, full-stack platform designed to bridge the gap between academic preparation and elite industry standards. Leveraging **Java 21**, **Spring Boot**, and **Azure AI**, it provides an immersive ecosystem for mastering high-stakes technical interviews.

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Shadcn UI, Vite |
| **Backend** | Java 21, Spring Boot 3.5, Maven |
| **AI Orchestration** | Azure OpenAI (GPT-4o), Azure AI Foundry |
| **Voice Intelligence** | Azure AI Speech (STS/TTS), Transcription SDK |
| **Database** | MongoDB Atlas (Cloud Cluster) |
| **State/Logic** | Lucide React, Sonner (Toast), React Router |

---

## ✨ Key Features

### 🎮 Algorithm Arena (LeetCode Style)

A competitive coding environment where **GPT-4o** dynamically generates Medium/Hard Java challenges.

* **Live Contest Mode:** Real-time timer and performance tracking.
* **AI Judge:** Immediate evaluation of logic and time complexity ( analysis).

### 🎙️ Real-time Voice Interviewer

Context-aware technical interviews powered by **Azure AI Speech**.

* **Transcription:** High-fidelity speech-to-text conversion.
* **Soft Skills Analysis:** AI-driven metrics for clarity, filler word detection, and tone.

### 🏛️ System Design Canvas

An interactive architecting tool for distributed systems.

* **Vision Analysis:** AI-critique of architectural blueprints.
* **Structural Reasoning:** Pattern validation for load balancing, caching, and microservices.

### 🕵️ SQL Detective & Disaster Recovery

* **SQL Gym:** Master schema design and query optimization.
* **Production Firefighter:** Solve 150+ real-world Java/Azure infrastructure disasters.

### 📋 Cloud-Synced Waitlist

A secure, persistence-layer for user onboarding.

* **Architecture:** React frontend → Spring Boot API → MongoDB Atlas.

### 📝 Resume Roaster & ATS Optimizer

An AI-driven career strategist designed to transform standard CVs into high-impact, industry-aligned resumes.

* **The Roast**: Brute-force critique of your resume structure, tone, and formatting.
* **ATS Alignment**: Calculates a compatibility score against specific Job Descriptions (JDs) and identifies missing "Power Keywords."
* **Verification Challenge**: Automatically generates two deep-dive technical questions based on your stated experience to ensure you can defend every bullet point in an interview.

### 🕵️ Scenario-Based Intelligence (The Gauntlet)

A multi-dimensional testing ground for production-grade problem solving, divided into three specialized tracks:

* **Production Firefighter**: Diagnostic simulations where users must parse complex system logs to identify root causes of application failure—bridging the gap between raw data and resolution.
* **Cloud Architect**: High-stakes scenarios focused on distributed systems, high availability (HA), disaster recovery, and cost-optimization within Azure infrastructure.
* **Code Reviewer**: A rigorous evaluation module for identifying syntax errors, anti-patterns, and logical vulnerabilities in Java/Spring Boot codebases.
---

## 🏗️ System Architecture
<p align="center">
<img src="https://github.com/user-attachments/assets/413a6601-b94d-4d64-9996-a8658eef4508"  alt="MockMate AI System Architecture" width="700"/>
</p>

1. **Client:** Vite-powered React SPA with glass-morphism UI.
2. **API Gateway:** Spring Boot REST API (Port 8081).
3. **AI Layer:** Direct integration with **Azure OpenAI Service** for LLM orchestration.
4. **Data Layer:** Distributed NoSQL storage via **MongoDB Atlas**.

---
## ⚡ Performance & Optimization
* **Latency Management**: Utilizes **Azure AI Speech** for **high-fidelity** transcription to ensure minimal processing overhead during live interactions.
---

## 🚀 Getting Started

### Prerequisites

* JDK 21
* Node.js (v18+)
* MongoDB Atlas Account
* Azure Cognitive Services Key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Pranjall-Gupta/MockMate-AI.git

```


2. **Backend Setup**
* Navigate to `/backend`.
* Update `application.properties` with your Azure and MongoDB credentials.
* Run the application:
```bash
./mvnw spring-boot:run

```




3. **Frontend Setup**
* Navigate to `/frontend`.
* Install dependencies: `npm install`.
* Start development server: `npm run dev`.


---
### 🛠️ Troubleshooting

* **Netty Version Mismatch**: If you encounter Azure SDK warnings regarding Netty versions, ensure your Maven dependencies are aligned to 4.1.110.Final to match the Azure Core requirement.
---

## 👨‍💻 Developed By

**Pranjal Gupta**

* [Portfolio](https://pranjalgupta.dev)
* [LinkedIn](https://www.linkedin.com/in/pranjal-gupta1369)
* [LeetCode](https://leetcode.com/u/Pranjal__Gupta/)

---

### 🎓 Project Context

Developed as part of the **Microsoft IEP Capstone Project**, focusing on the intersection of Generative AI and Technical Education.

---
