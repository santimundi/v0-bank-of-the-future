import { Transaction } from "@/lib/types"

export type UnusualResult = {
  isUnusual: boolean
  reason: string | null
}

export function detectUnusualActivity(
  transaction: Transaction,
  history: Transaction[]
): UnusualResult {
  const { amount, category, date, description, merchant } = transaction
  const amountNum = Number(amount)

  // 1. High Value Check
  if (amountNum > 5000) {
    return {
      isUnusual: true,
      reason: "High value transaction (> AED 5,000)",
    }
  }

  // 2. Duplicate Check (same amount, merchant/desc, same day)
  const isDuplicate = history.some(
    (h) =>
      h.id !== transaction.id &&
      Number(h.amount) === amountNum &&
      (h.merchant === merchant || h.description === description) &&
      h.date.split("T")[0] === date.split("T")[0]
  )

  if (isDuplicate) {
    return {
      isUnusual: true,
      reason: "Potential duplicate transaction",
    }
  }

  // 3. Category Outlier ( > 2.5x average for category)
  // Filter history for same category, excluding the current tx
  const categoryTx = history.filter(
    (h) => h.category === category && h.id !== transaction.id && Number(h.amount) > 0
  )

  if (categoryTx.length >= 5) {
    const total = categoryTx.reduce((sum, t) => sum + Number(t.amount), 0)
    const avg = total / categoryTx.length
    
    if (amountNum > avg * 2.5 && amountNum > 100) { // Threshold to avoid flagging small coffee variations
      return {
        isUnusual: true,
        reason: `Unusually high for ${category} (Avg: AED ${avg.toFixed(0)})`,
      }
    }
  }

  return { isUnusual: false, reason: null }
}


