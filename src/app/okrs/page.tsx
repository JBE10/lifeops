"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface KeyResult {
  _id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startValue?: number;
}

interface OKR {
  _id: string;
  objective: string;
  description?: string;
  quarter: string;
  year: number;
  status: string;
  keyResults: KeyResult[];
  progress: number;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  active: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

const statusLabels: Record<string, string> = {
  draft: "Borrador",
  active: "Activo",
  completed: "Completado",
  cancelled: "Cancelado",
};

function getCurrentQuarter(): { quarter: string; year: number } {
  const now = new Date();
  const month = now.getMonth();
  const quarter = `Q${Math.floor(month / 3) + 1}`;
  return { quarter, year: now.getFullYear() };
}

export default function OKRsPage() {
  const [okrs, setOkrs] = useState<OKR[]>([]);
  const [loading, setLoading] = useState(true);
  const { quarter: currentQuarter, year: currentYear } = getCurrentQuarter();

  useEffect(() => {
    fetch("/api/okrs")
      .then((r) => r.json())
      .then(setOkrs)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeOkrs = okrs.filter((o) => o.status === "active");
  const currentQuarterOkrs = okrs.filter(
    (o) => o.quarter === currentQuarter && o.year === currentYear
  );

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ← Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              OKRs
            </h1>
          </div>
          <Link
            href="/okrs/new"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition"
          >
            + Nuevo OKR
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Quarter Summary */}
        {currentQuarterOkrs.length > 0 && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm font-medium">
                  {currentQuarter} {currentYear}
                </p>
                <p className="text-3xl font-bold mt-1">
                  {currentQuarterOkrs.length} Objetivo{currentQuarterOkrs.length !== 1 ? "s" : ""}
                </p>
                <p className="text-purple-200 text-sm mt-1">
                  {activeOkrs.length} activo{activeOkrs.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="text-6xl">🎯</div>
            </div>
          </div>
        )}

        {/* OKRs List */}
        {okrs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No tenés OKRs definidos
            </p>
            <Link
              href="/okrs/new"
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              Crear tu primer OKR →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {okrs.map((okr) => (
              <div
                key={okr._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-gray-500">
                        {okr.quarter} {okr.year}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[okr.status]}`}>
                        {statusLabels[okr.status]}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {okr.objective}
                    </h3>
                    {okr.description && (
                      <p className="text-gray-500 text-sm mt-1">{okr.description}</p>
                    )}
                  </div>
                  <Link
                    href={`/okrs/${okr._id}`}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                  >
                    Ver detalle →
                  </Link>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-500">Progreso general</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {okr.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${okr.progress}%` }}
                    />
                  </div>
                </div>

                {/* Key Results */}
                {okr.keyResults.length > 0 && (
                  <div className="space-y-2">
                    {okr.keyResults.map((kr, i) => {
                      const range = kr.targetValue - (kr.startValue || 0);
                      const progress = range > 0
                        ? Math.round(((kr.currentValue - (kr.startValue || 0)) / range) * 100)
                        : 0;
                      return (
                        <div key={kr._id || i} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                {kr.title}
                              </span>
                              <span className="text-gray-500">
                                {kr.currentValue}/{kr.targetValue} {kr.unit}
                              </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-purple-400 rounded-full"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
