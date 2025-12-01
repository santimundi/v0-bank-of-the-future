type CategoryResult = {
  category: string | null
  confidence: number
  reason: string
}

const CATEGORY_RULES: Array<{
  category: string
  keywords: string[]
  confidence?: number
}> = [
  { category: "entertainment", keywords: ["netflix", "cinema", "movie", "theatre", "spotify", "concert"] },
  { category: "transport", keywords: ["uber", "careem", "taxi", "metro", "transport", "fuel", "petrol", "parking"] },
  { category: "groceries", keywords: ["carrefour", "spinneys", "supermarket", "grocery", "waitrose", "lulu"] },
  { category: "utilities", keywords: ["dewa", "etisalat", "du", "water", "electric", "utility", "internet"] },
  { category: "restaurants", keywords: ["restaurant", "zuma", "eatery", "food", "cafe", "coffee", "dining", "kitchen"] },
  { category: "travel", keywords: ["emirates", "hotel", "flight", "travel", "booking", "airbnb"] },
  { category: "shopping", keywords: ["mall", "boutique", "store", "marketplace", "retail", "fashion", "apparel"] },
  { category: "healthcare", keywords: ["hospital", "clinic", "pharmacy", "medical", "health"] },
  { category: "fees", keywords: ["fee", "charge", "service fee", "maintenance"] },
  { category: "other", keywords: ["subscription", "plan", "membership", "school", "university", "course", "tuition", "learning"] },
]

const LARGE_SPEND_THRESHOLD = 50000

export function inferCategory({
  description,
  merchant,
  amount,
}: {
  description?: string | null
  merchant?: string | null
  amount?: number | null
}): CategoryResult {
  const text = `${description ?? ""} ${merchant ?? ""}`.toLowerCase().trim()
  if (!text) {
    return {
      category: null,
      confidence: 0,
      reason: "No description or merchant available",
    }
  }

  if (typeof amount === "number" && amount >= LARGE_SPEND_THRESHOLD && text.includes("deposit")) {
    return {
      category: "investment",
      confidence: 0.8,
      reason: `Large transfer (>= AED ${LARGE_SPEND_THRESHOLD.toLocaleString()}) flagged as investment`,
    }
  }

  for (const rule of CATEGORY_RULES) {
    const matchedKeyword = rule.keywords.find((keyword) => text.includes(keyword))
    if (matchedKeyword) {
      return {
        category: rule.category,
        confidence: rule.confidence ?? 0.92,
        reason: `Matched keyword "${matchedKeyword}"`,
      }
    }
  }

  if (text.includes("payment to")) {
    return {
      category: "other",
      confidence: 0.6,
      reason: "Generic payment detected",
    }
  }

  return {
    category: null,
    confidence: 0,
    reason: "No rule matched",
  }
}

