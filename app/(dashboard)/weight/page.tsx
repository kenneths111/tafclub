"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WeightChart } from "@/components/weight-chart";
import { formatDate } from "@/lib/date-utils";
import { toast } from "sonner";

interface WeightEntry {
  id: string;
  weight: number;
  loggedAt: string;
}

export default function WeightPage() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/weight?limit=30");
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(weight) }),
      });

      if (!res.ok) {
        throw new Error("Failed to log weight");
      }

      toast.success("Weight logged!");
      setWeight("");
      setIsDialogOpen(false);
      fetchEntries();
    } catch {
      toast.error("Failed to log weight");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/weight?id=${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete");
      }

      toast.success("Entry deleted");
      fetchEntries();
    } catch {
      toast.error("Failed to delete entry");
    }
  };

  // Calculate stats
  const latestWeight = entries[0]?.weight;
  const previousWeight = entries[1]?.weight;
  const weightChange =
    latestWeight && previousWeight
      ? (latestWeight - previousWeight).toFixed(1)
      : null;
  const firstWeight = entries[entries.length - 1]?.weight;
  const totalChange =
    latestWeight && firstWeight && entries.length > 1
      ? (latestWeight - firstWeight).toFixed(1)
      : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Weight Tracking</h1>
          <p className="text-gray-500">Monitor your weight progress over time</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
              + Log Weight
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Log Today&apos;s Weight</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 75.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  required
                  autoFocus
                  className="h-12 text-lg"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging..." : "Log Weight"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-500 mb-1">
              Current Weight
            </p>
            <p className="text-4xl font-bold text-gray-800">
              {latestWeight ? `${latestWeight} kg` : "—"}
            </p>
            {entries[0] && (
              <p className="text-xs text-gray-400 mt-2">
                Last logged: {formatDate(entries[0].loggedAt)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-500 mb-1">
              Since Last Entry
            </p>
            <p
              className={`text-4xl font-bold ${
                weightChange
                  ? parseFloat(weightChange) < 0
                    ? "text-emerald-600"
                    : parseFloat(weightChange) > 0
                    ? "text-amber-600"
                    : "text-gray-800"
                  : "text-gray-800"
              }`}
            >
              {weightChange ? `${parseFloat(weightChange) > 0 ? "+" : ""}${weightChange} kg` : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {weightChange
                ? parseFloat(weightChange) < 0
                  ? "Great progress! 🎉"
                  : parseFloat(weightChange) > 0
                  ? "Stay focused!"
                  : "Steady!"
                : "Log more to see changes"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-gray-500 mb-1">
              Total Change
            </p>
            <p
              className={`text-4xl font-bold ${
                totalChange
                  ? parseFloat(totalChange) < 0
                    ? "text-emerald-600"
                    : parseFloat(totalChange) > 0
                    ? "text-amber-600"
                    : "text-gray-800"
                  : "text-gray-800"
              }`}
            >
              {totalChange ? `${parseFloat(totalChange) > 0 ? "+" : ""}${totalChange} kg` : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {entries.length > 1
                ? `Over ${entries.length} entries`
                : "Log more to track progress"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <WeightChart entries={entries} />

      {/* History */}
      {entries.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold text-gray-800">
              Recent Entries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {entries.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div>
                  <p className="font-medium text-gray-800">{entry.weight} kg</p>
                  <span className="text-xs text-gray-500">
                    {formatDate(entry.loggedAt, "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(entry.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                >
                  ✕
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

