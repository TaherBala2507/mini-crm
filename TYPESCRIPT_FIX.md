# TypeScript Import Fix

## Issue
Error: `The requested module '/src/types/index.ts' does not provide an export named 'Lead'`

## Root Cause
The TypeScript configuration uses `verbatimModuleSyntax: true` in `tsconfig.app.json`. This option requires explicit distinction between type imports and value imports.

## Solution
Changed all type-only imports to use the `import type` syntax:

### Before:
```typescript
import { Lead, LeadStatus, LeadSource } from '../../types';
```

### After:
```typescript
import type { Lead } from '../../types';
import { LeadStatus, LeadSource } from '../../types';
```

## Files Modified

1. **frontend/src/components/leads/LeadsList.tsx**
   - Changed `Lead` to use `import type`
   - Kept `LeadStatus` and `LeadSource` as regular imports (they are enums, which are values)

2. **frontend/src/components/leads/LeadForm.tsx**
   - Changed `Lead`, `LeadFormData`, `User` to use `import type`
   - Kept `LeadStatus` and `LeadSource` as regular imports

3. **frontend/src/components/leads/LeadFilters.tsx**
   - Changed `LeadFilters`, `User` to use `import type`
   - Kept `LeadStatus` and `LeadSource` as regular imports

4. **frontend/src/pages/leads/LeadsPage.tsx**
   - Changed `Lead`, `LeadFilters`, `LeadFormData`, `User` to use `import type`

5. **frontend/src/pages/leads/LeadDetailsPage.tsx**
   - Changed `Lead`, `User`, `LeadFormData` to use `import type`
   - Kept `LeadStatus` and `LeadSource` as regular imports

6. **frontend/src/types/index.ts**
   - Added comment to `Lead` interface to force Vite cache refresh

## Why This Works

With `verbatimModuleSyntax: true`:
- **Interfaces and Types**: Must use `import type` because they don't exist at runtime
- **Enums**: Must use regular `import` because they are compiled to JavaScript objects and exist at runtime
- **Classes**: Must use regular `import` because they exist at runtime

This ensures that TypeScript and the bundler (Vite) correctly handle the imports and don't try to import runtime values that don't exist.

## Additional Steps Taken
- Cleared Vite cache by deleting `frontend/node_modules/.vite` directory
- The frontend dev server should automatically reload with the changes

## Testing
After these changes, the application should load without import errors. Test by:
1. Opening the browser and checking the console for errors
2. Navigating to the Leads page
3. Verifying all components load correctly