# Project Rules

## Component Structure
- ALWAYS create separate component files in /components directory
- NEVER write inline JSX code directly in page files
- Extract all UI sections into reusable components
- Each component should be in its own file with proper TypeScript types
- Follow existing naming conventions (PascalCase for components)

## Code Organization
- Keep page files clean - they should only import and compose components
- Component files should be self-contained with their own props interfaces
- Use the /constants directory for shared data and configuration
