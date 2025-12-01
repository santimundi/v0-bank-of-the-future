"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRole } from "@/lib/role-context"
import { formatCurrency, formatAccountNumber, formatDate, getCategoryColor, getStatusColor } from "@/lib/format"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ArrowUpRight, ArrowDownRight, Search, TrendingUp, Bot, Copy, Eye, EyeOff, RefreshCw, Loader2, Sparkles } from "lucide-react"
import type { Account, Transaction } from "@/lib/types"
import { AskAIBankerWidget, AskAIButton } from "@/components/ai/ask-ai-banker-widget"
import { createClient } from "@/lib/supabase/client"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

function AccountCard({ account, onClick }: { account: Account; onClick: () => void }) {
  const [showBalance, setShowBalance] = useState(true)

  const getAccountIcon = () => {
    switch (account.type) {
      case "savings":
        return "💰"
      case "business":
        return "🏢"
      case "fx_wallet":
        return "💱"
      default:
        return "💳"
    }
  }

  return (
    <Card className="cursor-pointer hover:bg-muted/30 transition-colors" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-2xl">
              {getAccountIcon()}
            </div>
            <div>
              <p className="font-medium">{account.name}</p>
              <p className="text-sm text-muted-foreground">{formatAccountNumber(account.accountNumber)}</p>
            </div>
          </div>
          <Badge variant="secondary" className={getStatusColor(account.status)}>
            {account.status}
          </Badge>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Available Balance</p>
            <p className="text-2xl font-bold">
              {showBalance ? formatCurrency(account.availableBalance, account.currency) : "••••••"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              setShowBalance(!showBalance)
            }}
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionsTable({
  transactions,
  accounts = [],
  showFilters = true,
}: { transactions: Transaction[]; accounts?: Account[]; showFilters?: boolean }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [accountFilter, setAccountFilter] = useState<string>("all")

  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      const matchesSearch =
        txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.merchant?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "all" || txn.category === categoryFilter
      const matchesType = typeFilter === "all" || txn.type === typeFilter
      const matchesAccount = accountFilter === "all" || txn.accountId === accountFilter
      return matchesSearch && matchesCategory && matchesType && matchesAccount
    })
  }, [transactions, searchQuery, categoryFilter, typeFilter, accountFilter])

  const categories = [...new Set(transactions.map((t) => t.category))]

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            {accounts.length > 0 && (
              <Select value={accountFilter} onValueChange={setAccountFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Accounts</SelectItem>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name} (...{acc.accountNumber.slice(-4)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="capitalize">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Income</SelectItem>
                <SelectItem value="debit">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Total Income</p>
              <p className="text-lg font-bold text-emerald-500">+{formatCurrency(totalIncome)}</p>
            </div>
            <div className="h-full w-px bg-border" />
            <div>
              <p className="text-xs text-muted-foreground">Total Expense</p>
              <p className="text-lg font-bold text-foreground">-{formatCurrency(totalExpense)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3">Description</th>
                <th className="text-left text-xs font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Category
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3">Amount</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/20 group">
                  <td className="px-4 py-3 text-sm">{formatDate(txn.date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                          txn.type === "credit" ? "bg-emerald-500/20" : "bg-muted"
                        }`}
                      >
                        {txn.type === "credit" ? (
                          <ArrowDownRight className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{txn.description}</p>
                        {txn.merchant && <p className="text-xs text-muted-foreground truncate">{txn.merchant}</p>}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <AskAIButton 
                          initialQuestion={`Explain this transaction: ${txn.description} for ${formatCurrency(txn.amount)} on ${formatDate(txn.date)}`}
                        >
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Sparkles className="h-3 w-3 text-primary" />
                          </Button>
                        </AskAIButton>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <Badge variant="secondary" className={`text-xs ${getCategoryColor(txn.category)}`}>
                      {txn.category}
                    </Badge>
                  </td>
                  <td
                    className={`px-4 py-3 text-sm font-medium text-right ${
                      txn.type === "credit" ? "text-emerald-500" : "text-foreground"
                    }`}
                  >
                    {txn.type === "credit" ? "+" : "-"}
                    {formatCurrency(txn.amount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground text-right hidden md:table-cell">
                    {formatCurrency(txn.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No transactions found matching your filters.</div>
      )}
    </div>
  )
}

function AccountInsightsPanel({ account, transactions }: { account: Account, transactions: Transaction[] }) {
  // Use passed transactions instead of fetching them
  const thisMonthSpend = transactions
    .filter((t) => {
        const d = new Date(t.date)
        const now = new Date()
        return t.type === "debit" && 
               d.getMonth() === now.getMonth() && 
               d.getFullYear() === now.getFullYear()
    })
    .reduce((sum, t) => sum + t.amount, 0)

  const recurringPayments = [
    { name: "DEWA", amount: 450, day: 5 },
    { name: "Etisalat", amount: 299, day: 15 },
    { name: "Netflix", amount: 55, day: 22 },
  ]

  // Prepare data for the chart (last 6 months spending)
  const chartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const today = new Date()
    const data = []
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
        const monthName = months[d.getMonth()]
        
        // Calculate spend for this month from transactions
        const monthlySpend = transactions
            .filter(t => {
                const tDate = new Date(t.date)
                return t.type === 'debit' && 
                       tDate.getMonth() === d.getMonth() && 
                       tDate.getFullYear() === d.getFullYear()
            })
            .reduce((sum, t) => sum + t.amount, 0)
            
        data.push({ name: monthName, spend: monthlySpend })
    }
    return data
  }, [transactions])

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <CardTitle className="text-sm">AI Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Your spending this month is{" "}
            <span className="text-foreground font-medium">{formatCurrency(thisMonthSpend)}</span>.
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
              Account Ledger
            </Badge>
            <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20 text-primary">
              Transactions
            </Badge>
          </div>
          <Button variant="link" size="sm" className="px-0 mt-2 text-primary" asChild>
            <Link href={`/ai-banker?scope=account:${account.id}`}>Ask more about this account</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
            <CardTitle className="text-sm">Spending History</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis 
                            dataKey="name" 
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
                            tickFormatter={(value) => `${value}`} 
                        />
                        <Tooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(value: number) => [formatCurrency(value), 'Spend']}
                        />
                        <Bar 
                            dataKey="spend" 
                            fill="currentColor" 
                            className="fill-primary" 
                            radius={[4, 4, 0, 0]} 
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Recurring Payments Detected</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recurringPayments.map((payment, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{payment.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-muted-foreground">Day {payment.day}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Cashflow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center bg-muted/30 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Projected balance in 30 days</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(account.balance + 8500)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AccountsPage() {
  const { currentUser } = useRole()
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!currentUser?.id) return

      setIsLoading(true)
      const supabase = createClient()

      // Fetch Accounts
      console.log("Fetching accounts for user:", currentUser?.id)
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", currentUser.id)

      if (accountsError) {
        console.error("Error fetching accounts FULL OBJECT:", JSON.stringify(accountsError, null, 2))
        console.error("Error details:", accountsError.message, accountsError.details, accountsError.hint)
      }
      
      const mappedAccounts: Account[] = (accountsData || []).map((a: any) => ({
        id: a.id,
        userId: a.user_id,
        name: a.name,
        type: a.type,
        currency: a.currency,
        balance: Number(a.balance),
        availableBalance: Number(a.available_balance),
        accountNumber: a.account_number,
        iban: a.iban,
        status: a.status
      }))
      
      setAccounts(mappedAccounts)

      // Fetch Transactions
      if (mappedAccounts.length > 0) {
        const accountIds = mappedAccounts.map(a => a.id)
        const { data: txData, error: txError } = await supabase
          .from("transactions")
          .select("*")
          .in("account_id", accountIds)
          .order("date", { ascending: false })

        if (txError) console.error("Error fetching transactions:", txError)

        const mappedTransactions: Transaction[] = (txData || []).map((t: any) => ({
          id: t.id,
          accountId: t.account_id,
          date: t.date,
          description: t.description,
          merchant: t.merchant,
          category: t.category,
          amount: Number(t.amount),
          balance: Number(t.balance_after),
          type: t.type,
          status: t.status,
          reference: t.reference
        }))
        
        setTransactions(mappedTransactions)
      } else {
        setTransactions([])
      }
      
      setIsLoading(false)
    }

    fetchData()
  }, [currentUser])

  const displayedTransactions = useMemo(() => {
    if (selectedAccount) {
      return transactions.filter(t => t.accountId === selectedAccount.id)
    }
    return transactions
  }, [transactions, selectedAccount])

  const totalBalance = useMemo(() => accounts.reduce((sum, acc) => {
    const rate = acc.currency === "USD" ? 3.67 : 1
    return sum + acc.balance * rate
  }, 0), [accounts])

  const aiQuestions = [
    "What's my current account balance?",
    "Show my spending breakdown this month",
    "Which account has the highest interest rate?",
    "How can I reduce my monthly fees?",
  ]

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Accounts" description="Manage your accounts and view transactions" />

      {/* Total Balance Card */}
      <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30">
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          <p className="text-4xl font-bold">{formatCurrency(totalBalance)}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Accounts Grid - takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <Sheet key={account.id}>
                <SheetTrigger asChild>
                  <div>
                    <AccountCard account={account} onClick={() => setSelectedAccount(account)} />
                  </div>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                  <SheetHeader>
                    <SheetTitle>{account.name}</SheetTitle>
                    <SheetDescription>Account details and insights</SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-6">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Account Number</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{formatAccountNumber(account.accountNumber, false)}</p>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Currency</p>
                          <p className="text-sm font-medium">{account.currency}</p>
                        </div>
                        {account.iban && (
                          <div className="col-span-2">
                            <p className="text-xs text-muted-foreground">IBAN</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium font-mono">{account.iban}</p>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <AccountInsightsPanel 
                      account={account} 
                      transactions={transactions.filter(t => t.accountId === account.id)} 
                    />
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        </div>

        {/* AI Banker Widget - takes 1 column on the side */}
        <div className="lg:col-span-1">
          <AskAIBankerWidget questions={aiQuestions} description="Get insights about your accounts" />
        </div>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {selectedAccount ? `Showing transactions for ${selectedAccount.name}` : "All account transactions"}
            </CardDescription>
          </div>
          {selectedAccount && (
            <Button variant="ghost" size="sm" onClick={() => setSelectedAccount(null)}>
              Show All
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <TransactionsTable transactions={displayedTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}
