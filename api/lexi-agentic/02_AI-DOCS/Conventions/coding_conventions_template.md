# Coding Conventions and Style Guide

## Overview

This document outlines the coding conventions and style guidelines for the project. Following these conventions ensures consistency, readability, and maintainability across the codebase. It should be used in conjunction with the [**Design Conventions and Style Guide**](design_conventions_template.md:1) which details the UX/UI principles and visual standards.

## General Principles

- **Readability First:** Code should be written for humans to read and understand
- **Consistency:** Follow established patterns throughout the codebase
- **Simplicity:** Prefer simple, straightforward solutions over complex ones
- **Documentation:** Document code where necessary, especially non-obvious behavior

## Naming Conventions

### Variables

- Use **camelCase** for variables and function names
- Use descriptive names that indicate purpose
- Avoid abbreviations unless widely understood
- Boolean variables should start with `is`, `has`, `should`, etc.

```javascript
// Good
const userProfile = {};
const isActive = true;
const hasPermission = checkPermissions();

// Bad
const up = {};
const active = true;
const perm = checkPermissions();
```

### Functions

- Use **camelCase** for function names
- Use verbs for function names to indicate actions
- Be specific about what the function does

```javascript
function getUserProfile() { /* ... */ }
function validateInput() { /* ... */ }
function calculateTotal() { /* ... */ }
```

### Classes

- Use **PascalCase** for class names
- Use nouns for class names

```javascript
class UserProfile { /* ... */ }
class PaymentProcessor { /* ... */ }
class AuthenticationService { /* ... */ }
```

### Constants

- Use **UPPER_SNAKE_CASE** for constants

```javascript
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
```

### Files and Directories

- Use **kebab-case** for file and directory names
- Group related files in directories

```
components/
  user-profile/
    user-profile.component.js
    user-profile.styles.js
    user-profile.test.js
```

## Code Formatting

- Use 2 spaces for indentation
- Maximum line length: 80 characters
- Use semicolons at the end of statements
- Use single quotes for strings
- Always use curly braces for control structures, even for single-line blocks

```javascript
// Good
if (condition) {
  doSomething();
}

// Bad
if (condition) doSomething();
```

## Comments

- Use JSDoc comments for functions and classes
- Add comments for complex logic or non-obvious behavior
- Keep comments up-to-date with code changes

```javascript
/**
 * Calculates the total price including tax
 * @param {number} price - The base price
 * @param {number} taxRate - The tax rate as a decimal
 * @returns {number} The total price including tax
 */
function calculateTotalPrice(price, taxRate) {
  // Handle edge cases
  if (price < 0) {
    throw new Error('Price cannot be negative');
  }
  
  return price * (1 + taxRate);
}
```

## Component Structure (e.g., React/Next.js or chosen frontend framework)

- One component per file
- Follow this order for component methods:
  1. Constructor
  2. Lifecycle methods
  3. Event handlers
  4. Render helpers
  5. Render method

```jsx
class UserProfile extends React.Component {
  constructor(props) {
    super(props);
    this.state = { /* ... */ };
  }
  
  componentDidMount() {
    // ...
  }
  
  handleSubmit = () => {
    // ...
  }
  
  renderForm() {
    // ...
  }
  
  render() {
    return (
      // ...
    );
  }
}
```

## State Management

- Keep state as local as possible
- Use context or state management libraries for shared state
- Document the shape of state objects

## Error Handling

- Use try/catch blocks for error-prone operations
- Provide meaningful error messages
- Log errors with appropriate context

```javascript
try {
  const data = await fetchUserData(userId);
  processUserData(data);
} catch (error) {
  logger.error(`Failed to fetch user data for ${userId}`, error);
  showErrorNotification('Could not load user data. Please try again.');
}
```

## Testing

- Write tests for all new features
- Follow the AAA pattern (Arrange, Act, Assert)
- Test both success and failure cases

```javascript
describe('calculateTotalPrice', () => {
  it('should calculate the correct total with tax', () => {
    // Arrange
    const price = 100;
    const taxRate = 0.1;
    
    // Act
    const result = calculateTotalPrice(price, taxRate);
    
    // Assert
    expect(result).toBe(110);
  });
  
  it('should throw an error for negative prices', () => {
    expect(() => calculateTotalPrice(-10, 0.1)).toThrow();
  });
});
```

## Performance Considerations

- Memoize expensive calculations
- Use pagination for large data sets
- Optimize renders in React components

## Accessibility

- Use semantic HTML elements
- Include proper ARIA attributes
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Refer to the [**Design Conventions and Style Guide**](design_conventions_template.md:1) for detailed UX/UI principles.

## Design and User Experience (UX/UI) Principles

The goal is to create user interfaces (UI) and user experiences (UX) that rival the best startups (e.g., Y Combinator standard), focusing on modernity, elegance, intuitiveness, and a "pixel-perfect" aesthetic.

### Design Philosophy
- **Modernity and Elegance:** Aim for clean, contemporary, and visually appealing designs.
- **Intuitive Simplicity:** Interfaces should be easy to understand and use, even for new users.
- **Consistency:** Maintain visual and functional consistency throughout the application.
- **User Feedback:** Provide clear and immediate feedback to user actions.
- **Perceived Performance:** Optimize so the application feels fast and responsive.

### Design System
- **Use of Tailwind CSS:**
    - Follow a centralized Tailwind CSS configuration ([`tailwind.config.js`](tailwind.config.js:1) to be created/modified if needed) to define the color palette, typography, breakpoints, etc.
    - Favor composing Tailwind utility classes to create reusable components.
    - Avoid excessive custom CSS styles; rely as much as possible on Tailwind's capabilities.
- **UI Component Library (Optional but recommended):**
    - Consider using a headless component library (e.g., Headless UI, Radix UI) or a styled component library (e.g., Shadcn/UI, Material UI, Ant Design) to speed up development and ensure consistency.
    - If a library is chosen, define conventions for its customization and extension.
- **Color Palette:** Define and consistently use:
    - Primary and secondary colors.
    - Neutral colors (grays, whites, blacks).
    - Accent colors.
    - Semantic colors for states (success, error, warning, information).
- **Typography:**
    - Define a clear typographic hierarchy (fonts, sizes, weights, line heights) for titles, subtitles, body text, labels, etc.
    - Ensure optimal readability on all devices.
- **Spacing and Grid (Layout):**
    - Adopt a consistent spacing system (e.g., based on a 4px or 8px scale).
    - Use grids (CSS Grid, Flexbox) to structure layouts and ensure alignment.
- **Iconography:**
    - Choose a consistent icon style (e.g., Heroicons, Feather Icons).
    - Use SVGs for sharpness and scalability.
- **Micro-interactions and Animations:**
    - Use subtle animations and transitions to improve UX (e.g., click feedback, smooth state transitions).
    - Avoid excessive or distracting animations. They should serve a purpose.
- **Responsive Design:**
    - Consistently adopt a "Mobile-first" or "Desktop-first" approach.
    - Test on a variety of screen sizes and devices.
- **State Management:**
    - Design clear states for interactive elements (hover, focus, active, disabled).
    - Plan for states for data loading, empty lists, and errors.

### Accessibility (In-depth)
In addition to the points in the "Accessibility" section:
- **Full keyboard navigation:** All interactive elements must be accessible and usable via the keyboard.
- **High contrast by default:** Aim for contrasts higher than WCAG AA minimums where possible, for increased visual comfort.
- **Alternative texts for images:** Descriptive and relevant.
- **Rigorous semantic structure:** Use appropriate HTML tags for their meaning.

### Tools and Processes
- **Mockups (if available):** If Figma mockups (or other) are provided, strive to adhere to them faithfully.
- **Iteration:** Design is an iterative process. Be open to feedback and continuous improvement.

## Security Best Practices
 
- Sanitize user inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization checks
- Follow the principle of least privilege

## Git Workflow

- Use descriptive branch names (feature/user-authentication, bugfix/login-error)
- Write meaningful commit messages
- Keep commits focused on a single change
- Squash commits before merging

## Code Review Checklist

- Does the code follow the conventions in this document?
- **Has the [Design Conventions and Style Guide](design_conventions_template.md:1) been completed and is it being followed?**
- Is the code well-tested?
- Are there any security concerns?
- Is the code efficient and performant?
- **Are the design and UX/UI compliant with the principles defined in both convention documents (modernity, intuitiveness, consistency, aesthetics)?**
- **Is the Tailwind CSS implementation clean and consistent (see [Design Conventions](design_conventions_template.md:1))?**
- **Are the components responsive and do they display correctly on different screen sizes (see [Design Conventions](design_conventions_template.md:1))?**
- **Are interactions and animations smooth and do they add value (see [Design Conventions](design_conventions_template.md:1))?**
- Is the code accessible? (Vérifier les points spécifiques des sections UX/UI et Accessibilité des deux documents de conventions)
- Is the documentation sufficient?
 
---
 
*This document, along with the [**Design Conventions and Style Guide**](design_conventions_template.md:1), should be reviewed and updated regularly as the project evolves.*
