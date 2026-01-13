"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
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
}

const statusOptions = [
  { id: "draft", label: "Borrador" },
  { id: "active", label: "Activo" },
  { id: "completed", label: "Completado" },
  { id: "cancelled", label: "Cancelado" },
];

export default function OKRDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [okr, setOkr] = useState<OKR | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/okrs/${id}`)
      .then((r) => r.json())
      .then(setOkr)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function updateKeyResult(krId: string, currentValue: number) {
    if (!okr) return;

    // Optimistic update
    setOkr({
      ...okr,
      keyResults: okr.keyResults.map((kr) =>
        kr._id === krId ? { ...kr, currentValue } : kr
      ),
    });

    try {
      await fetch(`/api/okrs/${id}/key-results/${krId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue }),
      });
    } catch {
      // Refresh on error
      fetch(`/api/okrs/${id}`)
        .then((r) => r.json())
        .then(setOkr);
    }
  }

  async function updateStatus(status: string) {
    if (!okr) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/okrs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updated = await res.json();
      setOkr(updated);
    } catch {
      console.error("Error updating status");
    } finally {
      setSaving(false);
    }
  }

  async function deleteOKR() {
    if (!confirm("¿Eliminar este OKR?")) return;

    try {
      await fetch(`/api/okrs/${id}`, { method: "DELETE" });
      router.push("/okrs");
    } catch {
      console.error("Error deleting OKR");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!okr) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">OKR no encontrado</p>
      </div>
    );
  }

  // Calculate overall progress
  const progress =
    okr.keyResults.length > 0
      ? Math.round(
          okr.keyResults.reduce((sum, kr) => {
            const range = kr.targetValue - (kr.startValue || 0);
            if (range === 0) return sum + 100;
            const p = ((kr.currentValue - (kr.startValue || 0)) / range) * 100;
            return sum + Math.min(Math.max(p, 0), 100);
          }, 0) / okr.keyResults.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/okrs"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                ← OKRs
              </Link>
              <span className="text-sm text-gray-500">
                {okr.quarter} {okr.year}
              </span>
            </div>
            <button
              onClick={deleteOKR}
              className="text-red-500 hover:text-red-600 text-sm"
            >
              Eliminar
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Objective Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {okr.objective}
              </h1>
              {okr.description && (
                <p className="text-gray-500 mt-1">{okr.description}</p>
              )}
            </div>
            <select
              value={okr.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={saving}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              {statusOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Overall Progress */}
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Progreso general</span>
              <span className="text-2xl font-bold text-purple-600">{progress}%</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Results */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📊 Key Results
        </h2>
        <div className="space-y-4">
          {okr.keyResults.map((kr) => {
            const range = kr.targetValue - (kr.startValue || 0);
            const krProgress = range > 0
              ? Math.round(((kr.currentValue - (kr.startValue || 0)) / range) * 100)
              : 0;

            return (
              <div
                key={kr._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {kr.title}
                  </h3>
                  <span className={`text-sm font-medium ${
                    krProgress >= 100 ? "text-green-600" : 
                    krProgress >= 70 ? "text-blue-600" : 
                    krProgress >= 30 ? "text-yellow-600" : "text-gray-500"
                  }`}>
                    {krProgress}%
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          krProgress >= 100 ? "bg-green-500" : 
                          krProgress >= 70 ? "bg-blue-500" : 
                          krProgress >= 30 ? "bg-yellow-500" : "bg-gray-400"
                        }`}
                        style={{ width: `${Math.min(krProgress, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={kr.currentValue}
                      onChange={(e) => updateKeyResult(kr._id, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-sm text-center rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    />
                    <span className="text-gray-500 text-sm">
                      / {kr.targetValue} {kr.unit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
