"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, Plus, Loader2 } from "lucide-react";
import { Task } from "@meeting-to-tasks/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DbTask extends Omit<Task, "id"> {
  _id: string;
}

export default function TasksPage() {
  const token = useAuthStore((state) => state.token);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchTasks();
    }
  }, [token]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high">("medium");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          priority: newTaskPriority
        })
      });
      if (res.ok) {
        const createdTask = await res.json();
        setTasks(prev => [createdTask, ...prev]);
        setIsDialogOpen(false);
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskPriority("medium");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleTaskStatus = async (task: DbTask) => {
    const newStatus = task.status === "done" ? "todo" : "done";
    
    // Optimistic update
    setTasks((prev) => prev.map(t => t._id === task._id ? { ...t, status: newStatus } : t));

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error(err);
      // Revert on failure
      setTasks((prev) => prev.map(t => t._id === task._id ? { ...t, status: task.status } : t));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-12 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.status === "todo" || t.status === "in_progress");
  const doneTasks = tasks.filter(t => t.status === "done");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Tasks</h1>
          <p className="text-muted-foreground">Manage your action items extracted from meetings.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button className="gap-2" type="button" />}>
            <Plus className="w-4 h-4" />
            Create Task
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleCreateTask}>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a manual task to your tracker.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Follow up with client" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description (Optional)</Label>
                  <Input 
                    id="desc" 
                    placeholder="More details here..." 
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high")}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreating || !newTaskTitle.trim()}>
                  {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Create Task
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pending Tasks */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Pending Tasks</CardTitle>
            <Badge variant="secondary">{todoTasks.length}</Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {todoTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">All caught up!</p>
            ) : (
              todoTasks.map(task => (
                <div key={task._id} className="flex items-start gap-3 p-3 border rounded-lg bg-card shadow-sm hover:shadow-md transition">
                  <button onClick={() => toggleTaskStatus(task)} className="mt-1 text-muted-foreground hover:text-emerald-500 transition">
                    <Circle className="w-5 h-5" />
                  </button>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm leading-none">{task.title}</p>
                      <Badge variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground">{task.description}</p>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Completed Tasks */}
        <Card className="shadow-sm">
          <CardHeader className="bg-muted/30 border-b flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg">Completed</CardTitle>
            <Badge variant="secondary">{doneTasks.length}</Badge>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {doneTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No completed tasks yet.</p>
            ) : (
              doneTasks.map(task => (
                <div key={task._id} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50 opacity-75">
                  <button onClick={() => toggleTaskStatus(task)} className="mt-1 text-emerald-500 transition">
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm leading-none line-through text-muted-foreground">{task.title}</p>
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground line-through">{task.description}</p>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
