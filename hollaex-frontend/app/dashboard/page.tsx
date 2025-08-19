"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Shield,
  RefreshCw,
} from "lucide-react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

// Mock data
const mockStats = {
  totalUsers: 1247,
  totalDeposits: "125,430.50",
  totalWithdrawals: "98,230.25",
  pendingWithdrawals: 5,
  masterBalance: "27,200.25",
  trxBalance: "1,250.00",
}

const mockUserPoints = {
  balance: "1,250.75",
  lockedBalance: "150.00",
}

const mockTransactions = [
  {
    id: "1",
    type: "DEPOSIT",
    amount: "100.00",
    status: "CONFIRMED",
    date: "2024-01-15T10:30:00Z",
    txHash: "0x1234...5678",
  },
  { id: "2", type: "WITHDRAWAL", amount: "50.00", status: "PENDING", date: "2024-01-14T15:45:00Z" },
  {
    id: "3",
    type: "DEPOSIT",
    amount: "200.00",
    status: "CONFIRMED",
    date: "2024-01-13T09:15:00Z",
    txHash: "0x8765...4321",
  },
]

const chartData = [
  { name: "Jan", deposits: 4000, withdrawals: 2400 },
  { name: "Feb", deposits: 3000, withdrawals: 1398 },
  { name: "Mar", deposits: 2000, withdrawals: 9800 },
  { name: "Apr", deposits: 2780, withdrawals: 3908 },
  { name: "May", deposits: 1890, withdrawals: 4800 },
  { name: "Jun", deposits: 2390, withdrawals: 3800 },
]

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const formatCurrency = (amount: string) => `$${amount} USDT`
  const formatPoints = (amount: string) => `${amount} POINTS`

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">HD Wallet</span>
              </div>
              <Badge variant="secondary" className="security-badge">
                <Shield className="w-3 h-3 mr-1" />
                Secure
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/deposit">Deposit</Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/withdraw">Withdraw</Link>
              </Button>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your wallet overview.</p>
        </div>

        {/* User Balance Card */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Your Balance</h2>
                  <p className="text-4xl font-bold mb-2">{formatPoints(mockUserPoints.balance)}</p>
                  {mockUserPoints.lockedBalance !== "0" && (
                    <p className="text-primary-foreground/80">Locked: {formatPoints(mockUserPoints.lockedBalance)}</p>
                  )}
                  <div className="flex items-center mt-4 space-x-4">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href="/deposit">
                        <ArrowDownLeft className="w-4 h-4 mr-2" />
                        Deposit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/withdraw">
                        <ArrowUpRight className="w-4 h-4 mr-2" />
                        Withdraw
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <Wallet className="w-20 h-20 opacity-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Deposits</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(mockStats.totalDeposits)}</p>
                </div>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Withdrawals</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(mockStats.totalWithdrawals)}</p>
                </div>
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-chart-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Withdrawals</p>
                  <p className="text-2xl font-bold text-foreground">{mockStats.pendingWithdrawals}</p>
                </div>
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-chart-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Master Balance</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(mockStats.masterBalance)}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Transaction Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction Overview</CardTitle>
              <CardDescription>Monthly deposits and withdrawals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="deposits"
                    stackId="1"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="withdrawals"
                    stackId="1"
                    stroke="hsl(var(--chart-4))"
                    fill="hsl(var(--chart-4))"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest wallet activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tx.type === "DEPOSIT" ? "bg-chart-2/10" : "bg-chart-4/10"
                        }`}
                      >
                        {tx.type === "DEPOSIT" ? (
                          <ArrowDownLeft
                            className={`w-5 h-5 ${tx.type === "DEPOSIT" ? "text-chart-2" : "text-chart-4"}`}
                          />
                        ) : (
                          <ArrowUpRight
                            className={`w-5 h-5 ${tx.type === "DEPOSIT" ? "text-chart-2" : "text-chart-4"}`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {tx.type === "DEPOSIT" ? "+" : "-"}
                        {formatCurrency(tx.amount)}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={tx.status === "CONFIRMED" ? "default" : "secondary"} className="text-xs">
                          {tx.status}
                        </Badge>
                        {tx.txHash && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 bg-transparent">
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/deposit">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-chart-2/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-chart-2/20 transition-colors">
                  <ArrowDownLeft className="w-8 h-8 text-chart-2" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Deposit USDT</h3>
                <p className="text-muted-foreground mb-4">Send USDT to your deposit address to receive points</p>
                <Button className="w-full">Get Deposit Address</Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/transfer">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-chart-1/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-chart-1/20 transition-colors">
                  <Zap className="w-8 h-8 text-chart-1" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Transfer Points</h3>
                <p className="text-muted-foreground mb-4">Send points to other users instantly</p>
                <Button variant="outline" className="w-full bg-transparent">
                  Start Transfer
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/withdraw">
            <Card className="hover:shadow-lg transition-all cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-chart-4/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-chart-4/20 transition-colors">
                  <ArrowUpRight className="w-8 h-8 text-chart-4" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Withdraw USDT</h3>
                <p className="text-muted-foreground mb-4">Convert points back to USDT and withdraw</p>
                <Button variant="outline" className="w-full bg-transparent">
                  Request Withdrawal
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
