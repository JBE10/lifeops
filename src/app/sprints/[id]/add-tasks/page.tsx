"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  sprintId?: string;
}

export default function AddTasksToSprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Get tasks not assigned to any sprint
    fetch("/api/tasks")
      .then((res) => res.json())
      .then((data) => {
        const unassigned = data.filter((t: Task) => !t.sprintId);
        setAvailableTasks(unassigned);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleTask(taskId: string) {
    setSelectedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }

  async function addTasksToSprint() {
    setSaving(true);
    try {
      await Promise.all(
        Array.from(selectedTasks).map((taskId) =>
          fetch(`/api/tasks/${taskId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sprintId: id }),
          })
        )
      );
      router.push(`/sprints/${id}/board`);
      router.refresh();
    } catch {
      console.error("Error adding tasks to sprint");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/sprints/${id}/board`}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← Volver al Board
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Agregar Tareas al Sprint
              </h1>
            </div>
            <button
              onClick={addTasksToSprint}
              disabled={selectedTasks.size === 0 || saving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition"
            >
              {saving ? "Guardando..." : `Agregar ${selectedTasks.size} tarea(s)`}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {availableTasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No hay tareas disponibles para agregar
            </p>
            <Link
              href="/tasks/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear nueva tarea →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {availableTasks.map((task) => (
              <div
                key={task._id}
                onClick={() => toggleTask(task._id)}
                className={`bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer transition border-2 ${
                  selectedTasks.has(task._id)
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-transparent hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    selectedTasks.has(task._id)
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}>
                    {selectedTasks.has(task._id) && (
                      <span className="text-white text-sm">✓</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-500 text-sm mt-1">
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
                      <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
