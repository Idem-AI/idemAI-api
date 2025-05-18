# API Endpoint Implementation Guide

## Instructions for AI Assistant

This prompt will guide you in implementing a new API endpoint according to project standards and best practices. Please follow these instructions to ensure the endpoint is correctly implemented, tested, and documented.

## Endpoint Specification

- **Endpoint:** [HTTP Method] [Route Path]
- **Purpose:** [Brief description of what this endpoint does]
- **Controller:** [Controller name]
- **Service:** [Service name]

## Request Details

### Headers

| Header | Required | Description |
|--------|----------|-------------|
| Authorization | [Yes/No] | [Description] |
| Content-Type | [Yes/No] | [Description] |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| [param1] | [Type] | [Yes/No] | [Description] |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| [param1] | [Type] | [Yes/No] | [Description] |

### Request Body

```json
{
  "property1": "value1",
  "property2": "value2"
}
```

## Response Details

### Success Response (200 OK)

```json
{
  "status": "success",
  "data": {
    "property1": "value1",
    "property2": "value2"
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "status": "error",
  "message": "Invalid request parameters",
  "errors": [
    {
      "field": "property1",
      "message": "Property1 is required"
    }
  ]
}
```

#### 401 Unauthorized

```json
{
  "status": "error",
  "message": "Authentication required"
}
```

#### 403 Forbidden

```json
{
  "status": "error",
  "message": "Insufficient permissions"
}
```

#### 404 Not Found

```json
{
  "status": "error",
  "message": "Resource not found"
}
```

#### 500 Internal Server Error

```json
{
  "status": "error",
  "message": "An unexpected error occurred"
}
```

## Implementation Requirements

### Controller Implementation

- Implement input validation
- Call appropriate service method
- Handle and transform the response
- Implement proper error handling

### Service Implementation

- Implement business logic
- Interact with repositories/data sources
- Handle domain-specific validation
- Implement proper error handling

### Repository Implementation (if needed)

- Implement data access logic
- Handle database interactions
- Implement proper error handling

## Validation Rules

| Field | Validation Rules |
|-------|------------------|
| [field1] | [Rules for field1] |
| [field2] | [Rules for field2] |

## Authentication and Authorization

- **Authentication Required:** [Yes/No]
- **Required Permissions:** [List of required permissions]
- **Rate Limiting:** [Rate limiting rules]

## Testing Requirements

### Unit Tests

- Test controller with mocked service
- Test service with mocked repository
- Test validation logic
- Test error handling

### Integration Tests

- Test the complete request flow
- Test with different input scenarios
- Test authentication and authorization

## Documentation Requirements

- Update API documentation
- Document request and response formats
- Document error scenarios
- Provide example usage

## Example Implementation

### Controller Example

```javascript
const createUser = async (req, res, next) => {
  try {
    // Validate input
    const { error } = validateUserInput(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid request parameters',
        errors: error.details
      });
    }
    
    // Call service
    const user = await userService.createUser(req.body);
    
    // Return response
    return res.status(201).json({
      status: 'success',
      data: user
    });
  } catch (error) {
    // Handle errors
    if (error.name === 'DuplicateError') {
      return res.status(409).json({
        status: 'error',
        message: error.message
      });
    }
    
    next(error);
  }
};
```

### Service Example

```javascript
const createUser = async (userData) => {
  // Check for existing user
  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new DuplicateError('User with this email already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // Create user
  const user = await userRepository.create({
    ...userData,
    password: hashedPassword
  });
  
  // Remove sensitive data
  delete user.password;
  
  return user;
};
```

## Output Format

Please provide your implementation in the following format:

1. **Controller Implementation**
   - Complete controller method
   - Validation logic

2. **Service Implementation**
   - Complete service method
   - Business logic

3. **Repository Implementation (if needed)**
   - Complete repository method
   - Data access logic

4. **Tests**
   - Unit test examples
   - Integration test examples

5. **Documentation**
   - API documentation update

---

*Note: This API endpoint implementation guide should be customized for each project's specific needs and standards.*
