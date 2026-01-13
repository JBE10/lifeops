"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface KeyResult {
  title: string;
  targetValue: number;
  unit: string;
  startValue: number;
}

const quarters = ["Q1", "Q2", "Q3", "Q4"];
const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear + 1];

export default function NewOKRPage() {
  const router = useRouter();
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [quarter, setQuarter] = useState(() => {
    const month = new Date().getMonth();
    return `Q${Math.floor(month / 3) + 1}`;
  });
  const [year, setYear] = useState(currentYear);
  const [keyResults, setKeyResults] = useState<KeyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // KR form
  const [krTitle, setKrTitle] = useState("");
  const [krTarget, setKrTarget] = useState<number | "">("");
  const [krUnit, setKrUnit] = useState("%");
  const [krStart, setKrStart] = useState<number | "">(0);

  function addKeyResult() {
    if (!krTitle.trim() || !krTarget) return;
    setKeyResults([
      ...keyResults,
      {
        title: krTitle.trim(),
        targetValue: krTarget,
        unit: krUnit,
        startValue: krStart || 0,
      },
    ]);
    setKrTitle("");
    setKrTarget("");
    setKrUnit("%");
    setKrStart(0);
  }

  function removeKeyResult(index: number) {
    setKeyResults(keyResults.filter((_, i) => i !== index));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (keyResults.length === 0) {
      setError("Agregá al menos un Key Result");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/okrs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objective,
          description,
          quarter,
          year,
          keyResults: keyResults.map((kr) => ({
            ...kr,
            currentValue: kr.startValue,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al crear OKR");
        return;
      }

      router.push("/okrs");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/okrs"
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ← OKRs
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Nuevo OKR
            </h1>
          </div>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Objective */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              🎯 Objetivo
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                ¿Qué querés lograr? *
              </label>
              <input
                type="text"
                required
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="Ej: Mejorar mi salud física"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="¿Por qué es importante este objetivo?"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trimestre
                </label>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  {quarters.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Año
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Key Results */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              📊 Key Results
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Los Key Results son métricas medibles que indican si lograste tu objetivo.
            </p>

            {/* KR List */}
            {keyResults.length > 0 && (
              <div className="space-y-2 mb-4">
                {keyResults.map((kr, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">{kr.title}</span>
                      <span className="text-gray-500 ml-2">
                        {kr.startValue} → {kr.targetValue} {kr.unit}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeKeyResult(i)}
                      className="text-red-500 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add KR Form */}
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <input
                type="text"
                value={krTitle}
                onChange={(e) => setKrTitle(e.target.value)}
                placeholder="Ej: Hacer ejercicio X veces por semana"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              />
              <div className="grid grid-cols-4 gap-2">
                <input
                  type="number"
                  value={krStart}
                  onChange={(e) => setKrStart(e.target.value ? parseInt(e.target.value) : "")}
                  placeholder="Inicio"
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="number"
                  value={krTarget}
                  onChange={(e) => setKrTarget(e.target.value ? parseInt(e.target.value) : "")}
                  placeholder="Meta"
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
                <select
                  value={krUnit}
                  onChange={(e) => setKrUnit(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="%">%</option>
                  <option value="veces">veces</option>
                  <option value="horas">horas</option>
                  <option value="días">días</option>
                  <option value="kg">kg</option>
                  <option value="$">$</option>
                  <option value="unidades">unidades</option>
                </select>
                <button
                  type="button"
                  onClick={addKeyResult}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium rounded-lg transition"
            >
              {loading ? "Creando..." : "🎯 Crear OKR"}
            </button>
            <Link
              href="/okrs"
              className="py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}
