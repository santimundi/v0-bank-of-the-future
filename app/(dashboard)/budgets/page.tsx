"use client"

import { useState, useEffect, useMemo } from "react"
import { useRole } from "@/lib/role-context"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, getCategoryColor } from "@/lib/format"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2, PiggyBank, Plus, Save } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts"

type Budget = {
  id: string
  category: string
  amount: number
  spend: number
  forecast: number
}

const CATEGORIES = [
  "groceries", "restaurants", "shopping", "entertainment", 
  "utilities", "transport", "travel", "healthcare"
]

export default function BudgetsPage() {
  const { currentUser } = useRole()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [trends, setTrends] = useState<any[]>([])
  const [view, setView] = useState<"overview" | "trends">("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedBudgets, setEditedBudgets] = useState<Record<string, number>>({})

  useEffect(() => {
    async function fetchData() {
      if (!currentUser?.id) return
      setIsLoading(true)
      const supabase = createClient()

      // 1. Fetch Existing Budgets
      const { data: budgetData } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", currentUser.id)

      // 2. Fetch Transactions for this month (for actuals) and last 3 months (for forecast)
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString()

      const { data: txData } = await supabase
        .from("transactions")
        .select("amount, category, date, type")
        .eq("type", "debit") // Only spending
        .in("account_id", (await supabase.from("accounts").select("id").eq("user_id", currentUser.id)).data?.map(a => a.id) || [])
        .gte("date", threeMonthsAgo)

      // 3. Process Data
      const currentMonthSpend: Record<string, number> = {}
      const historySpend: Record<string, number[]> = {} // [Month-1, Month-2, Month-3]

      txData?.forEach(tx => {
        const cat = (tx.category || "uncategorized").toLowerCase()
        const txDate = new Date(tx.date)
        
        // Current Month
        if (txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()) {
           currentMonthSpend[cat] = (currentMonthSpend[cat] || 0) + Number(tx.amount)
        } 
        // History (Simple gathering)
        else {
           // We could use this for complex forecast, but let's stick to simple avg for now
           historySpend[cat] = [...(historySpend[cat] || []), Number(tx.amount)]
        }
      })

      // 4. Merge into Budget Objects
      const budgetMap = new Map(budgetData?.map(b => [b.category.toLowerCase(), Number(b.amount)]) || [])
      
      // Ensure all major categories exist
      const mergedBudgets: Budget[] = CATEGORIES.map(cat => {
        const limit = budgetMap.get(cat) || 0
        const spend = currentMonthSpend[cat] || 0
        
        // Simple Forecast: Spend / DaysPassed * TotalDays
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
        const daysPassed = now.getDate()
        const forecast = daysPassed > 0 ? (spend / daysPassed) * daysInMonth : 0

        return {
          id: cat, // using category as ID for UI simplicity
          category: cat,
          amount: limit,
          spend,
          forecast: Math.round(forecast)
        }
      }).filter(b => b.amount > 0 || b.spend > 0) // Only show active categories

      // Sort: Over-budget first, then high spend
      mergedBudgets.sort((a, b) => (b.spend / (b.amount || 1)) - (a.spend / (a.amount || 1)))

      setBudgets(mergedBudgets)
      setEditedBudgets(Object.fromEntries(mergedBudgets.map(b => [b.category, b.amount])))

      // 5. Calculate Trends
      const trendData = []
      const currentTotalBudget = mergedBudgets.reduce((sum, b) => sum + b.amount, 0)
      
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = d.toLocaleString('default', { month: 'short' })
        
        const monthSpend = txData?.filter(tx => {
            const tDate = new Date(tx.date)
            return tDate.getMonth() === d.getMonth() && tDate.getFullYear() === d.getFullYear()
        }).reduce((sum, tx) => sum + Number(tx.amount), 0) || 0

        trendData.push({
            month: label,
            spend: monthSpend,
            budget: currentTotalBudget // Use current budget as reference line
        })
      }
      setTrends(trendData)

      setIsLoading(false)
    }

    fetchData()
  }, [currentUser])

  const totalBudget = budgets.reduce((sum, b) => sum + (isEditing ? (editedBudgets[b.category] || 0) : b.amount), 0)
  const totalSpend = budgets.reduce((sum, b) => sum + b.spend, 0)
  const totalForecast = budgets.reduce((sum, b) => sum + b.forecast, 0)
  const projectedSavings = Math.max(0, totalBudget - totalForecast)

  const handleSave = async () => {
    // Save changes to DB
    const supabase = createClient()
    const updates = Object.entries(editedBudgets).map(([cat, amount]) => ({
      user_id: currentUser.id,
      category: cat,
      amount: amount
    }))

    // Upsert logic (simplest way is delete all for user & insert, or proper upsert)
    // Since we don't have unique constraints on (user, category) yet, let's assume we do or handle carefully
    // Actually, let's loop upsert for safety
    for (const update of updates) {
       // Check if exists
       const { data: existing } = await supabase.from("budgets").select("id").eq("user_id", currentUser.id).eq("category", update.category).single()
       if (existing) {
         await supabase.from("budgets").update({ amount: update.amount }).eq("id", existing.id)
       } else if (update.amount > 0) {
         await supabase.from("budgets").insert(update)
       }
    }
    
    setIsEditing(false)
    // Refetch would be better, but we updated local state effectively
    setBudgets(prev => prev.map(b => ({ ...b, amount: editedBudgets[b.category] || b.amount })))
  }

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>

  return (
    <div className="space-y-6">
      <PageHeader title="Smart Budgeting" description="Plan your expenses and maximize savings" />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Spent: {formatCurrency(totalSpend)} ({Math.round(totalSpend / totalBudget * 100)}%)
            </p>
            <Progress value={(totalSpend / totalBudget) * 100} className="h-2 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Projected Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-2">
              {formatCurrency(totalForecast)}
              {totalForecast > totalBudget ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on current spending velocity
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-500/10 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Potential Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(projectedSavings)}</div>
            <p className="text-xs text-emerald-600/80 mt-1">
              Available for investment if you stick to plan
            </p>
            <Button size="sm" className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white h-8">
              <PiggyBank className="h-3 w-3 mr-2" /> Invest Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex justify-end">
        <div className="flex bg-muted rounded-lg p-1">
          <Button 
            variant={view === "overview" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setView("overview")}
            className="text-xs h-8"
          >
            Current Status
          </Button>
          <Button 
            variant={view === "trends" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => setView("trends")}
            className="text-xs h-8"
          >
            6-Month Trends
          </Button>
        </div>
      </div>

      {view === "overview" ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Adjust your limits to reach your goals</CardDescription>
            </div>
            <Button variant={isEditing ? "default" : "outline"} onClick={() => isEditing ? handleSave() : setIsEditing(true)}>
              {isEditing ? <><Save className="h-4 w-4 mr-2" /> Save Changes</> : "Adjust Budgets"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {budgets.map((budget) => {
              const percentage = budget.amount > 0 ? (budget.spend / budget.amount) * 100 : 0
              const isOver = percentage > 100
              const colorClass = isOver ? "bg-red-500" : percentage > 85 ? "bg-yellow-500" : "bg-primary"
              
              return (
                <div key={budget.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={`capitalize ${getCategoryColor(budget.category)}`}>
                        {budget.category}
                      </Badge>
                      {isOver && (
                        <Badge variant="destructive" className="text-[10px] py-0 px-1">
                          Over Budget
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          {formatCurrency(budget.spend)} 
                          <span className="text-muted-foreground font-normal"> of </span>
                          {isEditing ? (
                            <Input 
                              type="number" 
                              className="inline-block w-24 h-7 text-right ml-1"
                              value={editedBudgets[budget.category]}
                              onChange={(e) => setEditedBudgets(prev => ({ ...prev, [budget.category]: Number(e.target.value) }))}
                            />
                          ) : (
                            formatCurrency(budget.amount)
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Forecast: {formatCurrency(budget.forecast)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${colorClass}`} 
                      style={{ width: `${Math.min(percentage, 100)}%` }} 
                    />
                    {/* Forecast Marker */}
                    {budget.amount > 0 && (
                      <div 
                        className="absolute top-0 bottom-0 w-1 bg-black/20 z-10"
                        style={{ left: `${Math.min((budget.forecast / budget.amount) * 100, 100)}%` }}
                        title={`Forecast: ${formatCurrency(budget.forecast)}`}
                      />
                    )}
                  </div>
                </div>
              )
            })}
            
            {isEditing && (
               <Button variant="ghost" className="w-full border-dashed border-2">
                  <Plus className="h-4 w-4 mr-2" /> Add Category
               </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
            <CardDescription>Total monthly spending vs. current budget limit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends}>
                  <XAxis 
                    dataKey="month" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${formatCurrency(value).replace('AED', '')}`} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Spend']}
                  />
                  <Bar dataKey="spend" fill="#000000" radius={[4, 4, 0, 0]}>
                    {trends.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.spend > entry.budget ? "#ef4444" : "#10b981"} />
                    ))}
                  </Bar>
                  <ReferenceLine y={totalBudget} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Budget Limit', position: 'insideTopRight', fill: '#f59e0b', fontSize: 12 }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

