"use client";

import { useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Phase, Task } from "@/lib/parse-plan";

interface PhaseSectionProps {
  phase: Phase;
  onToggleTask: (taskId: string) => void;
  onAddTask: (phaseId: string, text: string) => void;
}

export function PhaseSection({
  phase,
  onToggleTask,
  onAddTask,
}: PhaseSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");

  const completedCount = phase.tasks.filter((t) => t.done).length;
  const totalCount = phase.tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(phase.id, newTaskText.trim());
      setNewTaskText("");
      setIsAdding(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            !isOpen && "-rotate-90"
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate font-semibold text-card-foreground">
              {phase.name}
            </h3>
            {phase.hours && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {phase.hours}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="shrink-0 text-xs font-medium text-muted-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="border-t px-4 pb-4 pt-2">
          <ul className="flex flex-col gap-1">
            {phase.tasks.map((task) => (
              <TaskItem key={task.id} task={task} onToggle={onToggleTask} />
            ))}
          </ul>

          {isAdding ? (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                placeholder="New task..."
                autoFocus
                className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button size="sm" onClick={handleAddTask}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskText("");
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="mt-2 gap-1.5 text-xs text-muted-foreground"
            >
              <Plus className="h-3 w-3" />
              Add Task
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function TaskItem({
  task,
  onToggle,
}: {
  task: Task;
  onToggle: (id: string) => void;
}) {
  return (
    <li className="group flex items-start gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50">
      <Checkbox
        id={task.id}
        checked={task.done}
        onCheckedChange={() => onToggle(task.id)}
        className={cn(
          "mt-0.5 h-5 w-5 rounded-md border-2 transition-all",
          task.done &&
            "border-success bg-success text-success-foreground data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-success-foreground"
        )}
      />
      <label
        htmlFor={task.id}
        className={cn(
          "flex-1 cursor-pointer text-sm leading-relaxed transition-all",
          task.done
            ? "text-muted-foreground line-through"
            : "text-card-foreground"
        )}
      >
        {task.text}
      </label>
    </li>
  );
}
