import mongoose, { Schema, Model, models, Types } from "mongoose";

export interface IAsset {
  _id?: Types.ObjectId;
  ownerId: Types.ObjectId;
  type: "crypto" | "stock";
  symbol: string; // BTC, ETH, AAPL, GOOGL
  name: string;
  quantity: number;
  avgBuyPrice: number; // Precio promedio de compra
  currency: string; // USD, ARS
  exchange?: string; // Binance, Coinbase, NYSE, etc.
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AssetSchema = new Schema<IAsset>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["crypto", "stock"], required: true },
    symbol: { type: String, required: true, uppercase: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    avgBuyPrice: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    exchange: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

// Índice único para evitar duplicados del mismo asset
AssetSchema.index({ ownerId: 1, type: 1, symbol: 1 }, { unique: true });

export const Asset: Model<IAsset> =
  models.Asset || mongoose.model<IAsset>("Asset", AssetSchema);

// Cryptos populares con sus IDs de CoinGecko
export const POPULAR_CRYPTOS = [
  { symbol: "BTC", name: "Bitcoin", coingeckoId: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
  { symbol: "SOL", name: "Solana", coingeckoId: "solana" },
  { symbol: "ADA", name: "Cardano", coingeckoId: "cardano" },
  { symbol: "DOT", name: "Polkadot", coingeckoId: "polkadot" },
  { symbol: "AVAX", name: "Avalanche", coingeckoId: "avalanche-2" },
  { symbol: "MATIC", name: "Polygon", coingeckoId: "matic-network" },
  { symbol: "LINK", name: "Chainlink", coingeckoId: "chainlink" },
  { symbol: "UNI", name: "Uniswap", coingeckoId: "uniswap" },
  { symbol: "XRP", name: "Ripple", coingeckoId: "ripple" },
  { symbol: "USDT", name: "Tether", coingeckoId: "tether" },
  { symbol: "USDC", name: "USD Coin", coingeckoId: "usd-coin" },
];

// Acciones populares
export const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc." },
  { symbol: "GOOGL", name: "Alphabet Inc." },
  { symbol: "MSFT", name: "Microsoft Corp." },
  { symbol: "AMZN", name: "Amazon.com Inc." },
  { symbol: "TSLA", name: "Tesla Inc." },
  { symbol: "META", name: "Meta Platforms" },
  { symbol: "NVDA", name: "NVIDIA Corp." },
  { symbol: "NFLX", name: "Netflix Inc." },
  { symbol: "AMD", name: "Advanced Micro Devices" },
  { symbol: "COIN", name: "Coinbase Global" },
];
