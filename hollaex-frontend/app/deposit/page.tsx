"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Copy, QrCode, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function DepositPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const depositAddress = "TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Add toast notification
  }

  const recentDeposits = [
    {
      id: "1",
      amount: "100.00",
      txHash: "0x1234567890abcdef1234567890abcdef12345678",
      status: "confirmed",
      confirmations: 19,
      timestamp: "2024-01-15 14:30:25",
    },
    {
      id: "2",
      amount: "200.00",
      txHash: "0x9999111122223333444455556666777788889999",
      status: "pending",
      confirmations: 3,
      timestamp: "2024-01-15 16:45:30",
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
            <h1 className="text-xl font-bold">Deposit USDT</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposit Instructions */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5" />
                  <span>Your Deposit Address</span>
                </CardTitle>
                <CardDescription>Send USDT TRC20 tokens to this address</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* QR Code Placeholder */}
                <div className="flex justify-center">
                  <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="w-16 h-16 text-muted-foreground" />
                  </div>
                </div>

                {/* Address */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">TRC20 Address</span>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(depositAddress)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm font-mono break-all text-foreground">{depositAddress}</p>
                </div>
              </CardContent>
            </Card>

            {/* Important Notes */}
            <Card className="border-0 shadow-lg border-l-4 border-l-secondary">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-secondary">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Important Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Only send USDT TRC20 tokens to this address. Other tokens will be lost.
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Minimum deposit amount: 10 USDT</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">Deposits require 19 confirmations (~1 minute)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Funds will be automatically swept to your balance after confirmation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Deposits */}
          <div>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Deposits</CardTitle>
                <CardDescription>Your latest USDT deposit transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDeposits.map((deposit) => (
                    <div key={deposit.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-lg">+${deposit.amount} USDT</div>
                        <Badge variant={deposit.status === "confirmed" ? "default" : "secondary"}>
                          {deposit.status === "confirmed" ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Clock className="w-3 h-3 mr-1" />
                          )}
                          {deposit.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Confirmations:</span>
                          <span className={deposit.confirmations >= 19 ? "text-chart-2" : "text-secondary"}>
                            {deposit.confirmations}/19
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Time:</span>
                          <span>{deposit.timestamp}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>TX Hash:</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-xs">
                              {deposit.txHash.slice(0, 8)}...{deposit.txHash.slice(-8)}
                            </span>
                            <Button size="sm" variant="ghost" onClick={() => copyToClipboard(deposit.txHash)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {recentDeposits.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No deposits yet</p>
                    <p className="text-sm">Send USDT to your deposit address to get started</p>
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
