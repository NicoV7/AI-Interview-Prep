# AI Interview Prep Platform

A comprehensive platform for coding interview preparation with AI-powered progress tracking, personalized roadmaps, and targeted problem suggestions.

## 🚀 Features

- **Progress Tracking**: Monitor your coding skills across different topics and algorithms
- **AI-Powered Roadmaps**: Get personalized study plans based on your current skill level
- **Smart Problem Suggestions**: Receive targeted problem recommendations to improve weak areas
- **Interactive Visualizations**: View your progress and roadmap in intuitive graphs

## 🏗️ Project Structure

This is a Turborepo monorepo containing:

```
ai-interview/
├── apps/
│   ├── backend/     # Express.js API server
│   └── frontend/    # Next.js web application
├── .github/
│   └── workflows/   # CI/CD pipelines
└── docs/           # Documentation
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Express.js with TypeScript
- **Testing**: Jest with Supertest
- **Deployment**: Railway
- **Features**: REST API, Health checks, CORS, Error handling

### Frontend
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Testing**: Playwright (E2E)
- **Deployment**: Vercel

### DevOps
- **Monorepo**: Turborepo
- **CI/CD**: GitHub Actions
- **Package Manager**: npm workspaces

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm 9+

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-interview
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   ```

4. **Run development servers**
   ```bash
   # Start both apps
   npm run dev

   # Or individually
   npm run dev --workspace=@ai-interview/backend
   npm run dev --workspace=@ai-interview/frontend
   ```

## 🧪 Testing

### Run all tests
```bash
npm run test
```

### Backend tests (Unit tests with Jest)
```bash
npm run test --workspace=@ai-interview/backend
```

### Frontend tests (E2E with Playwright)
```bash
npm run test --workspace=@ai-interview/frontend
```

## 🏗️ Building

### Build all applications
```bash
npm run build
```

### Build individually
```bash
npm run build --workspace=@ai-interview/backend
npm run build --workspace=@ai-interview/frontend
```

## 🚀 Deployment

### Backend (Railway)
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy from `apps/backend` directory
4. Health check endpoint: `/health`

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
3. Set environment variables in Vercel dashboard

## 🔧 Development

### Available Scripts

#### Root level
- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run test` - Run all tests
- `npm run lint` - Lint all apps

#### Backend (`apps/backend`)
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript to dist/
- `npm run start` - Start production server
- `npm run test` - Run Jest tests
- `npm run lint` - ESLint with TypeScript rules

#### Frontend (`apps/frontend`)
- `npm run dev` - Start Next.js development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run test` - Run Playwright E2E tests
- `npm run lint` - Next.js ESLint configuration

### Code Quality
- **TypeScript**: Strict mode enabled for both apps
- **ESLint**: Consistent linting rules across the monorepo
- **Testing**: Comprehensive unit and E2E test coverage
- **CI/CD**: Automated testing and deployment on every push

## 📱 API Endpoints

### Health Check
```
GET /health
```
Returns server status and uptime information.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email [your-email] or open an issue in the GitHub repository.

---

Built with ❤️ using TypeScript, Next.js, and Express.js