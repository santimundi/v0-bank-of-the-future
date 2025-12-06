import { NextResponse } from "next/server"
import { createDirectClient } from "@/lib/supabase/direct-client"
import { detectUnusualActivity } from "@/lib/transactions/detect-unusual"
import { Transaction } from "@/lib/types"

const BATCH_SIZE = 100

export async function POST() {
  const supabase = createDirectClient()

  // Fetch last 90 days of transactions for context
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const { data: allTransactions, error } = await supabase
    .from("transactions")
    .select("*")
    .gte("date", ninetyDaysAgo.toISOString())
    .order("date", { ascending: false })

  if (error) {
    console.error("[detect-unusual] Failed to fetch transactions", error.message)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }

  // Map to our Type
  const transactions: Transaction[] = (allTransactions || []).map((t: any) => ({
    ...t,
    amount: Number(t.amount),
  }))

  // We only want to update transactions that haven't been checked or need re-check (e.g. recent ones)
  // For simplicity, let's re-check the last 30 days of transactions
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentTransactions = transactions.filter(
    (t) => new Date(t.date) >= thirtyDaysAgo
  )

  const updates: any[] = []

  for (const tx of recentTransactions) {
    const result = detectUnusualActivity(tx, transactions)

    // Only update if status changed or wasn't set
    // We assume db column names match: is_unusual, unusual_reason
    // Original data might have them as null
    const currentIsUnusual = (tx as any).is_unusual
    
    if (result.isUnusual !== currentIsUnusual) {
       updates.push({
         id: tx.id,
         is_unusual: result.isUnusual,
         unusual_reason: result.reason
       })
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ processed: recentTransactions.length, updated: 0 })
  }

  // Batch update
  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE)
    const { error: updateError } = await supabase.from("transactions").upsert(batch)
    if (updateError) {
      console.error("[detect-unusual] Failed to upsert batch", updateError.message)
      return NextResponse.json({ error: "Failed to update flags" }, { status: 500 })
    }
  }

  return NextResponse.json({
    processed: recentTransactions.length,
    updated: updates.length,
  })
}





