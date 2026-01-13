"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Transaction {
  _id: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  category: string;
  description?: string;
  date: string;
}

interface Stats {
  summary: {
    income: number;
    expenses: number;
    balance: number;
  };
  byCategory: {
    expenses: { category: string; total: number }[];
  };
  budgets: {
    category: string;
    amount: number;
    spent: number;
    percentage: number;
  }[];
}

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/finance/transactions?month=${selectedMonth}&limit=20`).then((r) => r.json()),
      fetch(`/api/finance/stats?month=${selectedMonth}`).then((r) => r.json()),
    ])
      .then(([txData, statsData]) => {
        setTransactions(txData.transactions || []);
        setStats(statsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedMonth]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(amount);
  };

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
              Finanzas
            </h1>
          </div>
          <div className="flex gap-2">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <Link
              href="/finance/portfolio"
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition"
            >
              📊 Portfolio
            </Link>
            <Link
              href="/finance/new"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
            >
              + Transacción
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Ingresos</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                {formatCurrency(stats.summary.income)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Gastos</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400 mt-1">
                {formatCurrency(stats.summary.expenses)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
              <p className={`text-3xl font-bold mt-1 ${
                stats.summary.balance >= 0 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formatCurrency(stats.summary.balance)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transactions List */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transacciones
              </h2>
              <Link href="/finance/transactions" className="text-sm text-emerald-600 hover:text-emerald-700">
                Ver todas →
              </Link>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.length === 0 ? (
                <p className="p-6 text-gray-500 text-center">
                  No hay transacciones este mes
                </p>
              ) : (
                transactions.map((tx) => (
                  <div key={tx._id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        tx.type === "income" 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : "bg-red-100 dark:bg-red-900/30"
                      }`}>
                        {tx.type === "income" ? "💰" : "💸"}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tx.category}
                        </p>
                        <p className="text-sm text-gray-500">
                          {tx.description || new Date(tx.date).toLocaleDateString("es-AR")}
                        </p>
                      </div>
                    </div>
                    <p className={`font-semibold ${
                      tx.type === "income" 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* By Category */}
            {stats && stats.byCategory.expenses.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Gastos por Categoría
                </h3>
                <div className="space-y-3">
                  {stats.byCategory.expenses.slice(0, 5).map((cat) => (
                    <div key={cat.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{cat.category}</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (cat.total / stats.summary.expenses) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Budgets */}
            {stats && stats.budgets.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Presupuestos
                  </h3>
                  <Link href="/finance/budgets" className="text-sm text-emerald-600">
                    Gestionar
                  </Link>
                </div>
                <div className="space-y-4">
                  {stats.budgets.map((budget) => (
                    <div key={budget.category}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{budget.category}</span>
                        <span className={`font-medium ${
                          budget.percentage > 100 ? "text-red-500" : "text-gray-900 dark:text-white"
                        }`}>
                          {budget.percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            budget.percentage > 100 
                              ? "bg-red-500" 
                              : budget.percentage > 80 
                                ? "bg-yellow-500" 
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(100, budget.percentage)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Add */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                <Link
                  href="/finance/new?type=expense"
                  className="block w-full py-2 px-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                >
                  💸 Registrar Gasto
                </Link>
                <Link
                  href="/finance/new?type=income"
                  className="block w-full py-2 px-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-center font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition"
                >
                  💰 Registrar Ingreso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
