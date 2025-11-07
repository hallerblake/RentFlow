# 🚨 DATABASE PROTECTION RULES 🚨

## CRITICAL - DO NOT VIOLATE

### FORBIDDEN DATABASE
**ep-long-pine-ahrrg95e** - This database belongs to a DIFFERENT application and must NEVER be modified.

### ALLOWED DATABASE
**ep-cold-base-adwtjphb** - This is the ONLY database for RentFlow.

## Rules for AI Agents
1. **NEVER** run any Prisma commands without first verifying DATABASE_URL points to ep-cold-base
2. **NEVER** modify .env or .env.local to point to ep-long-pine
3. **ALWAYS** check the database connection string before ANY database operations
4. **STOP IMMEDIATELY** if you detect ep-long-pine anywhere in the configuration

## Verification Command
Before any Prisma operation, run:
```bash
grep DATABASE_URL .env.local | grep -q "ep-cold-base" && echo "✓ Correct database" || echo "✗ WRONG DATABASE - STOP!"
```

## Valid DATABASE_URL Pattern
Must contain: `ep-cold-base-adwtjphb`
Must NOT contain: `ep-long-pine`
