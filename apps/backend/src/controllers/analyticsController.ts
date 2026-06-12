import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import Meeting from '../models/Meeting';
import Task from '../models/Task';

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // Get meetings
    const meetings = await Meeting.find({ userId }).select('createdAt status');
    const tasks = await Task.find({ userId }).select('createdAt status');

    // Group by day for the last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    // Initialize chart data for the last 7 days ending today
    const chartData: { name: string; date: string; tasks: number; meetings: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      chartData.push({
        name: days[d.getDay()],
        date: d.toISOString().split('T')[0],
        tasks: 0,
        meetings: 0,
      });
    }

    // Populate chart data
    meetings.forEach((m) => {
      const dStr = m.createdAt.toISOString().split('T')[0];
      const entry = chartData.find((c) => c.date === dStr);
      if (entry) entry.meetings += 1;
    });

    tasks.forEach((t) => {
      const dStr = t.createdAt.toISOString().split('T')[0];
      const entry = chartData.find((c) => c.date === dStr);
      if (entry && t.status === 'done') entry.tasks += 1;
    });

    const totalMeetings = meetings.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const totalTasks = tasks.length;
    
    const taskConversionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const avgActionItems = totalMeetings > 0 ? (totalTasks / totalMeetings).toFixed(1) : "0.0";
    
    // Estimate 45 mins saved per meeting
    const totalMinutesSaved = totalMeetings * 45;
    const hoursSaved = Math.floor(totalMinutesSaved / 60);
    const minsSaved = totalMinutesSaved % 60;
    const timeSavedStr = `${hoursSaved}h ${minsSaved}m`;

    res.json({
      chartData,
      metrics: {
        timeSavedStr,
        taskConversionRate: `${taskConversionRate}%`,
        avgActionItems
      }
    });
  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: 'Server error retrieving analytics' });
  }
};
