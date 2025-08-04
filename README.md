# School Management System

A comprehensive, production-ready school management system built with Next.js, Prisma, and PostgreSQL.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local`
4. Run setup: `npm run setup`
5. Start development server: `npm run dev:complete`

### Demo Credentials
- **Admin**: admin1 / admin123
- **Teacher**: teacher1 / teacher1123  
- **Student**: student1 / student1123
- **Parent**: parent1 / parent1123

## 🏗️ Architecture

### Backend
- **Framework**: Next.js 14 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based sessions
- **API**: RESTful APIs with proper error handling
- **Security**: Role-based access control, input validation

### Frontend  
- **UI**: React with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context + hooks
- **Forms**: React Hook Form with Zod validation

### Features
- ✅ User management (Admin, Teachers, Students, Parents)
- ✅ Class and subject management
- ✅ Attendance tracking
- ✅ Grade and exam management
- ✅ Assignment management
- ✅ Messaging system
- ✅ Dashboard analytics
- ✅ Audit logging
- ✅ Session management
- ✅ Role-based permissions

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run dev:complete` - Full setup + start development
- `npm run build` - Build for production
- `npm run build:production` - Full production build with checks
- `npm run test` - Run tests
- `npm run test:all` - Run all tests including architecture checks
- `npm run seed:complete` - Seed database with sample data
- `npm run db:reset` - Reset and reseed database

### Database Management
- `npx prisma studio` - Open Prisma Studio
- `npx prisma db push` - Push schema changes
- `npx prisma generate` - Generate Prisma client

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Session management
- Audit logging

## 📱 Production Deployment

1. Set up PostgreSQL database
2. Configure production environment variables
3. Run `npm run build:production`
4. Deploy to your hosting platform

## 🧪 Testing

The system includes comprehensive tests:
- Unit tests for components
- API route tests
- Authentication tests
- Production readiness checks
- Architecture validation

Run all tests: `npm run test:all`

## 📚 Documentation

- API documentation available at `/api/docs` (when running)
- Database schema in `prisma/schema.prisma`
- Component documentation in respective files

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test:all`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
