"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileAudio, FileVideo, FileText, Loader2, CheckCircle, Trash2, Copy, RefreshCw } from "lucide-react";
import { Meeting, Task } from "@meeting-to-tasks/shared";
import { motion } from "framer-motion";

interface DbMeeting extends Omit<Meeting, "id"> {
  _id: string;
  transcript?: string;
  summary?: string;
}

interface DbTask extends Omit<Task, "id"> {
  _id: string;
}

export default function MeetingDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [meeting, setMeeting] = useState<DbMeeting | null>(null);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [reprocessing, setReprocessing] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this meeting? This will also delete all associated tasks.")) {
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/meetings/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        router.push("/meetings");
      } else {
        alert("Failed to delete meeting");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting meeting");
    }
  };

  const handleReprocess = async () => {
    setReprocessing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/meetings/${id}/reprocess`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updatedMeeting = await res.json();
        setMeeting(updatedMeeting);
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to trigger reprocessing.");
      }
    } catch (err) {
      console.error(err);
      alert("Error triggering reprocessing.");
    } finally {
      setReprocessing(false);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert(`${type} copied to clipboard!`);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const hasNoMeeting = meeting === null;
  const meetingStatus = meeting?.status;

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const fetchMeetingData = async (isPoll = false) => {
      try {
        const resMeeting = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/meetings/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (resMeeting.ok) {
          const data = await resMeeting.json();
          setMeeting(data);

          if (data.status === "completed" || data.status === "error") {
            const resTasks = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks?meetingId=${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resTasks.ok) {
              const tasksData = await resTasks.json();
              setTasks(tasksData);
            }
            if (intervalId) {
              clearInterval(intervalId);
            }
          }
        } else if (resMeeting.status === 404) {
          setMeeting(null);
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!isPoll) {
          setLoading(false);
        }
      }
    };

    if (id && token) {
      fetchMeetingData(false);

      if (hasNoMeeting || meetingStatus === 'processing') {
        intervalId = setInterval(() => {
          fetchMeetingData(true);
        }, 3000);
      }
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [id, token, hasNoMeeting, meetingStatus]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-[250px]" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="p-4 bg-muted rounded-full">
          <FileAudio className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Meeting Not Found</h2>
        <p className="text-muted-foreground max-w-md text-center">
          The meeting you are looking for does not exist, has been deleted, or you do not have permission to view it.
        </p>
        <Button onClick={() => router.push('/meetings')} variant="outline" className="mt-4">
          Return to Meetings
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{meeting.title}</h1>
          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
            <span className="flex items-center">
              {meeting.sourceType === "audio" && <FileAudio className="w-4 h-4 mr-2" />}
              {meeting.sourceType === "video" && <FileVideo className="w-4 h-4 mr-2" />}
              {meeting.sourceType === "text" && <FileText className="w-4 h-4 mr-2" />}
              <span className="capitalize">{meeting.sourceType} Source</span>
            </span>
            <span>•</span>
            <span>{new Date(meeting.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {meeting.status === "processing" ? (
            <Badge variant="secondary" className="px-3 py-1 flex items-center bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 animate-pulse">
              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              Processing AI
            </Badge>
          ) : meeting.status === "completed" ? (
            <Badge variant="default" className="px-3 py-1 flex items-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">
              <CheckCircle className="w-3 h-3 mr-2" />
              Completed
            </Badge>
          ) : (
            <Badge variant="destructive" className="px-3 py-1">Error</Badge>
          )}

          {meeting.status === "error" && (
            <Button
              variant="default"
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={handleReprocess}
              disabled={reprocessing}
            >
              {reprocessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {reprocessing ? "Retrying..." : "Retry Process"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between">
              <CardTitle>Transcript</CardTitle>
              {meeting.transcript && meeting.status !== "error" && (
                <Button variant="ghost" size="sm" onClick={() => handleCopy(meeting.transcript!, "Transcript")}>
                  <Copy className="w-4 h-4 mr-2" /> Copy
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-6">
              {meeting.transcript && meeting.status !== "error" ? (
                <div className="prose dark:prose-invert max-w-none text-base leading-loose font-medium">
                  {meeting.transcript.split("\n").map((paragraph: string, idx: number) => (
                    <p key={idx} className="mb-4">
                      {paragraph.split(" ").map((word, wIdx) => (
                        <span 
                          key={wIdx} 
                          className="mr-[0.25em] inline-block hover:bg-primary/20 hover:text-primary transition-colors cursor-text rounded px-0.5"
                        >
                          {word}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  {meeting.status === "processing" ? (
                    <>
                      <Loader2 className="w-8 h-8 mb-4 animate-spin text-primary" />
                      <p>Generating transcript from audio...</p>
                    </>
                  ) : meeting.status === "error" ? (
                    <p className="text-destructive font-medium">No transcript available due to processing error.</p>
                  ) : (
                    <p>No transcript available.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className={`shadow-sm border-primary/20 ${meeting.status === 'error' ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5'}`}>
            <CardHeader className="pb-3 border-b border-primary/10 flex flex-row items-center justify-between">
              <CardTitle className={meeting.status === 'error' ? 'text-destructive' : 'text-primary'}>
                {meeting.status === 'error' ? 'Processing Failure' : 'Summary'}
              </CardTitle>
              {meeting.summary && meeting.status !== "error" && (
                <Button variant="ghost" size="sm" onClick={() => handleCopy(meeting.summary!, "Summary")}>
                  <Copy className="w-4 h-4 mr-2 text-primary" /> <span className="text-primary">Copy</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-4 text-sm">
              {meeting.status === "error" ? (
                <div className="text-destructive space-y-4">
                  <p className="font-medium leading-relaxed">
                    {meeting.summary || "An error occurred during AI processing."}
                  </p>
                  {meeting.summary?.includes("API Key is missing") && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-destructive/30 hover:bg-destructive/10 text-destructive bg-transparent flex items-center justify-center gap-2"
                      onClick={() => router.push('/settings')}
                    >
                      Configure OpenAI Key
                    </Button>
                  )}
                </div>
              ) : meeting.summary ? (
                <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed">
                  {meeting.summary}
                </div>
              ) : meeting.status === "processing" ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              ) : (
                <span className="text-muted-foreground">No summary available.</span>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3 border-b bg-muted/30">
              <CardTitle>Action Items</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {tasks.length > 0 ? (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task._id} className="p-3 border rounded-lg bg-card shadow-sm flex flex-col gap-2">
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-sm">{task.title}</span>
                        <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                    </div>
                  ))}
                </div>
              ) : meeting.status === "processing" ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No action items extracted yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
