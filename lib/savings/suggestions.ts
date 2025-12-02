import { Transaction } from "@/lib/types"

export type SavingSuggestion = {
  id: string
  title: string
  description: string
  potentialSavings: number // Monthly
  type: "subscription" | "fees" | "habit" | "general"
  confidence: "high" | "medium" | "low"
}

export function generateSavingsSuggestions(transactions: Transaction[]): SavingSuggestion[] {
  const suggestions: SavingSuggestion[] = []
  
  // 1. Recurring Subscriptions
  // Heuristic: Same merchant, same amount, regular intervals (we'll just look for duplicates > 2 times)
  const subscriptions: Record<string, { count: number, amount: number, merchant: string }> = {}
  
  transactions.forEach(tx => {
    if (tx.category === 'subscriptions' || tx.category === 'entertainment' || tx.description.toLowerCase().includes('subscription')) {
       const key = `${tx.merchant || tx.description}-${tx.amount}`
       if (!subscriptions[key]) subscriptions[key] = { count: 0, amount: tx.amount, merchant: tx.merchant || tx.description }
       subscriptions[key].count++
    }
  })

  Object.values(subscriptions).forEach(sub => {
    if (sub.count >= 2) {
      suggestions.push({
        id: `sub-${sub.merchant.replace(/\s+/g, '-')}`,
        title: `Review Subscription: ${sub.merchant}`,
        description: `You have a recurring payment of AED ${sub.amount}. Do you still use this?`,
        potentialSavings: sub.amount,
        type: "subscription",
        confidence: "high"
      })
    }
  })

  // 2. High Fees
  const fees = transactions.filter(tx => tx.category === 'fees')
  const totalFees = fees.reduce((sum, tx) => sum + tx.amount, 0)
  
  if (totalFees > 50) {
    suggestions.push({
      id: "reduce-fees",
      title: "Reduce Bank Fees",
      description: `You spent AED ${totalFees.toFixed(0)} on fees recently. Check if you can switch accounts or avoid ATM charges.`,
      potentialSavings: totalFees,
      type: "fees",
      confidence: "medium"
    })
  }

  // 3. Dining vs Groceries
  // If Dining > 2x Groceries, suggest cooking
  const dining = transactions.filter(tx => tx.category === 'restaurants').reduce((sum, tx) => sum + tx.amount, 0)
  const groceries = transactions.filter(tx => tx.category === 'groceries').reduce((sum, tx) => sum + tx.amount, 0)

  if (dining > groceries * 2 && dining > 1000) {
    const potential = dining * 0.3 // Assume 30% saving by cooking
    suggestions.push({
      id: "cook-more",
      title: "Cook at Home",
      description: `Your dining spend (AED ${dining.toFixed(0)}) is significantly higher than groceries. Cooking more could save you money.`,
      potentialSavings: Math.round(potential),
      type: "habit",
      confidence: "medium"
    })
  }

  // 4. Transport: Taxi/Ride-hailing check
  const rides = transactions.filter(tx => 
    tx.category === 'transport' && 
    (tx.description.toLowerCase().includes('uber') || tx.description.toLowerCase().includes('careem'))
  ).reduce((sum, tx) => sum + tx.amount, 0)

  if (rides > 1500) {
    suggestions.push({
      id: "transport-costs",
      title: "High Ride-Sharing Costs",
      description: `You spent AED ${rides.toFixed(0)} on rides. Consider a monthly pass or car rental/public transport if feasible.`,
      potentialSavings: Math.round(rides * 0.2),
      type: "habit",
      confidence: "medium"
    })
  }

  return suggestions.sort((a, b) => b.potentialSavings - a.potentialSavings).slice(0, 3)
}


