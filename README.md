# 🤖 Aivora Backend

A powerful Node.js backend with AI-powered goal planning using Google Gemini API.

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini 1.5 Flash via LangChain
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs, helmet, cors
- **Rate Limiting**: express-rate-limit
- **Validation**: Custom middleware

## 📁 Project Structure

```
backend/
├── src/
│   ├── ai/                    # AI/LangChain integration
│   │   ├── chains/           # AI chain implementations
│   │   │   ├── goalPlannerChain.ts      # Generates roadmaps
│   │   │   ├── insightAnalyzerChain.ts  # Analyzes progress
│   │   │   ├── regenerationChain.ts     # Updates plans
│   │   │   └── reportGeneratorChain.ts  # Creates reports
│   │   ├── config/
│   │   │   └── model.config.ts          # Gemini configuration
│   │   ├── prompts/          # AI prompt templates
│   │   └── utils/            # AI utilities
│   ├── config/
│   │   └── env.ts            # Environment configuration
│   ├── controllers/          # Route controllers
│   │   ├── auth.controller.ts
│   │   ├── goal.controller.ts
│   │   ├── progress.controller.ts
│   │   └── insight.controller.ts
│   ├── middleware/           # Express middleware
│   │   ├── auth.ts           # JWT authentication
│   │   ├── errorHandler.ts  # Error handling
│   │   └── rateLimiter.ts   # Rate limiting
│   ├── models/              # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Goal.ts
│   │   ├── Progress.ts
│   │   └── Insight.ts
│   ├── routes/              # API routes
│   │   ├── auth.routes.ts
│   │   ├── goal.routes.ts
│   │   ├── progress.routes.ts
│   │   └── insight.routes.ts
│   ├── utils/               # Utilities
│   │   └── sentimentAnalysis.ts
│   ├── app.ts              # Express app setup
│   └── server.ts           # Server entry point
├── .env.example            # Environment template
└── tsconfig.json           # TypeScript config
```

## 🎯 Features

### 🔐 Authentication
- **User Registration** - bcrypt password hashing
- **Login System** - JWT token generation
- **Protected Routes** - Middleware authentication
- **Token Expiration** - 7-day default (configurable)

### 🤖 AI Chains

#### 1. Goal Planner Chain
Generates structured 30-day roadmaps based on user input.

**Input**:
```typescript
{
  goalTitle: "Learn React",
  duration: 30,
  hoursPerDay: 2,
  additionalContext: "Focus on hooks"
}
```

**Output**:
```typescript
{
  days: [
    {
      day: 1,
      task: "Setup React environment",
      focus: "Installation & basics",
      difficulty: "Easy",
      estimatedHours: 2
    },
    // ... 29 more days
  ]
}
```

#### 2. Insight Analyzer Chain
Analyzes user progress and sentiment to provide insights.

**Features**:
- Mood trend analysis
- Motivation level (0-100)
- Blocker identification
- Actionable recommendations
- Achievement highlights

#### 3. Regeneration Chain
Updates remaining roadmap based on progress and feedback.

**Use Cases**:
- User falling behind schedule
- Difficulty adjustments needed
- Topic focus changes
- Custom user feedback

#### 4. Report Generator Chain
Creates AI-written summaries for PDF export.

### 📊 Data Models

#### User
```typescript
{
  name: string,
  email: string (unique),
  password: string (hashed),
  createdAt: Date
}
```

#### Goal
```typescript
{
  userId: ObjectId,
  title: string,
  description: string,
  duration: number,
  hoursPerDay: number,
  status: 'active' | 'completed' | 'abandoned',
  roadmap: Day[],
  completedDays: number,
  startDate: Date
}
```

#### Progress
```typescript
{
  goalId: ObjectId,
  userId: ObjectId,
  day: number,
  completed: boolean,
  comment: string,
  hoursSpent: number,
  sentimentScore: number (-1 to 1)
}
```

#### Insight
```typescript
{
  goalId: ObjectId,
  userId: ObjectId,
  weekNumber: number,
  summary: string,
  moodTrend: { day: number, score: number }[],
  motivationLevel: number (0-100),
  blockers: string[],
  recommendations: string[],
  highlights: string[]
}
```

## ⚙️ Installation

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key

### Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
Create `.env` file (copy from `.env.example`):
```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/aivora
# Or MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aivora

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
# Get key from: https://makersuite.google.com/app/apikey

# Frontend
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

3. **Run development server**:
```bash
npm run dev
```

4. **Build for production**:
```bash
npm run build
npm start
```

## 🔧 API Endpoints

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login user
GET    /api/auth/me          # Get current user
```

### Goals
```
POST   /api/goals                    # Create goal (AI generates roadmap)
GET    /api/goals                    # Get all user goals
GET    /api/goals/:id                # Get specific goal
PUT    /api/goals/:id                # Update goal
DELETE /api/goals/:id                # Delete goal
POST   /api/goals/:id/regenerate     # Regenerate roadmap
```

### Progress
```
POST   /api/progress                 # Create/update progress
GET    /api/progress/goal/:goalId    # Get goal progress
GET    /api/progress/goal/:goalId/stats  # Get statistics
PUT    /api/progress/:id             # Update progress entry
```

### Insights
```
POST   /api/insights/generate/:goalId        # Generate AI insights
GET    /api/insights/goal/:goalId            # Get all insights
GET    /api/insights/goal/:goalId/latest     # Get latest insight
```

## 🤖 AI Configuration

### Gemini Model Setup

```typescript
// src/ai/config/model.config.ts
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const createModel = (temperature = 0.7) => {
  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    modelName: "gemini-1.5-flash",
    temperature,
    maxOutputTokens: 2048,
  });
};
```

### Custom Prompts

All AI prompts are in `src/ai/prompts/`:
- `goalPlanner.prompt.ts` - Roadmap generation
- `insights.prompt.ts` - Progress analysis
- `regeneration.prompt.ts` - Plan updates
- `report.prompt.ts` - PDF summaries

### Temperature Settings
- **Goal Planning**: 0.7 (balanced creativity)
- **Insights**: 0.8 (more empathetic)
- **Regeneration**: 0.7 (consistent updates)
- **Reports**: 0.6 (formal writing)

## 🔒 Security

### Middleware Stack
1. **Helmet** - HTTP headers security
2. **CORS** - Cross-origin protection
3. **Rate Limiting** - DDoS prevention
4. **JWT Auth** - Token verification
5. **Input Validation** - Data sanitization

### Password Security
- **bcrypt** with salt rounds: 10
- Passwords never stored in plain text
- Password field excluded from queries

### API Key Protection
- Environment variables only
- Never committed to repository
- Rate limited AI endpoints

## 📊 Database

### MongoDB Connection
```typescript
// Auto-reconnect enabled
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
```

### Indexes
```typescript
// User email (unique)
User.index({ email: 1 }, { unique: true });

// Goal userId (for queries)
Goal.index({ userId: 1 });

// Progress compound (unique per day)
Progress.index({ goalId: 1, day: 1 }, { unique: true });
```

## 🚀 Deployment

### Environment Setup
1. Get MongoDB Atlas URI
2. Get Gemini API key
3. Generate secure JWT secret
4. Set production environment variables

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["node", "dist/server.js"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
```

## 📈 Performance

### Rate Limiting
- **General API**: 100 requests / 15 minutes
- **AI Endpoints**: 10 requests / 15 minutes
- **Auth Endpoints**: 5 requests / 15 minutes

### Caching Strategy
- User data cached after authentication
- Goal roadmaps cached until regeneration
- Insights cached for 1 hour

### Database Optimization
- Indexed queries for fast lookups
- Lean queries for better performance
- Aggregation pipelines for statistics

## 🐛 Troubleshooting

### Issue: MongoDB connection failed
**Solution**: Check MONGODB_URI and network connectivity

### Issue: Gemini API errors
**Solution**: 
- Verify API key is valid
- Check rate limits (60 requests/minute)
- Ensure billing is enabled

### Issue: JWT token invalid
**Solution**: 
- Check JWT_SECRET matches frontend
- Verify token expiration settings
- Clear localStorage and re-login

### Issue: CORS errors
**Solution**: Add frontend URL to CORS whitelist in `app.ts`

## 🧪 Testing

### Manual API Testing
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Create goal (with token)
curl -X POST http://localhost:5000/api/goals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Learn React","duration":30,"hoursPerDay":2}'
```

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | Environment (development/production) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `JWT_EXPIRES_IN` | No | Token expiration (default: 7d) |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `FRONTEND_URL` | No | CORS whitelist URL |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window (default: 900000) |
| `RATE_LIMIT_MAX_REQUESTS` | No | Max requests (default: 100) |

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use async/await for promises
3. Add proper error handling
4. Comment complex AI logic
5. Update API documentation

## 📝 License

MIT License - See LICENSE file for details

## 🔗 Related

- [Frontend README](../frontend/README.md)
- [API Documentation](../API_DOCUMENTATION.md)
- [Project Overview](../README.md)

---

Powered by Google Gemini 1.5 Flash 🤖
