"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle2, Clock, FileAudio, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";

interface DashboardMeeting {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface DashboardTask {
  _id: string;
  status: string;
}

export default function DashboardPage() {
  const token = useAuthStore((state) => state.token);
  const [meetings, setMeetings] = useState<DashboardMeeting[]>([]);
  const [tasks, setTasks] = useState<DashboardTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mRes, tRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/meetings`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        if (mRes.ok) setMeetings(await mRes.json());
        if (tRes.ok) setTasks(await tRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchData();
  }, [token]);

  const handleDeleteMeeting = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meeting?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/meetings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMeetings(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pendingTasks = tasks.filter(t => t.status !== "done").length;
  const completedTasks = tasks.filter(t => t.status === "done").length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your recent meetings and tasks.
          </p>
        </div>
        <Link href="/meetings/new">
          <Button className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Meeting
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings</CardTitle>
            <FileAudio className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{meetings.length}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Recent Meetings</h3>
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground animate-pulse">Loading...</div>
            ) : meetings.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <FileAudio className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No meetings yet</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Upload your first meeting recording to automatically generate transcripts, summaries, and action items.
                </p>
                <Link href="/meetings/new">
                  <Button variant="outline" className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Upload className="w-4 h-4" />
                    Upload File
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {meetings.map((meeting) => (
                  <div key={meeting._id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
                    <Link href={`/meetings/${meeting._id}`} className="flex-1 flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <FileAudio className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium hover:underline">{meeting.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.createdAt).toLocaleDateString()} • {meeting.status}
                        </p>
                      </div>
                    </Link>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMeeting(meeting._id)}
                        title="Delete Meeting"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
