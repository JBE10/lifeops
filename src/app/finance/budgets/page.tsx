"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";

const EXPENSE_CATEGORIES = [
  "Alimentos",
  "Transporte",
  "Vivienda",
  "Servicios",
  "Salud",
  "Entretenimiento",
  "Ropa",
  "Educación",
  "Tecnología",
  "Otros",
];

interface Budget {
  _id: string;
  category: string;
  amount: number;
  month?: number;
  year: number;
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formCategory, setFormCategory] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    fetch(`/api/finance/budgets?year=${currentYear}&month=${currentMonth}`)
      .then((r) => r.json())
      .then(setBudgets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentMonth, currentYear]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/finance/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: formCategory,
          amount: parseFloat(formAmount),
          month: currentMonth,
          year: currentYear,
        }),
      });

      if (res.ok) {
        const newBudget = await res.json();
        setBudgets((prev) => {
          const existing = prev.findIndex((b) => b.category === newBudget.category);
          if (existing >= 0) {
            const updated = [...prev];
            updated[existing] = newBudget;
            return updated;
          }
          return [...prev, newBudget];
        });
        setFormCategory("");
        setFormAmount("");
        setShowForm(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

  const monthName = now.toLocaleDateString("es-AR", { month: "long", year: "numeric" });

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
            <Link href="/finance" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              ← Finanzas
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Presupuestos
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
          >
            + Agregar
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-gray-600 dark:text-gray-400 mb-6 capitalize">
          Presupuestos para {monthName}
        </p>

        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Nuevo Presupuesto
            </h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría
                </label>
                <select
                  required
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Seleccionar</option>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Monto límite
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition"
              >
                {saving ? "Guardando..." : "Guardar"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Budgets List */}
        {budgets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              No tenés presupuestos configurados
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Crear tu primer presupuesto →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {budget.category}
                  </h3>
                  <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(budget.amount)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  Límite mensual para gastos de {budget.category.toLowerCase()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
