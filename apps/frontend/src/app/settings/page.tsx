"use client";

import { useAuthStore } from "@/store/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, Settings2, Bell, Shield, Cpu } from "lucide-react";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { user, token } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [company, setCompany] = useState(user?.company || "");
  const [openAiKey, setOpenAiKey] = useState("");
  const [aiProvider, setAiProvider] = useState<"openai" | "groq">((user as any)?.aiProvider || "openai");
  const [isSaving, setIsSaving] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Fetch profile to get existing details
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.name) setName(data.name);
          if (data.avatarUrl) setAvatarUrl(data.avatarUrl);
          if (data.bio) setBio(data.bio);
          if (data.company) setCompany(data.company);
          if (data.openAiKey) setOpenAiKey(data.openAiKey);
          if (data.aiProvider) setAiProvider(data.aiProvider);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, avatarUrl, bio, company, openAiKey, aiProvider })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setAuth(updatedUser, token!);
        alert("Profile saved successfully!");
      } else {
        alert("Failed to save profile.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings, AI preferences, and configuration.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation/Categories (Visual) */}
        <div className="space-y-2">
          <Button variant="secondary" className="w-full justify-start gap-2 font-medium">
            <User className="w-4 h-4" /> Account & Profile
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 font-medium">
            <Cpu className="w-4 h-4" /> AI Model Engine
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 font-medium">
            <Bell className="w-4 h-4" /> Notifications
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 font-medium">
            <Shield className="w-4 h-4" /> Security
          </Button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                Profile Details
              </CardTitle>
              <CardDescription>Configure your account profile.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={user?.email || "user@example.com"} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input id="avatarUrl" placeholder="https://..." value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input id="company" placeholder="e.g. Acme Corp" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="A short bio..." value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div className="space-y-2 pt-4 border-t">
                <Label htmlFor="aiProvider">AI Engine Provider</Label>
                <select
                  id="aiProvider"
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value as "openai" | "groq")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="openai">OpenAI (Paid, Highest Accuracy)</option>
                  <option value="groq">Groq (Free, Insanely Fast)</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Select your preferred AI engine for transcription and tasks.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="openAiKey">{aiProvider === 'groq' ? 'Groq API Key' : 'OpenAI API Key'}</Label>
                <div className="flex gap-2">
                  <Input 
                    id="openAiKey" 
                    type="password" 
                    placeholder={aiProvider === 'groq' ? "gsk-..." : "sk-..."}
                    value={openAiKey}
                    onChange={(e) => setOpenAiKey(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {aiProvider === 'groq' 
                    ? 'Get your free key at console.groq.com. Uses Whisper-Large-v3 & Llama-3.' 
                    : 'Required for "Mariana Trench" level accuracy and native auto-detected transcription via Cloud Whisper.'}
                </p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Preferences */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings2 className="w-5 h-5 text-primary" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the application theme.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Theme Settings</p>
                <p className="text-xs text-muted-foreground">Toggle between Light, Dark, or System mode.</p>
              </div>
              <ThemeToggle />
            </CardContent>
          </Card>

          {/* Developer Attribution Card */}
          <Card className="shadow-sm border-primary/20 bg-primary/5">
            <CardHeader className="border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-lg text-primary">
                Developer Info
              </CardTitle>
              <CardDescription>Project author credentials and profiles.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-md">Muhammad Taimoor Ajmal</h4>
                  <p className="text-xs text-muted-foreground">Full-Stack AI Solutions Engineer</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <a
                    href="https://github.com/muhammadtaimoorajmal"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                      GitHub
                    </Button>
                  </a>
                  <a
                    href="https://www.linkedin.com/in/muhammadtaimoorajmal/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial"
                  >
                    <Button variant="outline" size="sm" className="w-full gap-2 text-blue-500 hover:text-blue-600">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                      LinkedIn
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
