# SmartQuote RCS Front-End Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Project Overview
This is a React TypeScript application built with Vite for the SmartQuote RCS (Request for Quotation System). The project uses:

- **Vite** for build tooling and development server
- **React 18** with TypeScript for the frontend framework
- **Tailwind CSS** for styling with a dark theme design
- **Radix UI** components for accessible UI primitives
- **Lucide React** for icons
- **Recharts** for data visualization

## Project Structure
- `src/` - Main application source code
- `BG/` - Components and assets imported from Figma design
  - `components/` - React components for dashboards and UI elements
  - `styles/` - Global CSS styles with dark theme variables
  - `ui/` - Reusable UI components (buttons, cards, forms, etc.)

## Key Features
- Multi-role authentication system (user, manager, admin)
- Dashboard system with role-based views
- Dark theme UI design
- Responsive component library
- Data visualization with charts and metrics

## Coding Guidelines
- Use TypeScript for type safety
- Follow React functional components with hooks
- Use Tailwind CSS classes for styling
- Implement proper error handling
- Follow accessibility best practices with Radix UI
- Use semantic HTML elements
- Implement proper loading and error states

## Component Patterns
- Use the `cn()` utility function for conditional className merging
- Implement proper prop interfaces for TypeScript
- Use consistent file naming (PascalCase for components)
- Export components as named exports when possible
- Implement proper keyboard navigation and ARIA attributes
