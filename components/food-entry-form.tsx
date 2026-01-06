"use client";

import { useState } from "react";
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
import { toast } from "sonner";

interface FoodEntryFormProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
  defaultValues?: {
    name?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

export function FoodEntryForm({ onSuccess, trigger, defaultValues }: FoodEntryFormProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showMacros, setShowMacros] = useState(false);
  const [formData, setFormData] = useState({
    name: defaultValues?.name || "",
    calories: defaultValues?.calories?.toString() || "",
    protein: defaultValues?.protein?.toString() || "",
    carbs: defaultValues?.carbs?.toString() || "",
    fat: defaultValues?.fat?.toString() || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          calories: parseFloat(formData.calories),
          protein: formData.protein ? parseFloat(formData.protein) : null,
          carbs: formData.carbs ? parseFloat(formData.carbs) : null,
          fat: formData.fat ? parseFloat(formData.fat) : null,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to add food");
      }

      toast.success("Food added!");
      setFormData({ name: "", calories: "", protein: "", carbs: "", fat: "" });
      setOpen(false);
      onSuccess?.();
    } catch {
      toast.error("Failed to add food");
    } finally {
      setIsLoading(false);
    }
  };

  const defaultTrigger = (
    <Button className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-2xl z-40">
      +
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Food</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="food-name">What did you eat?</Label>
            <Input
              id="food-name"
              placeholder="e.g., Chicken salad, Rice bowl..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoFocus
              className="h-12 text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="calories">Calories</Label>
            <Input
              id="calories"
              type="number"
              placeholder="0"
              value={formData.calories}
              onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
              required
              min="0"
              className="h-12 text-lg"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowMacros(!showMacros)}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {showMacros ? "− Hide macros" : "+ Add macros (optional)"}
          </button>

          {showMacros && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label htmlFor="protein" className="text-xs">
                  Protein (g)
                </Label>
                <Input
                  id="protein"
                  type="number"
                  placeholder="0"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs" className="text-xs">
                  Carbs (g)
                </Label>
                <Input
                  id="carbs"
                  type="number"
                  placeholder="0"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat" className="text-xs">
                  Fat (g)
                </Label>
                <Input
                  id="fat"
                  type="number"
                  placeholder="0"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  min="0"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Food"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

