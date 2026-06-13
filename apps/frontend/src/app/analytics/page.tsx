"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: { name: string, value: string | number, color: string }[], label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/80 backdrop-blur-md border shadow-xl rounded-xl p-3 animate-in fade-in zoom-in-95">
        <p className="font-semibold text-sm mb-1">{label}</p>
        {payload.map((p, i: number) => (
          <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const token = useAuthStore((state) => state.token);
  const [data, setData] = useState<{name: string, date: string, tasks: number, meetings: number}[]>([]);
  const [metrics, setMetrics] = useState({
    timeSavedStr: "0h 0m",
    taskConversionRate: "0%",
    avgActionItems: "0.0"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const json = await res.json();
          setData(json.chartData);
          setMetrics(json.metrics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchAnalytics();
  }, [token]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Analytics</h1>
        <p className="text-muted-foreground">Monitor your productivity and meeting insights.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg bg-background/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>Tasks Completed</CardTitle>
              <CardDescription>Number of tasks completed per day this week.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="99%" height="100%" minWidth={0}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" strokeOpacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
                  <Bar dataKey="tasks" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} animationDuration={1500} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg bg-background/50 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle>Meetings Analyzed</CardTitle>
              <CardDescription>Meetings processed by the AI over time.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="99%" height="100%" minWidth={0}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" strokeOpacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="meetings" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} animationDuration={1500} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg bg-primary/5 border-primary/20 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Time Saved</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <div className="h-8 bg-muted rounded w-1/2 animate-pulse"></div> : <div className="text-3xl font-bold text-primary">{metrics.timeSavedStr}</div>}
              <p className="text-xs text-muted-foreground mt-1">Based on manual note-taking time</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg bg-background/50 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Task Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <div className="h-8 bg-muted rounded w-1/2 animate-pulse"></div> : <div className="text-3xl font-bold">{metrics.taskConversionRate}</div>}
              <p className="text-xs text-muted-foreground mt-1">Action items completed</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
          <Card className="shadow-lg bg-background/50 backdrop-blur-sm border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? <div className="h-8 bg-muted rounded w-1/2 animate-pulse"></div> : <div className="text-3xl font-bold">{metrics.avgActionItems}</div>}
              <p className="text-xs text-muted-foreground mt-1">Per meeting</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
