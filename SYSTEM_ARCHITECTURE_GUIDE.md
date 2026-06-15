# 🏗️ System Architecture & Database Guide

This guide is written specifically for you to clarify exactly how the **Meeting-to-Tasks Converter** works behind the scenes. We will use your restaurant analogy (which is incredibly accurate!) to break down the Frontend, Backend, and Database, and specifically answer **where your data is physically stored**.

---

## 🍽️ 1. The Frontend (The Dining Room)
The frontend is what the user sees, clicks, and interacts with on their screen. It is the UI (User Interface).

* **What we are using:** **Next.js (React)** with Tailwind CSS.
* **Where it lives locally:** Inside your `apps/frontend/` folder.
* **What it does:** It takes your commands (like uploading a video or clicking "Save Profile") and sends them as an "order" to the backend kitchen via an API. The frontend **does not store data permanently**. If you refresh the page, it has to ask the backend for the data again.

---

## 👨‍🍳 2. The Backend (The Kitchen)
The backend is the brain of the operation. It receives requests from the frontend, enforces security (checks if you are logged in), processes files, talks to the AI, and saves things to the database.

* **What we are using:** **Node.js** with **Express** and TypeScript.
* **Where it lives locally:** Inside your `apps/backend/` folder.
* **What it does:**
  1. Receives your uploaded `.mp4` video.
  2. Temporarily saves the video to the `apps/backend/uploads/` folder on your hard drive.
  3. Sends the video to Groq/OpenAI to get the transcript.
  4. Takes the final transcript and tasks, and hands them over to the Database to be stored safely.

---

## 📦 3. The Database (The Warehouse)
The database is where all your users, passwords, transcripts, and tasks are permanently stored. 

* **What we are using:** **MongoDB** (A NoSQL database).
* **Where is the data physically stored?** This is where you were confused, so let's break it down into Local vs Online:

### A. When running on Localhost (Right Now)
**YES, WE ARE USING IT RIGHT NOW!** Every meeting summary and task you have generated so far is actively being saved into the MongoDB database installed on your computer.
* Your project code is in `D:\All_Data\PROJECTS\Meeting-to-Tasks Converter\`.
* **BUT**, the actual database data (the text of the transcripts, the user profiles) is **NOT** stored inside that project folder!
* When you installed MongoDB on Windows, it created a hidden secure folder deep in your C: drive specifically for database files (usually located at `C:\Program Files\MongoDB\Server\...\data\db`). 
* MongoDB runs a background service on your PC (on port `27017`) that manages this folder. Your Node.js backend talks to this service. That is why your project folder doesn't get huge when you add thousands of text files to the database—the data is safely living in the hidden MongoDB installation directory.

### B. When running Online (Deployed to the Web)
When you are ready to launch this project to the public (e.g., deploying on a web panel like Vercel, Render, or AWS), you **cannot** use the MongoDB installed on your personal C: drive.
* Instead, we use a cloud database service called **MongoDB Atlas**.
* MongoDB Atlas is essentially a massive, highly secure server farm owned by MongoDB (hosted on AWS or Google Cloud).
* You will create a free account on their website, and they will give you a "Connection String" (a URL that looks like `Example Atlas Connection String: <your-mongodb-atlas-connection-string-here>`).
* We will paste that URL into your deployed backend's `.env` file. 
* From then on, when a user uploads a video, your web server processes it, and saves the text data directly to the **MongoDB Atlas servers** in the cloud.

---

## 📂 4. What about the heavy Video/Audio files?
The database is strictly for storing **text** (JSON data like emails, summaries, task lists). You should never store 500MB video files inside a MongoDB database.

* **Locally:** Right now, the physical video files you upload are stored inside your project folder at `apps/backend/uploads/`.
* **Online:** When you deploy this to the web, cloud servers (like Heroku or Render) often delete local files every time they restart. To fix this, we will use a cloud storage bucket like **AWS S3** or **Cloudinary**. When a user uploads a video, your backend will send the actual `.mp4` file to AWS S3, get a secure URL back (e.g., `https://aws.s3.com/your-video.mp4`), and save *only the URL text* into MongoDB.

---

### Summary Checklist of Our Stack
✅ **Frontend:** Next.js (React)
✅ **Backend:** Node.js + Express
✅ **AI Engine:** Groq / OpenAI API
✅ **Database:** MongoDB (Local Windows installation right now -> MongoDB Atlas in the future)
✅ **File Storage:** Local `uploads` folder right now -> AWS S3 in the future

---

## 🧠 5. Future AI Training & RAG: Where will "Tons of Data" go?
You asked a very smart question: *If we implement RAG later and upload TONS of data, where does it go? Will it overload my computer? Can we connect a drive?*

**You are 100% correct.** When we scale this up to handle thousands of heavy meetings, we will **NOT** store it on your local computer, because it would instantly overload your hard drive and slow your computer down.

Instead, we will connect the project to Cloud Drives (just like Google Drive, but for apps):

1. **The Heavy Videos (Audio/Video Data):** 
   Instead of saving videos to your local `D:\` drive, we will connect a cloud storage bucket (like **AWS S3** or **Google Cloud Storage**). When a user uploads a video, it bypasses your computer entirely and goes straight into that massive, infinite cloud drive.
   
2. **The RAG AI Memory (Vector Data):** 
   To give the AI "memory" (RAG) across thousands of transcripts, we don't use regular MongoDB. We connect a specialized cloud database called a **Vector Database** (like **Pinecone**). It lives 100% on the web. 

By pushing the "tons of data" to these cloud services, your project simply acts as a fast, lightweight middleman. It means you could have 10 million videos in your system, and your computer wouldn't feel a single ounce of load!

I hope this crystalizes exactly how the architecture flows! Let me know if you want me to clarify anything else.
