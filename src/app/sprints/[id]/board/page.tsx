"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: "backlog" | "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high" | "urgent";
}

interface Sprint {
  _id: string;
  name: string;
  goal?: string;
  status: string;
  startDate: string;
  endDate: string;
}

const columns = [
  { id: "backlog", title: "Backlog", color: "bg-gray-500" },
  { id: "todo", title: "Por Hacer", color: "bg-yellow-500" },
  { id: "in_progress", title: "En Progreso", color: "bg-blue-500" },
  { id: "done", title: "Completado", color: "bg-green-500" },
];

const priorityColors: Record<string, string> = {
  low: "border-l-gray-400",
  medium: "border-l-blue-400",
  high: "border-l-orange-400",
  urgent: "border-l-red-500",
};

export default function SprintBoardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sprint, setSprint] = useState<Sprint | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggingTask, setDraggingTask] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sprints/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSprint(data.sprint);
        setTasks(data.tasks || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function updateTaskStatus(taskId: string, newStatus: string) {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus as Task["status"] } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch {
      // Revert on error
      fetch(`/api/sprints/${id}`)
        .then((res) => res.json())
        .then((data) => setTasks(data.tasks || []));
    }
  }

  async function activateSprint() {
    try {
      await fetch(`/api/sprints/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });
      setSprint((prev) => (prev ? { ...prev, status: "active" } : prev));
    } catch {
      console.error("Error activating sprint");
    }
  }

  function handleDragStart(taskId: string) {
    setDraggingTask(taskId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(status: string) {
    if (draggingTask) {
      updateTaskStatus(draggingTask, status);
      setDraggingTask(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Sprint no encontrado</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/sprints" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                ← Sprints
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {sprint.name}
                </h1>
                {sprint.goal && (
                  <p className="text-gray-500 text-sm">{sprint.goal}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              {sprint.status === "planning" && (
                <button
                  onClick={activateSprint}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                >
                  🚀 Activar Sprint
                </button>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                sprint.status === "active" 
                  ? "bg-green-100 text-green-700" 
                  : sprint.status === "completed"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {sprint.status === "active" ? "Activo" : sprint.status === "completed" ? "Completado" : "Planificación"}
              </span>
              <span className="text-sm text-gray-500">
                {new Date(sprint.startDate).toLocaleDateString("es-AR")} → {new Date(sprint.endDate).toLocaleDateString("es-AR")}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-6 min-w-max">
          {columns.map((column) => {
            const columnTasks = tasks.filter((t) => t.status === column.id);
            return (
              <div
                key={column.id}
                className="w-80 flex-shrink-0"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-3 h-3 rounded-full ${column.color}`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                  <span className="text-gray-400 text-sm">({columnTasks.length})</span>
                </div>

                {/* Tasks */}
                <div className="space-y-3 min-h-[200px] bg-gray-200/50 dark:bg-gray-800/50 rounded-lg p-3">
                  {columnTasks.map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={() => handleDragStart(task._id)}
                      className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm cursor-move border-l-4 ${priorityColors[task.priority]} hover:shadow-md transition`}
                    >
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          task.priority === "urgent" ? "bg-red-100 text-red-700" :
                          task.priority === "high" ? "bg-orange-100 text-orange-700" :
                          task.priority === "medium" ? "bg-blue-100 text-blue-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {columnTasks.length === 0 && (
                    <p className="text-gray-400 text-sm text-center py-8">
                      Arrastrá tareas aquí
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Task to Sprint */}
      <div className="fixed bottom-6 right-6">
        <Link
          href={`/sprints/${id}/add-tasks`}
          className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full shadow-lg transition"
        >
          <span>+ Agregar Tareas</span>
        </Link>
      </div>
    </main>
  );
}
