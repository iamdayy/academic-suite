# Academic Suite

A modern, comprehensive academic management system built as a monorepo using [Turborepo](https://turbo.build/repo). This suite is designed to handle various aspects of academic administration, including student management, course planning, grading, and attendance.

## 🚀 features

The system is modular and covers a wide range of academic functionalities:

- **Core Administration**:
  - **User & Role Management**: Secure authentication and authorization (RBAC).
  - **Academic Structure**: Manage academic years, curriculums, majors, and study programs.
  
- **Course Management**:
  - Course catalogs and prerequisites.
  - Class scheduling and enrollment.
  - Learning materials distribution.

- **Student Portal**:
  - **KRS (Course Plan)**: Management of student course plans (KRS Headers/Details).
  - **Attendance**: Track student attendance.
  - **Assignments**: Submission and tracking of assignments.
  - **Grades**: View academic performance and grading.

- **Lecturer Portal**:
  - Class management and scheduling.
  - Grading and assessment.
  - Assignment creation and review.

- **Guardian Portal**:
  - Dedicated view for guardians to monitor student progress.

## 🛠 Tech Stack

### Monorepo & Tooling
- **Manager**: [Turborepo](https://turbo.build/)
- **Package Manager**: [pnpm](https://pnpm.io/)
- **Configuration**: shared `tsconfig`, `eslint`, and `prettier` configs.

### Apps

#### 🌐 Web (Frontend)
Located in `apps/web`.
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Library**: React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) / Shadcn
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts

#### 🔌 API (Backend)
Located in `apps/api`.
- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: TypeScript
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: Passport (JWT)
- **Validation**: class-validator & class-transformer
- **Testing**: Jest

## 📁 Project Structure

```
├── apps
│   ├── api          # NestJS backend server
│   └── web          # Next.js frontend application
├── packages
│   ├── ui           # Shared React UI components
│   ├── shared-types # Shared TypeScript definitions
│   ├── eslint-config # Shared ESLint configurations
│   └── typescript-config # Shared TSConfigs
└── ...
```

## ⚡ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (>= 18)
- [pnpm](https://pnpm.io/) (Manager)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd academic-suite
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Environment Setup:
   - Configure `.env` files in `apps/api` and `apps/web` as needed. 
   - Ensure your database connection string is set for Prisma in `apps/api/.env`.

4. Database Setup (in a separate terminal or before starting):
   ```bash
   # navigates to api and runs migration
   cd apps/api
   pnpm db:migrate
   # or from root
   pnpm --filter api db:migrate
   ```

### Running the App

To start both the frontend and backend in development mode:

```bash
pnpm dev
# or
turbo dev
```

- **Web**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:3000/api](http://localhost:3000/api) (or configured port, usually 3000/3001/3333 depending on NestJS config)

### Building

To build all apps and packages:

```bash
pnpm build
```

## 🤝 Contributing

This project uses a strict Monorepo structure. 
- Shared UI components should be added to `packages/ui`.
- Shared types (DTOs, interfaces) often used by both FE and BE should go to `packages/shared-types`.

## 📄 License

UNLICENSED
