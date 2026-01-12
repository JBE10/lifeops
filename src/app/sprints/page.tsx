import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/mongoose";
import { Sprint } from "@/models/Sprint";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  planning: "Planificación",
  active: "Activo",
  completed: "Completado",
};

const statusColors: Record<string, string> = {
  planning: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
};

export default async function SprintsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const sprints = await Sprint.find({ ownerId: session.user.id })
    .sort({ startDate: -1 })
    .lean();

  const activeSprint = sprints.find((s) => s.status === "active");

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
              Sprints
            </h1>
          </div>
          <Link
            href="/sprints/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition"
          >
            + Nuevo Sprint
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Active Sprint Banner */}
        {activeSprint && (
          <Link
            href={`/sprints/${activeSprint._id}/board`}
            className="block mb-8 p-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl text-white hover:from-blue-700 hover:to-blue-800 transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm font-medium">Sprint Activo</p>
                <h2 className="text-2xl font-bold mt-1">{activeSprint.name}</h2>
                {activeSprint.goal && (
                  <p className="text-blue-100 mt-1">{activeSprint.goal}</p>
                )}
                <p className="text-blue-200 text-sm mt-2">
                  {new Date(activeSprint.startDate).toLocaleDateString("es-AR")} → {new Date(activeSprint.endDate).toLocaleDateString("es-AR")}
                </p>
              </div>
              <span className="text-4xl">🏃</span>
            </div>
            <p className="mt-4 text-blue-200 text-sm">Click para ver el Board →</p>
          </Link>
        )}

        {sprints.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No tenés sprints todavía
            </p>
            <Link
              href="/sprints/new"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Crear tu primer sprint →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sprints.map((sprint) => (
              <Link
                key={String(sprint._id)}
                href={`/sprints/${sprint._id}/board`}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {sprint.name}
                  </h2>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[sprint.status]}`}>
                    {statusLabels[sprint.status]}
                  </span>
                </div>
                {sprint.goal && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 line-clamp-2">
                    {sprint.goal}
                  </p>
                )}
                <p className="text-gray-400 text-xs mt-4">
                  {new Date(sprint.startDate).toLocaleDateString("es-AR")} → {new Date(sprint.endDate).toLocaleDateString("es-AR")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
