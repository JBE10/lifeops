"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";

interface AssetWithPrice {
  _id: string;
  type: "crypto" | "stock";
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  change24h: number;
  currentValue: number;
  costBasis: number;
  totalPnL: number;
  totalPnLPercent: number;
}

interface Totals {
  crypto: number;
  stocks: number;
  total: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
}

const POPULAR_CRYPTOS = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "ADA", name: "Cardano" },
  { symbol: "DOT", name: "Polkadot" },
  { symbol: "AVAX", name: "Avalanche" },
  { symbol: "MATIC", name: "Polygon" },
  { symbol: "LINK", name: "Chainlink" },
  { symbol: "XRP", name: "Ripple" },
];

const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "NFLX", name: "Netflix Inc." },
];

export default function PortfolioPage() {
  const [assets, setAssets] = useState<AssetWithPrice[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"crypto" | "stock">("crypto");
  const [formSymbol, setFormSymbol] = useState("");
  const [formQuantity, setFormQuantity] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    setLoading(true);
    fetch("/api/finance/assets/prices")
      .then((r) => r.json())
      .then((data) => {
        setAssets(data.assets || []);
        setTotals(data.totals);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
    // Auto-refresh cada 60 segundos
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(2)}%`;
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const options = formType === "crypto" ? POPULAR_CRYPTOS : POPULAR_STOCKS;
    const selected = options.find((o) => o.symbol === formSymbol);

    try {
      const res = await fetch("/api/finance/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          symbol: formSymbol,
          name: selected?.name || formSymbol,
          quantity: parseFloat(formQuantity),
          avgBuyPrice: parseFloat(formPrice),
        }),
      });

      if (res.ok) {
        setFormSymbol("");
        setFormQuantity("");
        setFormPrice("");
        setShowForm(false);
        loadData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este activo?")) return;
    
    try {
      await fetch(`/api/finance/assets/${id}`, { method: "DELETE" });
      loadData();
    } catch (error) {
      console.error(error);
    }
  }

  const cryptoAssets = assets.filter((a) => a.type === "crypto");
  const stockAssets = assets.filter((a) => a.type === "stock");

  if (loading && assets.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Cargando portfolio...</p>
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
              Portfolio
            </h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
          >
            + Agregar Activo
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Totals */}
        {totals && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Valor Total</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {formatUSD(totals.total)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">P&L Total</p>
              <p className={`text-3xl font-bold mt-1 ${
                totals.pnl >= 0 ? "text-green-600" : "text-red-600"
              }`}>
                {formatUSD(totals.pnl)}
              </p>
              <p className={`text-sm ${totals.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatPercent(totals.pnlPercent)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Crypto</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">
                {formatUSD(totals.crypto)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Acciones</p>
              <p className="text-2xl font-bold text-blue-500 mt-1">
                {formatUSD(totals.stocks)}
              </p>
            </div>
          </div>
        )}

        {/* Add Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Agregar Activo
            </h3>
            
            {/* Type Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => { setFormType("crypto"); setFormSymbol(""); }}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  formType === "crypto"
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 ring-2 ring-orange-500"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                🪙 Crypto
              </button>
              <button
                type="button"
                onClick={() => { setFormType("stock"); setFormSymbol(""); }}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  formType === "stock"
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 ring-2 ring-blue-500"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                📈 Acciones
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {formType === "crypto" ? "Crypto" : "Acción"}
                </label>
                <select
                  required
                  value={formSymbol}
                  onChange={(e) => setFormSymbol(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Seleccionar</option>
                  {(formType === "crypto" ? POPULAR_CRYPTOS : POPULAR_STOCKS).map((opt) => (
                    <option key={opt.symbol} value={opt.symbol}>
                      {opt.symbol} - {opt.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cantidad
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  min="0"
                  value={formQuantity}
                  onChange={(e) => setFormQuantity(e.target.value)}
                  placeholder="0.5"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Precio de compra (USD)
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  min="0"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  placeholder="45000"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium rounded-lg transition"
                >
                  {saving ? "..." : "Agregar"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Assets Tables */}
        {assets.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Tu portfolio está vacío
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Agregar tu primer activo →
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Crypto Table */}
            {cryptoAssets.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    🪙 Cryptomonedas
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">24h</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">P&L</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {cryptoAssets.map((asset) => (
                        <tr key={asset._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">{asset.symbol}</span>
                              <span className="text-sm text-gray-500">{asset.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                            {asset.quantity.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                          </td>
                          <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                            {formatUSD(asset.currentPrice)}
                          </td>
                          <td className={`px-4 py-4 text-right font-medium ${
                            asset.change24h >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {formatPercent(asset.change24h)}
                          </td>
                          <td className="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white">
                            {formatUSD(asset.currentValue)}
                          </td>
                          <td className={`px-4 py-4 text-right ${
                            asset.totalPnL >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            <div>{formatUSD(asset.totalPnL)}</div>
                            <div className="text-xs">{formatPercent(asset.totalPnLPercent)}</div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDelete(asset._id)}
                              className="text-red-500 hover:text-red-600 text-sm"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Stocks Table */}
            {stockAssets.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    📈 Acciones
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activo</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">24h</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">P&L</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {stockAssets.map((asset) => (
                        <tr key={asset._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">{asset.symbol}</span>
                              <span className="text-sm text-gray-500">{asset.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                            {asset.quantity}
                          </td>
                          <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                            {formatUSD(asset.currentPrice)}
                          </td>
                          <td className={`px-4 py-4 text-right font-medium ${
                            asset.change24h >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            {formatPercent(asset.change24h)}
                          </td>
                          <td className="px-4 py-4 text-right font-semibold text-gray-900 dark:text-white">
                            {formatUSD(asset.currentValue)}
                          </td>
                          <td className={`px-4 py-4 text-right ${
                            asset.totalPnL >= 0 ? "text-green-600" : "text-red-600"
                          }`}>
                            <div>{formatUSD(asset.totalPnL)}</div>
                            <div className="text-xs">{formatPercent(asset.totalPnLPercent)}</div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDelete(asset._id)}
                              className="text-red-500 hover:text-red-600 text-sm"
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Los precios de crypto se actualizan cada 60 segundos via CoinGecko
        </p>
      </div>
    </main>
  );
}
