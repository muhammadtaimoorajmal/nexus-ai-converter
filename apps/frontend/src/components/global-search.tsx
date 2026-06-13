"use client";

import { useState, useEffect, useRef } from "react";
import { Search, FileAudio, CheckCircle2, Circle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";

interface SearchResult {
  id: string;
  title: string;
  type: "meeting" | "task";
  status: string;
  href: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore((state) => state.token);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let active = true;

    if (!query.trim() || !token) {
      setTimeout(() => {
        setResults([]);
        setIsLoading(false);
      }, 0);
      return;
    }

    const fetchSearch = async () => {
      setIsLoading(true);
      try {
        const [meetingsRes, tasksRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/meetings`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/tasks`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        let mData = [];
        let tData = [];
        
        if (meetingsRes.ok) mData = await meetingsRes.json();
        if (tasksRes.ok) tData = await tasksRes.json();

        const filteredMeetings = mData
          .filter((m: { _id: string; title: string; status: string }) => m.title.toLowerCase().includes(query.toLowerCase()))
          .map((m: { _id: string; title: string; status: string }) => ({
            id: m._id,
            title: m.title,
            type: "meeting",
            status: m.status,
            href: `/meetings/${m._id}`
          }));

        const filteredTasks = tData
          .filter((t: { _id: string; title: string; status: string }) => t.title.toLowerCase().includes(query.toLowerCase()))
          .map((t: { _id: string; title: string; status: string }) => ({
            id: t._id,
            title: t.title,
            type: "task",
            status: t.status,
            href: `/tasks`
          }));

        if (active) {
          setResults([...filteredMeetings, ...filteredTasks] as SearchResult[]);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchSearch, 300);
    return () => {
      active = false;
      clearTimeout(debounce);
    };
  }, [query, token]);

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search meetings and tasks..."
          className="pl-9 bg-muted/50 border-transparent focus-visible:border-primary/50 focus-visible:ring-primary/20 transition-all rounded-full h-10"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className="absolute top-12 left-0 w-full bg-popover border shadow-xl rounded-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="max-h-80 overflow-y-auto py-2">
            {isLoading ? (
              <div className="px-4 py-3 text-sm text-muted-foreground">Searching...</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                This data is not available.
              </div>
            ) : (
              <div className="flex flex-col">
                {results.map((r) => (
                  <Link
                    key={`${r.type}-${r.id}`}
                    href={r.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                  >
                    <div className="p-2 rounded-full bg-primary/10">
                      {r.type === "meeting" ? (
                        <FileAudio className="w-4 h-4 text-primary" />
                      ) : r.status === "done" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{r.type} • {r.status}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
