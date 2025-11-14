# ROM Builder - Device Tree Manager

## Overview

ROM Builder is a web-based device tree management application for custom Android ROM development, specifically targeting LineageOS builds. The application enables developers to configure device trees, manage repository dependencies, generate build scripts, and integrate with GitHub for version control. It provides a streamlined workflow for organizing the complex multi-repository structure required for custom ROM compilation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: 
- shadcn/ui component library (Radix UI primitives with Tailwind CSS)
- Design system follows a Linear + GitHub Primer hybrid approach for developer-focused clarity
- Custom theming system supporting light/dark modes
- Component variants managed through class-variance-authority

**State Management**:
- TanStack Query (React Query) for server state management and data fetching
- React Hook Form for form state with Zod schema validation
- Local React context for theme management

**Routing**: Wouter (lightweight client-side routing)

**Key Design Decisions**:
- Code-first clarity with monospace fonts (JetBrains Mono) for technical content
- Sidebar navigation pattern for multi-page application structure
- Responsive grid layouts adapting to different screen sizes
- Toast notifications for user feedback

### Backend Architecture

**Framework**: Express.js with TypeScript running on Node.js

**API Design**: RESTful API architecture
- Resource-based endpoints (`/api/devices`, `/api/repositories`, `/api/build-scripts`)
- Standard HTTP methods (GET, POST, PATCH, DELETE)
- JSON request/response format
- Centralized error handling

**Data Validation**: Zod schemas shared between client and server for type safety

**Storage Strategy**: 
- In-memory storage implementation (MemStorage class) for development
- Interface-based storage abstraction (IStorage) allowing easy migration to persistent database
- Drizzle ORM configured for PostgreSQL (prepared for production use)
- Schema definitions prepared in shared layer for database migration

**Key Design Decisions**:
- Monorepo structure with shared types and schemas between client and server
- Type-safe API contracts using TypeScript and Zod
- Modular route registration pattern
- Request logging middleware for debugging

### Data Models

**Core Entities**:

1. **DeviceConfig**: Represents Android device specifications
   - Properties: name, codename, manufacturer, platform, Android version, LineageOS version
   - Used to organize device-specific builds

2. **Repository**: Tracks Git repositories required for device tree builds
   - Properties: device association, name, URL, branch, path, depth, category, sync status
   - Categories include: device, vendor, kernel, hardware, external

3. **BuildScript**: Generated bash scripts for ROM compilation
   - Properties: device association, name, content, manifest, kernel configuration
   - Supports customization of build parameters

**Relationships**:
- One-to-many: Device to Repositories
- One-to-many: Device to BuildScripts

### External Dependencies

**GitHub Integration**:
- Octokit REST API client for GitHub operations
- Replit Connectors system for OAuth authentication
- Token-based authentication with automatic refresh
- Warning: GitHub client instances are never cached due to token expiration
- Access tokens retrieved fresh for each request via `getUncachableGitHubClient()`

**Replit Platform Integration**:
- Environment-based configuration (REPL_IDENTITY, WEB_REPL_RENEWAL)
- Replit Connectors API for secure credential management
- Development-specific Vite plugins (cartographer, dev-banner, runtime error overlay)

**Database Preparation**:
- Neon serverless PostgreSQL configured via DATABASE_URL environment variable
- Drizzle ORM with migrations directory setup
- Connection pooling through @neondatabase/serverless
- Session storage via connect-pg-simple (PostgreSQL session store)

**Font Loading**:
- Google Fonts: Inter (UI), DM Sans, Fira Code, Geist Mono
- Architects Daughter for decorative elements
- Preconnect optimization for font loading performance

**Build and Development Tools**:
- Vite for frontend bundling with React plugin
- esbuild for server-side compilation
- TypeScript compiler for type checking
- Tailwind CSS with PostCSS for styling
- Path aliases configured for clean imports (@/, @shared/, @assets/)

**Key Architectural Trade-offs**:
- In-memory storage chosen for rapid development iteration; database infrastructure prepared but not yet activated
- GitHub client designed for per-request instantiation to handle OAuth token lifecycle
- Monorepo structure increases coupling but ensures type safety across full stack
- Shadcn/ui components provide customization flexibility at cost of manual updates