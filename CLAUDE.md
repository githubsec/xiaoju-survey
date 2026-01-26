# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

This is a **monorepo** with two main applications:

- **Server** (`server/`): NestJS backend with MongoDB
- **Web** (`web/`): Vue 3 frontend with Vite (multi-page app)

```bash
# Server
cd server
npm install
npm run local          # Local development with ts-node
npm run dev           # Development with watch mode
npm run build         # Build for production
npm run test          # Run tests
npm run lint          # Lint and fix code

# Web
cd web
npm install
npm run dev           # Start dev server (http://localhost:8080)
npm run build         # Production build
npm run lint          # Lint and fix code
npm run type-check    # Type checking
```

## Architecture Overview

### Survey System Structure

This is a **survey/questionnaire management system** with:

1. **Survey Lifecycle**: Create → Edit → Publish → Respond → Analyze
2. **Multi-tenant**: Workspaces contain multiple surveys with user roles and permissions
3. **Question Types**: 40+ customizable question types via a plugin/materials system
4. **Data Analysis**: Response collection, data export, statistical analysis

### Backend (NestJS + MongoDB)

**Core Modules** (`server/src/modules/`):

- **`auth`**: User authentication, sessions, JWT tokens
- **`survey`**: Core survey CRUD, history tracking, configuration, AI generation
- **`surveyResponse`**: Response collection and data management
- **`workspace`**: Multi-tenant workspaces, member management, collaboration
- **`file`**: File uploads, storage (supports multiple backends: local, OSS, MinIO, Qiniu)
- **`message`**: Message pushing, notifications, webhook integrations
- **`channel`**: Distribution channels for surveys
- **`appManager`**: System management
- **`upgrade`**: Database schema migrations

**Data Models** (`server/src/models/`):

Key entities:

- `SurveyMeta`: Survey metadata
- `SurveyConf`: Survey configuration (questions, logic, theme)
- `SurveyHistory`: Version history
- `SurveyResponse`: Collected responses
- `SurveyGroup`: Survey grouping
- `User`: User accounts
- `Workspace`: Multi-tenant spaces
- `WorkspaceMember`: Role-based access control
- `Session`: User sessions

**Security & Plugins**:

- `securityPlugin/`: Pluggable security features
  - `ResponseSecurityPlugin`: AES encryption for response data
  - `SurveyUtilPlugin`: Utility operations
  - `PluginManager`: Manages plugin lifecycle

**Guards** (`server/src/guards/`):

- `authentication.guard.ts`: JWT verification
- `workspace.guard.ts`: Workspace authorization
- `survey.guard.ts`: Survey-level access control
- `openAuth.guard.ts`: Public access routes

### Frontend (Vue 3 + Vite)

**Multi-Page App Structure** (MPA with vite-plugin-virtual-mpa):

Two independent applications served by one build:

1. **Management (`web/src/management/`)**: B2B admin interface
   - Survey creation, editing, publishing
   - Data analysis and export
   - Workspace and collaboration management
   - Built-in editor with logic flow support

2. **Render (`web/src/render/`)**: C2C survey delivery
   - Survey response collection UI
   - Theme customization rendering
   - Form validation

**Shared Code** (`web/src/`):

- **`materials/`**: Question type components (questions, setters, communals)
  - `questions/`: UI for different question types
  - `setters/`: Configuration panels for editing questions
  - `communals/`: Shared components
- **`common/`**: Utilities shared across apps
  - `logicEngine/`: Logic flow evaluation (show/hide, skip logic)
  - `typeEnum.ts`: Question type definitions
  - `regexpMap.ts`: Validation patterns
  - `xss.js`: XSS prevention

**Management-Specific** (`web/src/management/`):

- `api/`: API integration layer
- `components/`: Layout components (TopNav, LeftMenu, etc.)
- `pages/`: Route pages (login, list, edit, publish, analysis, download)
- `stores/`: Pinia state management
- `hooks/`: Vue composables
- `utils/`: Helpers

**Render-Specific** (`web/src/render/`):

- `api/`: Response submission API
- `components/`: Survey delivery UI
- `pages/`: Survey render page
- `utils/`: Response formatting helpers

## Database

**MongoDB** configured in `server/src/app.module.ts`:

- Connection via environment variables: `XIAOJU_SURVEY_MONGO_URL`, `XIAOJU_SURVEY_MONGO_DB_NAME`, `XIAOJU_SURVEY_MONGO_AUTH_SOURCE`
- TypeORM for schema/ORM
- Models in `server/src/models/`

## API & Configuration

**Swagger API Docs**: Available at `http://localhost:3000/swagger` (configured in `server/src/main.ts`)

**Configuration**:

- Server uses `.env.{NODE_ENV}` files (loaded in `app.module.ts`)
- Common env vars:
  - `NODE_ENV`: development|production
  - `PORT`: Server port (default 3000)
  - `XIAOJU_SURVEY_*`: Application-specific settings
  - File storage: `XIAOJU_SURVEY_OSS_TYPE` (local|aliyun|minio|qiniu)

**Web Proxy** (`web/vite.config.ts`):

Dev server proxies `/api`, `/exportfile`, `/userUpload` to `http://127.0.0.1:3000`

## Testing

**Server Tests**:

```bash
cd server
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:cov     # Coverage report
npm run test:debug   # Debug mode
```

Tests use Jest and should match `**/*.spec.ts` pattern in `src/` directories.

## Common Development Tasks

### Working with Questions/Materials

Question types are defined in `web/src/materials/questions/`. Each question type has:
- A question component (rendering)
- A setter component (editing UI)
- Type definition in `typeEnum.ts`

### Adding Survey Logic

Logic flow (conditional show/hide, skip branches) is evaluated in `web/src/common/logicEngine/`.

### Adding Server Endpoints

1. Create controller in `server/src/modules/{feature}/controllers/`
2. Create service in `server/src/modules/{feature}/services/`
3. Add to module's `@Module()` providers/controllers
4. Add guards as needed (`authentication.guard.ts`, `workspace.guard.ts`, etc.)

### Working with Response Data

- `SurveyResponseModule` handles collection
- `DataStatisticService` in survey module handles analytics
- Responses stored in `SurveyResponse` entity
- Can be encrypted via `ResponseSecurityPlugin`

## Build & Deployment

**Docker**:

- `Dockerfile`: slim Node.js 18 image (production)
- `Dockerfile.full`: full Node.js 18 image (development/debugging)
- `docker-compose.yaml`: Production orchestration

**Build Process**:

- Web: Vite builds to `dist/` (management.html + render.html entry points)
- Server: NestJS compiles to `dist/` (runs via `npm run start:prod`)
- Server serves static web assets from `server/public/` (configure via `ServeStaticModule` in app.module.ts)
