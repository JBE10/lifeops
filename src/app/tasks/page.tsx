import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/mongoose";
import { Task } from "@/models/Task";
import { Project } from "@/models/Project";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  backlog: "Backlog",
  todo: "Por hacer",
  in_progress: "En progreso",
  done: "Completado",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  medium: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  high: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  urgent: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  backlog: "bg-gray-100 text-gray-600",
  todo: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  
  const [tasks, projects] = await Promise.all([
    Task.find({ ownerId: session.user.id })
      .sort({ priority: -1, createdAt: -1 })
      .populate("projectId", "name")
      .lean(),
    Project.find({ ownerId: session.user.id, status: "active" })
      .select("name")
      .lean(),
  ]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Tareas
            </h1>
          </div>
          <Link
            href="/tasks/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            + Nueva Tarea
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tasks.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No tenés tareas todavía
            </p>
            <Link
              href="/tasks/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear tu primera tarea →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={String(task._id)}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[task.status]}`}>
                        {statusLabels[task.status]}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      {task.projectId && (
                        <span>📁 {(task.projectId as unknown as { name: string }).name}</span>
                      )}
                      {task.dueDate && (
                        <span>📅 {new Date(task.dueDate).toLocaleDateString("es-AR")}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/tasks/${task._id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Editar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
