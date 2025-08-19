# HD Wallet System - Setup Guide

## 🚀 Quick Start

This is a complete HD Wallet System for USDT TRC20 management with OKXpay-style interface.

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud)
- Redis server
- TRON testnet/mainnet access

### Installation

1. **Clone and Install**
\`\`\`bash
git clone <your-repo>
cd hdwallet-system
npm install
\`\`\`

2. **Environment Setup**
Create `.env.local` file:
\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/hdwallet
REDIS_URL=redis://localhost:6379

# HD Wallet
MASTER_MNEMONIC=your_24_word_mnemonic_phrase_here
MASTER_WALLET_ADDRESS=your_master_wallet_address

# TRON Network
TRON_GRID_API_KEY=your_trongrid_api_key
TRON_NETWORK=shasta  # or mainnet
USDT_CONTRACT_ADDRESS=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t

# Security
JWT_SECRET=your_jwt_secret_key
BCRYPT_ROUNDS=12

# API Keys
NEXT_PUBLIC_API_URL=http://localhost:3001
\`\`\`

3. **Start Development**
\`\`\`bash
# Start all services
npm run dev

# Or start individually
npm run dev:server  # Backend on :3001
npm run dev:client  # Frontend on :3000
\`\`\`

## 🏗️ Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS v4 + shadcn/ui
- **State**: Zustand for global state
- **API**: React Query for server state
- **Charts**: Recharts for data visualization

### Backend (Node.js + Express)
- **Runtime**: Node.js with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis for session and job queues
- **Jobs**: Bull.js for background processing
- **Blockchain**: TronWeb + ethers.js for HD wallets

### Key Features
- ✅ **HD Wallet Management** - BIP39/BIP32/BIP44 compliant
- ✅ **Auto Sweeping** - Automatic USDT collection from child wallets
- ✅ **Point System** - Internal off-chain transactions
- ✅ **Admin Dashboard** - Withdrawal approvals and monitoring
- ✅ **Real-time Updates** - Live transaction monitoring
- ✅ **Mobile Responsive** - OKXpay-style interface

## 📱 Pages Overview

### Public Pages
- **Landing** (`/`) - Marketing page with features
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - Account creation with security features

### User Dashboard
- **Dashboard** (`/dashboard`) - Balance overview and quick actions
- **Deposit** (`/deposit`) - QR code and deposit instructions
- **Withdraw** (`/withdraw`) - Withdrawal requests with admin approval
- **Transactions** (`/transactions`) - Complete transaction history

### Admin Panel
- **Admin Dashboard** - System stats and monitoring
- **Withdrawal Management** - Approve/reject withdrawal requests
- **User Management** - View and manage user accounts
- **System Logs** - Transaction and system monitoring

## 🔐 Security Features

- **HD Wallet Security** - Hierarchical deterministic wallets
- **Password Strength** - Visual strength indicator
- **2FA Ready** - Infrastructure for two-factor authentication
- **SSL Encryption** - 256-bit SSL encryption
- **Admin Approval** - All withdrawals require admin approval
- **Rate Limiting** - API rate limiting and DDoS protection

## 🛠️ Development

### Project Structure
\`\`\`
hdwallet-system/
├── app/                    # Next.js pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard/        # Dashboard components
│   ├── deposit/          # Deposit components
│   └── withdraw/         # Withdrawal components
├── lib/                  # Utilities and configurations
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
\`\`\`

### API Integration
The frontend is designed to work with the backend API specified in your technical documentation:

- **Authentication**: JWT-based auth with refresh tokens
- **Wallet Operations**: HD wallet derivation and management
- **Transaction Monitoring**: Real-time deposit/withdrawal tracking
- **Admin Functions**: Withdrawal approval and system management

### Customization
- **Colors**: Modify `app/globals.css` design tokens
- **Components**: All UI components are in `components/ui/`
- **API**: Update API endpoints in service files
- **Features**: Add new pages following the existing patterns

## 🚀 Deployment

### Production Build
\`\`\`bash
npm run build
npm start
\`\`\`

### Docker Deployment
\`\`\`bash
docker-compose up -d
\`\`\`

### Environment Variables
Ensure all production environment variables are set:
- Database connections
- API keys and secrets
- TRON network configuration
- Security keys

## 📞 Support

For technical support or questions:
- Check the documentation in `/docs`
- Review the API specification
- Contact the development team

---

**Built with ❤️ using Next.js, TailwindCSS, and modern web technologies**
