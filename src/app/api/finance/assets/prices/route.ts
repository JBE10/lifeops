import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/mongoose";
import { Asset, POPULAR_CRYPTOS } from "@/models/Asset";

interface CoinGeckoPrice {
  usd: number;
  usd_24h_change: number;
}

interface CoinGeckoResponse {
  [key: string]: CoinGeckoPrice;
}

// GET - Obtener precios actuales de los activos del usuario
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const assets = await Asset.find({ ownerId: session.user.id }).lean();

    if (assets.length === 0) {
      return NextResponse.json({ assets: [], totals: { crypto: 0, stocks: 0, total: 0 } });
    }

    // Separar cryptos y stocks
    const cryptoAssets = assets.filter((a) => a.type === "crypto");
    const stockAssets = assets.filter((a) => a.type === "stock");

    // Obtener precios de cryptos desde CoinGecko (gratis, sin API key)
    let cryptoPrices: Record<string, { price: number; change24h: number }> = {};

    if (cryptoAssets.length > 0) {
      const cryptoIds = cryptoAssets
        .map((a) => {
          const crypto = POPULAR_CRYPTOS.find(
            (c) => c.symbol === a.symbol.toUpperCase()
          );
          return crypto?.coingeckoId;
        })
        .filter(Boolean);

      if (cryptoIds.length > 0) {
        try {
          const cgRes = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoIds.join(",")}&vs_currencies=usd&include_24hr_change=true`,
            { next: { revalidate: 60 } } // Cache por 1 minuto
          );

          if (cgRes.ok) {
            const cgData: CoinGeckoResponse = await cgRes.json();
            
            // Mapear a símbolos
            for (const crypto of POPULAR_CRYPTOS) {
              if (cgData[crypto.coingeckoId]) {
                cryptoPrices[crypto.symbol] = {
                  price: cgData[crypto.coingeckoId].usd,
                  change24h: cgData[crypto.coingeckoId].usd_24h_change || 0,
                };
              }
            }
          }
        } catch (error) {
          console.error("CoinGecko API error:", error);
        }
      }
    }

    // Para stocks, usamos datos simulados (para producción usar Alpha Vantage, Yahoo Finance, etc.)
    // En producción integrar con: https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=IBM&apikey=demo
    const stockPrices: Record<string, { price: number; change24h: number }> = {
      AAPL: { price: 185.5, change24h: 1.2 },
      GOOGL: { price: 142.3, change24h: -0.5 },
      MSFT: { price: 378.9, change24h: 0.8 },
      AMZN: { price: 178.2, change24h: 2.1 },
      TSLA: { price: 248.5, change24h: -1.8 },
      META: { price: 505.6, change24h: 1.5 },
      NVDA: { price: 875.3, change24h: 3.2 },
      NFLX: { price: 485.7, change24h: 0.3 },
      AMD: { price: 145.8, change24h: -0.9 },
      COIN: { price: 178.4, change24h: 4.5 },
    };

    // Calcular valores actuales y P&L
    const assetsWithPrices = assets.map((asset) => {
      const prices = asset.type === "crypto" ? cryptoPrices : stockPrices;
      const priceData = prices[asset.symbol.toUpperCase()];

      const currentPrice = priceData?.price || asset.avgBuyPrice;
      const change24h = priceData?.change24h || 0;
      const currentValue = currentPrice * asset.quantity;
      const costBasis = asset.avgBuyPrice * asset.quantity;
      const totalPnL = currentValue - costBasis;
      const totalPnLPercent = costBasis > 0 ? (totalPnL / costBasis) * 100 : 0;

      return {
        ...asset,
        currentPrice,
        change24h,
        currentValue,
        costBasis,
        totalPnL,
        totalPnLPercent,
      };
    });

    // Calcular totales
    const cryptoTotal = assetsWithPrices
      .filter((a) => a.type === "crypto")
      .reduce((sum, a) => sum + a.currentValue, 0);

    const stocksTotal = assetsWithPrices
      .filter((a) => a.type === "stock")
      .reduce((sum, a) => sum + a.currentValue, 0);

    const totalCostBasis = assetsWithPrices.reduce((sum, a) => sum + a.costBasis, 0);
    const totalCurrentValue = cryptoTotal + stocksTotal;
    const totalPnL = totalCurrentValue - totalCostBasis;

    return NextResponse.json({
      assets: assetsWithPrices,
      totals: {
        crypto: cryptoTotal,
        stocks: stocksTotal,
        total: totalCurrentValue,
        costBasis: totalCostBasis,
        pnl: totalPnL,
        pnlPercent: totalCostBasis > 0 ? (totalPnL / totalCostBasis) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("GET /api/finance/assets/prices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
