import { Transaction } from "@/lib/types"

type MonthlyTotal = {
  monthKey: string // "YYYY-MM"
  total: number
}

export type ForecastResult = {
  category: string
  predictedAmount: number
  confidence: number // 0-1, based on variance
  trend: "up" | "down" | "stable"
}

export function generateForecasts(transactions: Transaction[]): ForecastResult[] {
  // 1. Group by Category and Month
  const history: Record<string, Record<string, number>> = {}
  
  // We only care about last 6 months for a simple model
  const now = new Date()
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)

  transactions.forEach((tx) => {
    const d = new Date(tx.date)
    if (d < sixMonthsAgo) return
    if (Number(tx.amount) <= 0) return // Only spending (debits usually positive in some systems, negative in others. In this app, amount seems positive, type='debit')

    // Check type: ignore credits
    if (tx.type === "credit") return

    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const cat = tx.category || "uncategorized"

    if (!history[cat]) history[cat] = {}
    history[cat][monthKey] = (history[cat][monthKey] || 0) + Number(tx.amount)
  })

  const forecasts: ForecastResult[] = []

  // 2. Compute Forecast per Category
  // Get last 3 completed months
  // e.g. if now is Dec, we want Nov, Oct, Sep
  const months: string[] = []
  for (let i = 1; i <= 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }
  // months is [LastMonth, 2MonthsAgo, 3MonthsAgo] (e.g. Nov, Oct, Sep)

  Object.entries(history).forEach(([category, monthlyData]) => {
    // Get values for the 3 target months, default to 0
    const values = months.map((m) => monthlyData[m] || 0)
    
    // Weights: Most recent month has highest weight
    // W1 (last month) = 0.5, W2 = 0.3, W3 = 0.2
    const prediction = values[0] * 0.5 + values[1] * 0.3 + values[2] * 0.2
    
    // Determine trend
    let trend: "up" | "down" | "stable" = "stable"
    if (values[0] > values[1] * 1.1) trend = "up"
    else if (values[0] < values[1] * 0.9) trend = "down"

    // Simple confidence: if variance is high, confidence is low
    // Here we just use a placeholder logic: if we have data for all 3 months, high confidence
    const dataPoints = values.filter((v) => v > 0).length
    const confidence = dataPoints === 3 ? 0.8 : dataPoints === 2 ? 0.6 : 0.3

    if (prediction > 0) {
      forecasts.push({
        category,
        predictedAmount: Math.round(prediction),
        confidence,
        trend,
      })
    }
  })

  // Sort by highest predicted spend
  return forecasts.sort((a, b) => b.predictedAmount - a.predictedAmount)
}

