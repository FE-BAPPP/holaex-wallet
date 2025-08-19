"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ArrowLeft, Zap, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default function TransferPage() {
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    recipient: "",
    amount: "",
    note: "",
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const availableBalance = "1,250.75"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Transfer request:", formData)
    // TODO: Implement transfer logic
  }

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
            <h1 className="text-xl font-bold">Transfer Points</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Send Points</span>
            </CardTitle>
            <CardDescription>Transfer points to another user instantly</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Username or Email</Label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="recipient"
                    type="text"
                    placeholder="Enter username or email"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    className="pl-10 h-11"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Points)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  min="0.01"
                  step="0.01"
                  required
                  className="h-11"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Available: {availableBalance} POINTS</span>
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
                <Label htmlFor="note">Note (Optional)</Label>
                <Input
                  id="note"
                  type="text"
                  placeholder="Add a note for this transfer"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="h-11"
                />
              </div>

              {/* Transfer Summary */}
              {formData.amount && formData.recipient && (
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <h3 className="font-medium">Transfer Summary</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span>To:</span>
                    <span className="font-medium">{formData.recipient}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Amount:</span>
                    <span className="font-medium">{formData.amount} POINTS</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Fee:</span>
                    <span className="font-medium text-chart-2">FREE</span>
                  </div>
                  <div className="border-t border-border pt-2 flex items-center justify-between font-medium">
                    <span>Total:</span>
                    <span>{formData.amount} POINTS</span>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={!formData.amount || !formData.recipient}>
                <ArrowRight className="w-4 h-4 mr-2" />
                Send Points
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transfer Benefits */}
        <Card className="mt-6 border-0 shadow-lg border-l-4 border-l-chart-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-chart-2">
              <Zap className="w-5 h-5" />
              <span>Instant Transfers</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-chart-2 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">Transfers are processed instantly within the platform</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-chart-2 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">No blockchain fees for point transfers</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-chart-2 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">Available 24/7 with real-time balance updates</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
