"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewMeetingPage() {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const [title, setTitle] = useState("");
  const [textTranscript, setTextTranscript] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a", ".ogg"],
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
    },
    maxFiles: 1,
  });

  const handleFileUpload = async () => {
    if (!file || !title) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/meetings/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      router.push(`/meetings/${data._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTextUpload = async () => {
    if (!textTranscript || !title) return;
    setIsUploading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/meetings/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, text: textTranscript }),
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      router.push(`/meetings/${data._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save transcript");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Upload Meeting</h2>
        <p className="text-muted-foreground">Add a new meeting to generate action items and summaries.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Details</CardTitle>
          <CardDescription>Start by providing a title for your meeting.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Meeting Title</Label>
              <Input
                id="title"
                placeholder="e.g. Q3 Roadmap Planning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="file">File Upload</TabsTrigger>
          <TabsTrigger value="text">Paste Transcript</TabsTrigger>
        </TabsList>
        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio or Video</CardTitle>
              <CardDescription>We accept MP3, M4A, WAV, MP4, MOV. Max size 500MB.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 hover:scale-[1.01] active:scale-[0.98] ${
                  isDragActive 
                  ? "border-primary bg-primary/10 shadow-[0_0_30px_rgba(var(--primary),0.2)]" 
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center space-y-4">
                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div 
                        key="file"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center text-primary"
                      >
                        <CheckCircle2 className="w-12 h-12 mb-2" />
                        <span className="font-medium text-lg">{file.name}</span>
                        <span className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="p-4 bg-muted rounded-full mb-4 group-hover:scale-110 transition-transform">
                          <UploadCloud className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-medium">Drag & drop your file here</p>
                        <p className="text-sm text-muted-foreground">or click to browse</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={!file || !title || isUploading}
                onClick={handleFileUpload}
              >
                {isUploading ? "Uploading..." : "Process Meeting"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Paste Transcript</CardTitle>
              <CardDescription>Paste your raw text transcript or meeting notes here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full min-h-[300px] p-4 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Paste transcript here..."
                value={textTranscript}
                onChange={(e) => setTextTranscript(e.target.value)}
              />
              <Button
                className="w-full"
                size="lg"
                disabled={!textTranscript || !title || isUploading}
                onClick={handleTextUpload}
              >
                {isUploading ? "Processing..." : "Process Text"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
