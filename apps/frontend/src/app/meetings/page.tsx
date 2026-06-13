"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { FileAudio, FileVideo, FileText, Search, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Meeting } from "@meeting-to-tasks/shared";

interface DbMeeting extends Omit<Meeting, "id"> {
  _id: string;
}

export default function MeetingsPage() {
  const token = useAuthStore((state) => state.token);
  const [meetings, setMeetings] = useState<DbMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const handleDelete = async (e: React.MouseEvent, meetingId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this meeting? This will also delete all associated tasks.")) {
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/meetings/${meetingId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMeetings((prev) => prev.filter((m) => m._id !== meetingId));
      } else {
        alert("Failed to delete meeting");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting meeting");
    }
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/meetings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setMeetings(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMeetings();
    }
  }, [token]);

  const filteredMeetings = meetings.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Meetings</h1>
          <p className="text-muted-foreground">All your processed and pending meetings.</p>
        </div>
        <Link href="/meetings/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Meeting
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground absolute ml-3" />
        <Input 
          placeholder="Search meetings..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : filteredMeetings.length === 0 ? (
        <Card className="shadow-sm border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileAudio className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <p className="text-muted-foreground">No meetings found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredMeetings.map((meeting) => (
            <div key={meeting._id} className="relative group/card">
              <Link href={`/meetings/${meeting._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4 flex items-center justify-between pr-14">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                        {meeting.sourceType === "audio" && <FileAudio className="w-5 h-5 text-primary" />}
                        {meeting.sourceType === "video" && <FileVideo className="w-5 h-5 text-primary" />}
                        {meeting.sourceType === "text" && <FileText className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{meeting.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(meeting.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={meeting.status === "completed" ? "default" : "secondary"}>
                      {meeting.status}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-destructive border-destructive/20 hover:bg-destructive/10 z-10 transition-colors bg-background"
                onClick={(e) => handleDelete(e, meeting._id)}
                title="Delete Meeting"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
