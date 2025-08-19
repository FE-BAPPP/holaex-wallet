# HD Wallet System Frontend

A modern, secure frontend for USDT TRC20 wallet management system built with Next.js 14, TypeScript, and TailwindCSS.

## 🚀 Features

- **Professional Fintech Design**: Clean, trustworthy interface with modern aesthetics
- **HD Wallet Security**: Hierarchical deterministic wallet management
- **Real-time Dashboard**: Live transaction monitoring and balance updates
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Type Safety**: Full TypeScript implementation
- **Modern UI Components**: Built with Radix UI and shadcn/ui
- **Secure Authentication**: JWT-based auth with password strength validation
- **Interactive Charts**: Financial data visualization with Recharts

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS with custom design tokens
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Font**: DM Sans (Google Fonts)

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd hdwallet-frontend
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Setup

Create a `.env.local` file in the root directory:

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000

# TRON Network (for testnet)
NEXT_PUBLIC_TRON_NETWORK=shasta
NEXT_PUBLIC_TRONSCAN_URL=https://shasta.tronscan.org

# Security
NEXT_PUBLIC_ENCRYPTION_KEY=your-encryption-key-here
\`\`\`

### 4. Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

\`\`\`bash
npm run build
npm start
# or
yarn build
yarn start
\`\`\`

## 🎨 Design System

### Color Palette

- **Primary**: Deep Cyan (#164e63) - Trust and professionalism
- **Secondary**: Amber (#f59e0b) - Call-to-action and highlights
- **Background**: Pure White (#ffffff) - Clean and minimal
- **Card**: Light Cyan (#ecfeff) - Subtle section separation
- **Text**: Slate Gray (#475569) - Readable and professional

### Typography

- **Font Family**: DM Sans (400, 500, 600, 700)
- **Headings**: Bold weights for authority
- **Body**: Regular weight for readability

### Components

All components follow the design system with semantic tokens:

- `bg-background` - Main background
- `bg-card` - Card backgrounds
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `border-border` - Consistent borders

## 📁 Project Structure

\`\`\`
hdwallet-frontend/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles & design tokens
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Landing page
│   ├── login/            # Authentication pages
│   ├── register/
│   └── dashboard/        # Main dashboard
├── components/
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── lib/
│   └── utils.ts          # Utility functions
└── public/               # Static assets
\`\`\`

## 🔐 Security Features

- **HD Wallet Integration**: BIP39/BIP32/BIP44 standard support
- **Secure Authentication**: Password strength validation
- **Input Validation**: Zod schema validation
- **XSS Protection**: Sanitized inputs and outputs
- **HTTPS Enforcement**: Production security headers

## 🌐 API Integration

The frontend is designed to work with the HD Wallet System backend:

### Key Endpoints

- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /user/profile` - User profile data
- `GET /user/deposit-info` - Deposit address info
- `GET /user/points` - User point balance
- `POST /user/withdraw` - Withdrawal requests
- `GET /dashboard/stats` - Dashboard statistics

### API Service

\`\`\`typescript
// Example API call
import { apiService } from '@/lib/api'

const userPoints = await apiService.get('/user/points')
\`\`\`

## 🎯 Key Pages

### 1. Landing Page (`/`)
- Hero section with value proposition
- Feature highlights
- Trust indicators
- Call-to-action buttons

### 2. Authentication (`/login`, `/register`)
- Secure login/registration forms
- Password strength validation
- Security badges
- Responsive design

### 3. Dashboard (`/dashboard`)
- Balance overview
- Transaction history
- Interactive charts
- Quick actions
- Real-time updates

## 🔧 Customization

### Design Tokens

Update `app/globals.css` to customize the design system:

\`\`\`css
:root {
  --primary: #your-color;
  --secondary: #your-color;
  /* ... other tokens */
}
\`\`\`

### Components

All components use the design system tokens and can be easily customized:

\`\`\`tsx
<Button className="bg-primary text-primary-foreground">
  Custom Button
</Button>
\`\`\`

## 📱 Responsive Design

The application is fully responsive with breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### Docker

\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
\`\`\`

## 📈 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, CLS
- **Bundle Size**: Optimized with tree shaking
- **Image Optimization**: Next.js automatic optimization

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Email: support@hdwallet.com
- Documentation: [docs.hdwallet.com](https://docs.hdwallet.com)

---

**Built with ❤️ for secure cryptocurrency management**
