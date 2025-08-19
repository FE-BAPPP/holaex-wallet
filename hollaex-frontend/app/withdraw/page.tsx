"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, ArrowUpRight, AlertTriangle, Clock, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function WithdrawPage() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    amount: "",
    toAddress: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const availableBalance = "1,234.56"
  const minWithdrawal = "20"
  const withdrawalFee = "1.0"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement withdrawal request logic
    console.log("Withdrawal request:", formData)
  }

  const pendingWithdrawals = [
    {
      id: "1",
      amount: "100.00",
      toAddress: "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE",
      status: "pending",
      requestedAt: "2024-01-15 14:30:25",
    },
    {
      id: "2",
      amount: "50.00",
      toAddress: "TLsV52sRDL79HXGGm9yzwDeVJ2BKsQmjPx",
      status: "approved",
      requestedAt: "2024-01-14 16:45:30",
      approvedAt: "2024-01-15 09:15:20",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Withdraw USDT</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Withdrawal Form */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ArrowUpRight className="w-5 h-5" />
                  <span>Request Withdrawal</span>
                </CardTitle>
                <CardDescription>Withdraw USDT to external TRC20 address</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USDT)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      min={minWithdrawal}
                      step="0.01"
                      required
                      className="h-11"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Available: ${availableBalance}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setFormData({ ...formData, amount: availableBalance.replace(",", "") })}
                      >
                        Max
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="toAddress">Destination Address</Label>
                    <Input
                      id="toAddress"
                      type="text"
                      placeholder="Enter TRC20 address"
                      value={formData.toAddress}
                      onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })}
                      required
                      className="h-11 font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">Only TRC20 addresses are supported</p>
                  </div>

                  {/* Fee Information */}
                  {formData.amount && (
                    <div className="p-4 bg-muted rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Withdrawal Amount:</span>
                        <span>${formData.amount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Network Fee:</span>
                        <span>${withdrawalFee}</span>
                      </div>
                      <div className="border-t border-border pt-2 flex justify-between font-medium">
                        <span>You will receive:</span>
                        <span>
                          ${(Number.parseFloat(formData.amount) - Number.parseFloat(withdrawalFee)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11"
                    disabled={
                      !formData.amount ||
                      !formData.toAddress ||
                      Number.parseFloat(formData.amount) < Number.parseFloat(minWithdrawal)
                    }
                  >
                    Request Withdrawal
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="border-0 shadow-lg border-l-4 border-l-secondary">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-secondary">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Withdrawal Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Minimum withdrawal: ${minWithdrawal} USDT</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Network fee: ${withdrawalFee} USDT per transaction</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">All withdrawals require admin approval</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Processing time: 1-24 hours after approval</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Withdrawals */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Your recent withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingWithdrawals.map((withdrawal) => (
                    <div key={withdrawal.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-lg">-${withdrawal.amount} USDT</div>
                        <Badge
                          variant={
                            withdrawal.status === "approved"
                              ? "default"
                              : withdrawal.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {withdrawal.status === "approved" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : withdrawal.status === "pending" ? (
                            <Clock className="w-3 h-3 mr-1" />
                          ) : (
                            <X className="w-3 h-3 mr-1" />
                          )}
                          {withdrawal.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>To Address:</span>
                          <span className="font-mono text-xs">
                            {withdrawal.toAddress.slice(0, 8)}...{withdrawal.toAddress.slice(-8)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Requested:</span>
                          <span>{withdrawal.requestedAt}</span>
                        </div>
                        {withdrawal.approvedAt && (
                          <div className="flex justify-between">
                            <span>Approved:</span>
                            <span>{withdrawal.approvedAt}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {pendingWithdrawals.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowUpRight className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No withdrawal requests yet</p>
                    <p className="text-sm">Submit your first withdrawal request above</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
