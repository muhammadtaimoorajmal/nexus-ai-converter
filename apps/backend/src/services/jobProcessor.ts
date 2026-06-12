import Meeting from '../models/Meeting';
import Task from '../models/Task';
import path from 'path';
import fs from 'fs';
import User from '../models/User';
import { transcribeAudio, extractMeetingData } from './aiService';

const extractTasksFromText = (transcript: string) => {
  const tasks = [];
  const sentences = transcript.split(/[.!?\n]/);
  for (let s of sentences) {
    s = s.trim();
    if (!s) continue;
    const lowerS = s.toLowerCase();
    const keywords = ["need to", "must", "should", "task", "todo", "assign"];
    if (keywords.some(k => lowerS.includes(k))) {
      let priority: 'low' | 'medium' | 'high' = 'medium';
      const highPrio = ["high", "urgent", "asap", "immediately", "critical"];
      const lowPrio = ["low", "later", "whenever"];
      
      if (highPrio.some(hp => lowerS.includes(hp))) priority = 'high';
      else if (lowPrio.some(lp => lowerS.includes(lp))) priority = 'low';
      
      tasks.push({
        title: s.substring(0, 100) + (s.length > 100 ? "..." : ""),
        description: `Action item extracted: '${s}'`,
        priority
      });
    }
  }
  return tasks;
};

export const processMeetingJob = async (meetingId: string) => {
  try {
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return;

    const user = await User.findById(meeting.userId);
    if (!user) {
      meeting.status = 'error';
      meeting.summary = "Error: User not found.";
      await meeting.save();
      return;
    }

    let transcript = meeting.transcript || '';
    let summary = meeting.summary || '';
    let tasksList: Array<{ title: string; description: string; priority: 'low' | 'medium' | 'high' }> = [];
    let detectedLanguage = meeting.language || 'unknown';

    if (meeting.sourceType === 'audio' || meeting.sourceType === 'video') {
      if (!user.openAiKey) {
        meeting.status = 'error';
        meeting.summary = "OpenAI API Key is missing. Please add it in Settings.";
        await meeting.save();
        return;
      }
      if (meeting.fileUrl) {
        try {
          const inputFilePath = path.resolve(meeting.fileUrl);
          
          console.log(`Executing ${user.aiProvider || 'openai'} Cloud transcription for: ${inputFilePath}`);
          const transRes = await transcribeAudio(inputFilePath, user.openAiKey, user.aiProvider);
          transcript = transRes.transcript;
          detectedLanguage = transRes.language;

          console.log(`Executing ${user.aiProvider || 'openai'} Cloud extraction for: ${meetingId}`);
          const dataRes = await extractMeetingData(transcript, user.openAiKey, user.aiProvider);
          summary = dataRes.summary;
          tasksList = dataRes.tasks as any;
          
        } catch (transcribeErr: any) {
          console.error("AI processing failed:", transcribeErr);
          meeting.status = 'error';
          const errMsg = transcribeErr.message || String(transcribeErr);
          if (errMsg.includes("401") || transcribeErr.status === 401) {
            meeting.summary = "API Key is missing or invalid. Please update your key in Settings.";
          } else if (errMsg.includes("429") || transcribeErr.status === 429) {
            meeting.summary = "Quota Exceeded (429). Your AI provider account has run out of credits or hit a rate limit. Consider switching to Groq for a free alternative in Settings.";
          } else {
            meeting.summary = "Processing Error: " + errMsg;
          }
          await meeting.save();
          return;
        }
      }
    } else if (meeting.sourceType === 'text') {
      if (!user.openAiKey) {
        // Fallback to local heuristic if no key for text
        tasksList = extractTasksFromText(transcript) as any;
        summary = `Offline text processed. Snippet: ${transcript.substring(0, 300)}...`;
      } else {
        try {
          console.log(`Executing ${user.aiProvider || 'openai'} Cloud extraction for text meeting: ${meetingId}`);
          const dataRes = await extractMeetingData(transcript, user.openAiKey, user.aiProvider);
          summary = dataRes.summary;
          tasksList = dataRes.tasks as any;
          detectedLanguage = 'en'; // rough default
        } catch (err: any) {
          console.error("AI text processing failed:", err);
          meeting.status = 'error';
          const errMsg = err.message || String(err);
          if (errMsg.includes("401") || err.status === 401) {
            meeting.summary = "API Key is missing or invalid. Please update your key in Settings.";
          } else if (errMsg.includes("429") || err.status === 429) {
            meeting.summary = "Quota Exceeded (429). Your AI provider account has run out of credits or hit a rate limit. Consider switching to Groq for a free alternative in Settings.";
          } else {
            meeting.summary = "Processing Error: " + errMsg;
          }
          await meeting.save();
          return;
        }
      }
    }

    if (!transcript && meeting.sourceType !== 'text') {
      meeting.status = 'error';
      meeting.summary = "No transcript generated.";
      await meeting.save();
      return;
    }

    meeting.transcript = transcript;
    meeting.summary = summary || "No summary generated.";
    meeting.language = detectedLanguage;
    meeting.status = 'completed';
    await meeting.save();

    // Create Tasks
    for (const item of tasksList) {
      const task = new Task({
        meetingId: meeting._id,
        userId: meeting.userId,
        title: item.title,
        description: item.description,
        priority: item.priority,
        status: 'todo',
      });
      await task.save();
    }

    console.log(`✅ Meeting ${meetingId} processed successfully!`);
  } catch (error) {
    console.error(`❌ Error processing meeting ${meetingId}:`, error);
    await Meeting.findByIdAndUpdate(meetingId, { status: 'error' });
  }
};
