"use client"

import { useState, useEffect } from "react"
import { Wallet, Shield, TrendingUp, Users, ArrowRight, CheckCircle, Lock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="floating-gradient floating-gradient-1"></div>
      <div className="floating-gradient floating-gradient-2"></div>
      <div className="floating-gradient floating-gradient-3"></div>

      {/* Header */}
      <header className="border-b border-border glass-effect-dark sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center animate-glow">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">HD Wallet</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-gradient-primary/10">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button className="btn-gradient-primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 relative">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Professional USDT TRC20
              <span className="text-gradient-neon block animate-gradient">Wallet Management</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Secure, scalable, and efficient cryptocurrency wallet system with hierarchical deterministic wallet
              technology and automated transaction processing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="btn-gradient-neon text-lg px-8 py-3">
                  Start Trading
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg px-8 py-3 border-gradient-accent glass-effect bg-transparent"
                >
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient-primary mb-4">Enterprise-Grade Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built with security, scalability, and user experience in mind
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 card-hover glass-effect-dark overlay-gradient">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4 animate-glow">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">HD Wallet Security</h3>
              <p className="text-muted-foreground">
                Hierarchical deterministic wallets with BIP39/BIP32/BIP44 standards for maximum security
              </p>
            </Card>

            <Card className="p-6 card-hover glass-effect-dark overlay-gradient">
              <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mb-4 animate-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Auto Sweeping</h3>
              <p className="text-muted-foreground">
                Automatic USDT collection from child wallets to master wallet with real-time monitoring
              </p>
            </Card>

            <Card className="p-6 card-hover glass-effect-dark overlay-gradient">
              <div className="w-12 h-12 bg-gradient-warning rounded-lg flex items-center justify-center mb-4 animate-glow">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Point System</h3>
              <p className="text-muted-foreground">
                Internal point-based transactions for instant transfers and reduced blockchain fees
              </p>
            </Card>

            <Card className="p-6 card-hover glass-effect-dark overlay-gradient">
              <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center mb-4 animate-glow">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Admin Controls</h3>
              <p className="text-muted-foreground">
                Comprehensive admin dashboard for withdrawal approvals and system monitoring
              </p>
            </Card>

            <Card className="p-6 card-hover glass-effect-dark overlay-gradient">
              <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center mb-4 animate-glow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scalable Architecture</h3>
              <p className="text-muted-foreground">
                Handle thousands of users with Redis caching and Bull.js job queues
              </p>
            </Card>

            <Card className="p-6 card-hover glass-effect-dark overlay-gradient">
              <div className="w-12 h-12 bg-gradient-aurora rounded-lg flex items-center justify-center mb-4 animate-glow">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Live transaction monitoring and instant balance updates across the platform
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 relative">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="glass-effect-dark p-6 rounded-xl card-hover">
              <div className="text-3xl font-bold text-gradient-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div className="glass-effect-dark p-6 rounded-xl card-hover">
              <div className="text-3xl font-bold text-gradient-accent mb-2">$10M+</div>
              <div className="text-muted-foreground">Volume Processed</div>
            </div>
            <div className="glass-effect-dark p-6 rounded-xl card-hover">
              <div className="text-3xl font-bold text-gradient-neon mb-2">50K+</div>
              <div className="text-muted-foreground">Transactions</div>
            </div>
            <div className="glass-effect-dark p-6 rounded-xl card-hover">
              <div className="text-3xl font-bold text-gradient-aurora mb-2">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-crypto text-white relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-30"></div>
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">Join thousands of users managing their USDT with confidence</p>
          <Link href="/register">
            <Button size="lg" className="btn-gradient-accent text-lg px-8 py-3">
              Create Account Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 glass-effect-dark">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 HD Wallet System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
