# Database Schema Extension - MVP

This document describes the new tables added for the MVP: `voices` and `presets`.

## Tables

### `voices`
Stores user-defined brand voices with customizable parameters.

**Fields:**
- `id` - Primary key (UUID)
- `userId` - Links to Clerk user ID
- `name` - Display name (e.g., "Professional Tone")
- `tone` - Optional tone description
- `style` - Optional style description
- `vocabulary` - Optional vocabulary guidelines (comma-separated or JSON)
- `audience` - Optional target audience
- `cta` - Optional call-to-action style
- `hashtags` - Optional hashtags (comma-separated)
- `createdAt` - Timestamp (auto-generated)
- `updatedAt` - Timestamp (auto-updated)

### `presets`
Stores user-defined content presets for injection into system prompts.

**Fields:**
- `id` - Primary key (UUID)
- `userId` - Links to Clerk user ID
- `name` - Display name (e.g., "Make it funny")
- `description` - Optional description
- `content` - The actual preset instructions
- `createdAt` - Timestamp (auto-generated)
- `updatedAt` - Timestamp (auto-updated)

## Usage

### API Routes
The new tables are accessible through REST API endpoints following the same pattern as existing routes:

**Voices:**
- `GET /api/voices` - Get all voices for authenticated user
- `POST /api/voices` - Create a new voice
- `GET /api/voices/[id]` - Get specific voice by ID
- `PUT /api/voices/[id]` - Update specific voice
- `DELETE /api/voices/[id]` - Delete specific voice

**Presets:**
- `GET /api/presets` - Get all presets for authenticated user  
- `POST /api/presets` - Create a new preset
- `GET /api/presets/[id]` - Get specific preset by ID
- `PUT /api/presets/[id]` - Update specific preset
- `DELETE /api/presets/[id]` - Delete specific preset

### Example Usage
```typescript
// Create a new voice
const response = await fetch('/api/voices', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Professional Tone",
    tone: "professional, friendly",
    style: "clear, actionable", 
    audience: "developers"
  })
})
const { data: voice } = await response.json()

// Get all voices
const voicesResponse = await fetch('/api/voices')
const { data: voices } = await voicesResponse.json()
```

### Validation
All API routes use Zod schemas from `lib/models/dto.ts` for input validation:

```typescript
import { CreateVoiceSchema, VoiceSchema } from '@/lib/models/dto'

// Input validation is handled automatically in API routes
// Invalid requests return 400 status with error message
```

## Migration

The migration file `drizzle/0002_exotic_orphan.sql` was automatically generated and creates both tables with proper constraints.

To apply the migration:
```bash
npm run db:push
```

## Architecture

These new tables follow the established codebase patterns:
- **Authentication**: All routes use Clerk `auth()` for user authentication
- **Database Access**: Direct Drizzle ORM queries in API route handlers (consistent with missions API)
- **Validation**: Zod schemas for input validation and type safety
- **Error Handling**: Consistent error responses matching existing API patterns
- **Data Formatting**: Null-to-undefined conversion for consistency with frontend expectations

## Integration Points

These tables integrate with:
- **Clerk Authentication**: via `userId` field linking to authenticated users
- **Existing ProcessPayload**: which already has optional `voice` and `presetNote` fields
- **AI Prompt System**: voices and presets can be injected into content generation prompts

## Next Steps

1. ✅ Database schema and migrations
2. ✅ API routes for CRUD operations  
3. 🔄 Build UI components for managing voices and presets
4. 🔄 Integrate with content generation pipeline
5. 🔄 Add frontend state management for voices/presets
