import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/mongoose";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();

  // Obtener stats
  const [projectCount, taskStats] = await Promise.all([
    Project.countDocuments({ ownerId: session.user.id, status: "active" }),
    Task.aggregate([
      { $match: { ownerId: session.user.id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const pendingTasks = taskStats
    .filter((s) => s._id !== "done")
    .reduce((acc, s) => acc + s.count, 0);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            LifeOps
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {session.user.email}
            </span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Cerrar sesión
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            <Link
              href="/dashboard"
              className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium text-sm"
            >
              Dashboard
            </Link>
            <Link
              href="/projects"
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium text-sm"
            >
              Proyectos
            </Link>
            <Link
              href="/tasks"
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium text-sm"
            >
              Tareas
            </Link>
            <Link
              href="/sprints"
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium text-sm"
            >
              Sprints
            </Link>
            <Link
              href="/okrs"
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium text-sm"
            >
              OKRs
            </Link>
            <Link
              href="/habits"
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium text-sm"
            >
              Hábitos
            </Link>
            <Link
              href="/fitness"
              className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium text-sm"
            >
              Fitness
            </Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bienvenido, {session.user.name || session.user.email}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Tu dashboard personal está listo
          </p>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/projects" className="block">
            <StatCard 
              title="Proyectos" 
              value={String(projectCount)} 
              subtitle="Activos" 
              color="blue" 
            />
          </Link>
          <Link href="/tasks" className="block">
            <StatCard 
              title="Tareas" 
              value={String(pendingTasks)} 
              subtitle="Pendientes" 
              color="amber" 
            />
          </Link>
          <Link href="/sprints" className="block">
            <StatCard 
              title="Sprint" 
              value="-" 
              subtitle="Actual" 
              color="green" 
            />
          </Link>
          <Link href="/okrs" className="block">
            <StatCard 
              title="OKRs" 
              value="0" 
              subtitle="Este trimestre" 
              color="purple" 
            />
          </Link>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            href="/tasks/new"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <span className="text-2xl">✏️</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Nueva Tarea</p>
              <p className="text-sm text-gray-500">Crear tarea rápida</p>
            </div>
          </Link>
          <Link
            href="/projects/new"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <span className="text-2xl">📁</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Nuevo Proyecto</p>
              <p className="text-sm text-gray-500">Organizar trabajo</p>
            </div>
          </Link>
          <Link
            href="/sprints"
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition"
          >
            <span className="text-2xl">🏃</span>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Ver Sprint</p>
              <p className="text-sm text-gray-500">Board Kanban</p>
            </div>
          </Link>
        </div>

        {/* Placeholder sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tareas de hoy
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No hay tareas con fecha límite hoy.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actividad reciente
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No hay actividad reciente.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: "blue" | "amber" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            {subtitle}
          </p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <div className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
