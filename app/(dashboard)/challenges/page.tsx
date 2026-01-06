"use client";

import { useEffect, useState, useCallback } from "react";
import { format, isPast, isFuture, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Add the select component
import { cn } from "@/lib/utils";

interface Participant {
  id: string;
  userId: string;
  progress: number;
  user: {
    id: string;
    name: string;
  };
}

interface Challenge {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  goalType: string;
  goalValue: number;
  createdBy: {
    id: string;
    name: string;
  };
  participants: Participant[];
  isParticipant: boolean;
  isCreator: boolean;
  participantCount: number;
}

const goalTypes = [
  { value: "streak", label: "Daily Logging Streak", unit: "days" },
  { value: "calories", label: "Stay Under Calories", unit: "cal/day" },
  { value: "weight_loss", label: "Weight Loss", unit: "kg" },
];

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
    goalType: "streak",
    goalValue: "",
  });

  const fetchChallenges = useCallback(async () => {
    try {
      const res = await fetch("/api/challenges");
      const data = await res.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to create challenge");
      }

      toast.success("Challenge created!");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        description: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
        goalType: "streak",
        goalValue: "",
      });
      fetchChallenges();
    } catch {
      toast.error("Failed to create challenge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const res = await fetch("/api/challenges/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });

      if (!res.ok) {
        throw new Error("Failed to join challenge");
      }

      toast.success("Joined challenge!");
      fetchChallenges();
    } catch {
      toast.error("Failed to join challenge");
    }
  };

  const handleLeaveChallenge = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/challenges/join?challengeId=${challengeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to leave challenge");
      }

      toast.success("Left challenge");
      fetchChallenges();
    } catch {
      toast.error("Failed to leave challenge");
    }
  };

  const getChallengeStatus = (challenge: Challenge) => {
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);
    const now = new Date();

    if (isFuture(start)) {
      return { status: "upcoming", label: "Upcoming", color: "bg-blue-100 text-blue-700" };
    }
    if (isPast(end)) {
      return { status: "ended", label: "Ended", color: "bg-gray-100 text-gray-700" };
    }
    if (isWithinInterval(now, { start, end })) {
      return { status: "active", label: "Active", color: "bg-emerald-100 text-emerald-700" };
    }
    return { status: "unknown", label: "Unknown", color: "bg-gray-100 text-gray-700" };
  };

  const getGoalTypeConfig = (goalType: string) => {
    return goalTypes.find((t) => t.value === goalType) || goalTypes[0];
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Challenges</h1>
          <p className="text-gray-500">Compete with friends and stay motivated</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white">
              + Create Challenge
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Challenge</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateChallenge} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Challenge Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., 2-Week Logging Streak"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Describe the challenge..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type</Label>
                <Select
                  value={formData.goalType}
                  onValueChange={(value) => setFormData({ ...formData, goalType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goalValue">
                  Goal Value ({getGoalTypeConfig(formData.goalType).unit})
                </Label>
                <Input
                  id="goalValue"
                  type="number"
                  placeholder="e.g., 14"
                  value={formData.goalValue}
                  onChange={(e) => setFormData({ ...formData, goalValue: e.target.value })}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Challenge"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {challenges.length === 0 ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎯</span>
            </div>
            <p className="text-gray-500">No challenges yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create the first challenge to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {challenges.map((challenge) => {
            const status = getChallengeStatus(challenge);
            const goalConfig = getGoalTypeConfig(challenge.goalType);

            return (
              <Card key={challenge.id} className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {challenge.name}
                      </CardTitle>
                      {challenge.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {challenge.description}
                        </p>
                      )}
                    </div>
                    <Badge className={cn("font-medium", status.color)}>
                      {status.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {format(new Date(challenge.startDate), "MMM d")} -{" "}
                      {format(new Date(challenge.endDate), "MMM d, yyyy")}
                    </span>
                    <span className="font-medium text-emerald-600">
                      Goal: {challenge.goalValue} {goalConfig.unit}
                    </span>
                  </div>

                  {/* Participants */}
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {challenge.participants.slice(0, 5).map((p) => (
                        <div
                          key={p.id}
                          className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                          title={p.user.name}
                        >
                          {getInitials(p.user.name)}
                        </div>
                      ))}
                      {challenge.participantCount > 5 && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                          +{challenge.participantCount - 5}
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {challenge.participantCount} participant
                      {challenge.participantCount !== 1 && "s"}
                    </span>
                  </div>

                  {/* Progress (for active participants) */}
                  {challenge.isParticipant && status.status === "active" && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Your Progress</span>
                        <span className="font-medium">
                          {challenge.participants.find((p) => p.user.id === challenge.createdBy.id)?.progress || 0} /{" "}
                          {challenge.goalValue}
                        </span>
                      </div>
                      <Progress value={30} className="h-2" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2">
                    {!challenge.isParticipant ? (
                      <Button
                        onClick={() => handleJoinChallenge(challenge.id)}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white"
                        disabled={status.status === "ended"}
                      >
                        Join Challenge
                      </Button>
                    ) : (
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                          ✓ Joined
                        </Badge>
                        {!challenge.isCreator && status.status !== "ended" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLeaveChallenge(challenge.id)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            Leave
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

