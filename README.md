
# 🤖 AI Mock Interview 

An intelligent web-based platform that helps users **prepare for job interviews** by simulating a **real interview experience** using **AI**.  
The system analyzes  generates **job-specific interview questions** and provides **AI-powered feedback** to help users improve their interview performance.

---

## 🚀 Features

✅ **AI Job Analysis**
- Gemini/OpenAI model analyzes it based on the job role and experience
- Provides strengths, weaknesses, and improvement suggestions

✅ **AI Question Generation**
- Automatically generates 10+ interview questions based on the job title and experience

✅ **Facial Detection**
- Uses **face-api.js** to analyze whether user present or not during the interview

✅ **AI Feedback System**
- Generates professional feedback with personalized improvement advice

✅ **Authentication & Dashboard**
- Secure sign-in using **Clerk Authentication** (Google & Facebook support)
- Personalized dashboard showing completed interviews and results

---

## 🧠 Architecture Overview

**Frontend:**  
- React (Vite + TypeScript)  
- TailwindCSS + ShadCN UI  
- Clerk Authentication  
- face-api.js for facial detection  

**Backend:**  
- Firebase (Firestore + Storage)  
- Gemini/OpenAI API for AI-based resume & interview analysis  

**Hosting:**  
- Frontend → Vercel  
- Database → Firebase  

---

## 🧩 System Flow

1. User signs in via Clerk  
2. Fills job details & uploads resume  
3. AI generates interview questions  
4. User attends the mock interview (voice + webcam)  
5. System records voice tone and face
6. AI evaluates answers, tone, and body language  
7. Final feedback is generated and displayed on the dashboard  

---

## 🧰 Technology Stack

| Category | Technologies |
|-----------|--------------|
| **Frontend** | React (Vite), TypeScript, TailwindCSS, ShadCN UI |
| **Backend** | Firebase, Gemini/OpenAI API |
| **Authentication** | Clerk (Google, Facebook) |
| **AI/ML Models** | Gemini / OpenAI GPT, face-api.js, Librosa |
| **APIs Used** | Firebase API |
| **Hosting** | Vercel, Firebase |

---

## 🧾 Installation Guide (Local Setup)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/ai-mock-interview-app.git
cd ai-mock-interview-app
