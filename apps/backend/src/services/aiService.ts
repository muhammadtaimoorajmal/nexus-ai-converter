import OpenAI from 'openai';
import fs from 'fs';

export const transcribeAudio = async (filePath: string, openAiKey: string, provider: string = 'openai') => {
  const isGroq = provider === 'groq' || openAiKey.startsWith('gsk_');
  const openai = new OpenAI({ 
    apiKey: openAiKey,
    baseURL: isGroq ? 'https://api.groq.com/openai/v1' : undefined
  });

  const fileStream = fs.createReadStream(filePath);
  
  const response = await openai.audio.transcriptions.create({
    file: fileStream,
    model: isGroq ? 'whisper-large-v3' : 'whisper-1',
    response_format: 'verbose_json',
  });

  return {
    transcript: response.text,
    language: response.language || 'unknown'
  };
};

export const extractMeetingData = async (transcript: string, openAiKey: string, provider: string = 'openai') => {
  const isGroq = provider === 'groq' || openAiKey.startsWith('gsk_');
  const openai = new OpenAI({ 
    apiKey: openAiKey,
    baseURL: isGroq ? 'https://api.groq.com/openai/v1' : undefined
  });

  const prompt = `
You are an expert executive assistant. Analyze the following meeting transcript.
Provide a professional summary and extract any actionable items (tasks).
Return the result strictly as a JSON object with this exact structure:
{
  "summary": "String containing the overall summary of the meeting",
  "tasks": [
    {
      "title": "Task title",
      "description": "Task description",
      "priority": "low" | "medium" | "high"
    }
  ]
}

Transcript:
"""
${transcript}
"""
`;

  const response = await openai.chat.completions.create({
    model: isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are a helpful AI assistant that outputs strictly valid JSON.' },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No content received from AI');
  }

  const parsed = JSON.parse(content);
  return {
    summary: parsed.summary || 'No summary available.',
    tasks: parsed.tasks || []
  };
};
