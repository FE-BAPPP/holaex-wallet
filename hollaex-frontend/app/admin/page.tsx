"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  Clock,
  CheckCircle,
  X,
  Search,
  Filter,
  ArrowUpRight,
  Shield,
  AlertTriangle,
  TrendingUp,
  Wallet,
} from "lucide-react"
import Link from "next/link"

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const adminStats = {
    totalUsers: 1247,
    totalDeposits: "125,430.50",
    totalWithdrawals: "98,230.25",
    pendingWithdrawals: 5,
    masterBalance: "27,200.25",
    trxBalance: "1,250.00",
  }

  const pendingWithdrawals = [
    {
      id: "1",
      userId: "user123",
      username: "john_doe",
      amount: "500.00",
      toAddress: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
      requestedAt: "2024-01-15 14:30:25",
      status: "PENDING",
    },
    {
      id: "2",
      userId: "user456",
      username: "alice_smith",
      amount: "1000.00",
      toAddress: "TLsV52sRDL79HXGGm9yzwDeVJ2BKsQmjPx",
      requestedAt: "2024-01-15 12:15:30",
      status: "PENDING",
    },
  ]

  const handleApprove = (withdrawalId: string) => {
    console.log("Approving withdrawal:", withdrawalId)
    // TODO: Implement approval logic
  }

  const handleReject = (withdrawalId: string) => {
    console.log("Rejecting withdrawal:", withdrawalId)
    // TODO: Implement rejection logic
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-foreground">Admin Panel</span>
              </div>
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  User Dashboard
                </Button>
              </Link>
              <Button variant="outline" size="sm">
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, withdrawals, and system monitoring</p>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-foreground">{adminStats.totalUsers.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-chart-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Master Balance</p>
                  <p className="text-2xl font-bold text-foreground">${adminStats.masterBalance}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Deposits</p>
                  <p className="text-2xl font-bold text-foreground">${adminStats.totalDeposits}</p>
                </div>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-chart-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow border-l-4 border-l-secondary">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Withdrawals</p>
                  <p className="text-2xl font-bold text-secondary">{adminStats.pendingWithdrawals}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Withdrawals Management */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>Pending Withdrawals</span>
                </CardTitle>
                <CardDescription>Review and approve withdrawal requests</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search withdrawals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingWithdrawals.map((withdrawal) => (
                <div key={withdrawal.id} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                        <ArrowUpRight className="w-6 h-6 text-chart-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">${withdrawal.amount} USDT</p>
                        <p className="text-sm text-muted-foreground">User: {withdrawal.username}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />
                      {withdrawal.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">To Address:</span>
                      <p className="font-mono text-xs mt-1 break-all">{withdrawal.toAddress}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Requested:</span>
                      <p className="mt-1">{withdrawal.requestedAt}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(withdrawal.id)}
                      className="bg-chart-2 hover:bg-chart-2/90"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleReject(withdrawal.id)}>
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {pendingWithdrawals.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No pending withdrawals</p>
                <p className="text-sm">All withdrawal requests have been processed</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Admin Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-chart-1/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-chart-1/20 transition-colors">
                <Users className="w-8 h-8 text-chart-1" />
              </div>
              <h3 className="text-xl font-semibold mb-2">User Management</h3>
              <p className="text-muted-foreground mb-4">View and manage user accounts</p>
              <Button variant="outline" className="w-full bg-transparent">
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Wallet Monitor</h3>
              <p className="text-muted-foreground mb-4">Monitor master wallet and sweeping</p>
              <Button variant="outline" className="w-full bg-transparent">
                View Wallets
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-chart-3/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-chart-3/20 transition-colors">
                <TrendingUp className="w-8 h-8 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold mb-2">System Logs</h3>
              <p className="text-muted-foreground mb-4">View transaction and system logs</p>
              <Button variant="outline" className="w-full bg-transparent">
                View Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
