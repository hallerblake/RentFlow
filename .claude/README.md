# Claude Code Configuration for RentFlow

## 🛡️ Database Protection System

This project has multiple layers of protection to prevent accidental operations on the wrong database.

### Protected Databases

#### ❌ FORBIDDEN (Never Touch!)
- **Database**: `ep-long-pine-ahrrg95e`
- **Reason**: Belongs to a different application
- **Consequence**: Data loss in another application

#### ✅ ALLOWED (RentFlow Database)
- **Database**: `ep-cold-base-adwtjphb`
- **Purpose**: The only database for RentFlow application

### Protection Layers

1. **Validation Script** (`scripts/validate-db.js`)
   - Runs automatically before all Prisma commands
   - Blocks operations if wrong database detected
   - Validates DATABASE_URL in .env.local

2. **Package.json Scripts**
   - All `db:*` commands include validation
   - Commands: `db:push`, `db:generate`, `db:studio`, `db:seed`
   - Run `npm run db:validate` to check current configuration

3. **Documentation**
   - This README
   - `database-protection.md` with explicit rules

### Usage

Before any database operation, the system automatically validates:
```bash
npm run db:push      # ✅ Validates first, then pushes schema
npm run db:seed      # ✅ Validates first, then seeds data
npm run db:studio    # ✅ Validates first, then opens Prisma Studio
```

Manual validation:
```bash
npm run db:validate  # Check if connected to correct database
```

### For AI Agents

**CRITICAL RULES:**
1. Read `.claude/database-protection.md` before ANY database operation
2. ALWAYS run `npm run db:validate` before Prisma commands
3. NEVER modify DATABASE_URL to point to ep-long-pine
4. STOP IMMEDIATELY if you see ep-long-pine in any configuration

### Emergency Recovery

If wrong database is detected:
1. Check `.env.local` for DATABASE_URL
2. Verify it contains `ep-cold-base-adwtjphb`
3. Run `npm run db:validate` to confirm
4. Regenerate Prisma client: `npx prisma generate`
