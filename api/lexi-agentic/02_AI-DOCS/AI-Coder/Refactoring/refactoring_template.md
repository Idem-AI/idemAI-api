# Refactoring Guide: [Refactoring Type]

## Instructions for AI Assistant

This prompt will guide you in refactoring code according to project standards and best practices. Please follow these instructions to ensure the refactored code maintains functionality while improving quality.

## Refactoring Context

- **Refactoring Type:** [Performance/Readability/Maintainability/etc.]
- **Target Code:** [Component/Function/Module to refactor]
- **File Path:** [Path to the file containing the target code]
- **Motivation:** [Why this refactoring is needed]

## Code to Refactor

```javascript
// Paste the code to refactor here
```

## Refactoring Goals

1. **Primary Goal:** [Main objective of the refactoring]
2. **Secondary Goals:**
   - [Secondary objective 1]
   - [Secondary objective 2]
   - [Secondary objective 3]

## Constraints

- **Must Maintain:** [Functionality/API/Performance/etc.]
- **Must Not Change:** [External interfaces/Database schema/etc.]
- **Must Consider:** [Backward compatibility/Security/etc.]

## Project Standards

- **Coding Style:** [Reference to project coding conventions]
- **Design Patterns:** [Preferred patterns for this type of code]
- **Testing Requirements:** [How the refactored code should be tested]

## Refactoring Approach

Please follow this approach:

1. **Analyze the Code**
   - Identify code smells and issues
   - Understand the current functionality
   - Map dependencies and side effects

2. **Plan the Refactoring**
   - Outline the changes to be made
   - Identify potential risks
   - Determine the order of changes

3. **Implement the Refactoring**
   - Make changes incrementally
   - Maintain test coverage
   - Document significant changes

4. **Verify the Refactoring**
   - Ensure functionality is preserved
   - Confirm performance impact
   - Validate against project standards

## Common Refactoring Patterns

### Extract Method

Identify blocks of code that can be extracted into separate methods for clarity and reuse.

**Before:**
```javascript
function processOrder(order) {
  // Validate order
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
  if (!order.customer) {
    throw new Error('Order must have a customer');
  }
  
  // Calculate totals
  let subtotal = 0;
  for (const item of order.items) {
    subtotal += item.price * item.quantity;
  }
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  
  // Process payment
  const paymentResult = paymentGateway.charge({
    amount: total,
    customerId: order.customer.id
  });
  
  return { order, subtotal, tax, total, paymentResult };
}
```

**After:**
```javascript
function processOrder(order) {
  validateOrder(order);
  
  const { subtotal, tax, total } = calculateOrderTotals(order);
  
  const paymentResult = processPayment(order.customer.id, total);
  
  return { order, subtotal, tax, total, paymentResult };
}

function validateOrder(order) {
  if (!order.items || order.items.length === 0) {
    throw new Error('Order must have items');
  }
  if (!order.customer) {
    throw new Error('Order must have a customer');
  }
}

function calculateOrderTotals(order) {
  let subtotal = 0;
  for (const item of order.items) {
    subtotal += item.price * item.quantity;
  }
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  
  return { subtotal, tax, total };
}

function processPayment(customerId, amount) {
  return paymentGateway.charge({
    amount,
    customerId
  });
}
```

### Replace Conditional with Polymorphism

Replace complex conditional logic with polymorphic classes.

### Introduce Parameter Object

Group related parameters into a single object for clarity and maintainability.

### Remove Duplicate Code

Identify and eliminate repeated code by extracting common functionality.

## Output Format

Please provide your refactoring in the following format:

1. **Analysis**
   - Summary of issues found
   - Potential risks

2. **Refactoring Plan**
   - Steps to be taken
   - Order of implementation

3. **Refactored Code**
   - Complete refactored code
   - Explanations of significant changes

4. **Verification**
   - How to verify the refactoring
   - Test cases to run

---

*Note: This refactoring guide should be customized for each project's specific needs and standards.*
