# Echelon Frontend

A Next.js-based frontend application with Supabase authentication.

## Project Structure

```
├── app/                      # Main application source code
│   ├── _private/            # Core application components and utilities
│   │   ├── actions/         # Server actions and API endpoints
│   │   ├── components/      # Reusable React components
│   │   ├── contexts/        # React context providers
│   │   ├── definitions/     # Constants and configuration definitions
│   │   ├── enum/           # TypeScript enums
│   │   ├── helpers/        # Helper functions and utilities
│   │   ├── hooks/          # Custom React hooks
│   │   ├── interfaces/     # TypeScript interfaces
│   │   ├── mappers/        # Data transformation and mapping functions
│   │   ├── pages/          # Page-specific components
│   │   ├── types/          # TypeScript type definitions
│   │   ├── ui/             # UI components and design system
│   │   └── utils/          # Utility functions
│   ├── assets/             # Static assets (images, fonts, etc.)
│   ├── services/           # External service integrations
│   ├── third-party/        # Third-party integrations
│   ├── (dev)/              # Development playground
│   ├── login/              # Authentication pages
│   ├── profile/            # User profile pages
│   ├── forgot-password/    # Password recovery
│   └── reset-password/     # Password reset

├── .cursor/                # Cursor IDE configuration
├── .github/                # GitHub workflows and configuration
├── .husky/                 # Git hooks
├── .next/                  # Next.js build output
├── kubernetes/             # Kubernetes deployment configuration
├── node_modules/          # Project dependencies
├── coverage/              # Test coverage reports
```

## Key Files

- `.env` # Environment variables
- `.env.production` # Production environment variables
- `Dockerfile` # Docker container configuration
- `middleware.ts` # Next.js middleware for auth and routing
- `next.config.mjs` # Next.js configuration
- `package.json` # Project dependencies and scripts
- `tailwind.config.ts` # Tailwind CSS configuration
- `tsconfig.json` # TypeScript configuration
- `eslint.config.ts` # ESLint configuration
- `jest.config.ts` # Jest test configuration

## Development Tools

- TypeScript for type safety
- Next.js for React framework
- Tailwind CSS for styling
- ESLint for code linting
- Jest for testing
- Husky for git hooks
- Docker for containerization
- Kubernetes for orchestration

### Core Directories

All core directories are located in the `app/_private` directory and set up in the `tsconfig.json` file.

```json
    "baseUrl": ".",
  "paths": {
      "@/*": ["./*"],
      "@app/*": ["./app/*"],
      "@interfaces/*": ["./app/(private)/interfaces/*"],
      "@contexts/*": ["./app/(private)/contexts/*"],
      "@components/*": ["./app/(private)/components/*"],
      "@definitions/*": ["./app/(private)/definitions/*"],
      "@assets/*": ["./app/(private)/assets/*"],
      "@services/*": ["./app/(private)/services/*"],
      "@enum/*": ["./app/(private)/enum/*"],
      "@helpers/*": ["./app/(private)/helpers/*"],
      "@utils/*": ["./app/(private)/utils/*"],
      "@ui/*": ["./app/(private)/ui/*"]
    },
```

### **Infrastructure and CI/CD**

In the `kubernetes/manifest.yaml` file, the `dev-deploy` job is configured for AWS ECS deployments.

In the `.github/workflows/dev.yaml` and `.github/workflows/sit.yaml` files, the `dev-deploy` job is configured for AWS ECS deployments.

### Notable Implementation Details

In the `app/services/http/client.ts` file, the `HttpClient` class implements the `IHttpClient` interface.

- Custom HTTP client with:
  - Token handling
  - Unified error management
  - File upload support
  - Type-safe requests

In the `app/_private/contexts/user-data-context.ts` file, the `UserDataProvider` component uses the `useEffect` hook to load user data and store it in the context.

- Centralized user permission management
- Role-based access control
- Application feature gating

### Key Config Files

In the `next.config.mjs` file, the `nextConfig` object is configured for environment-specific configurations and custom logo support.

- Custom image optimization rules
- Environment variable management
- Build configuration

### Testing Strategy

In the `jest.config.ts` file, the `moduleNameMapper` object is configured for module resolution in the test environment.

Patterns visible:

- Module aliasing for test isolation
- Clear separation between unit and integration tests
- Mockable service layer
- Component testing with context providers
