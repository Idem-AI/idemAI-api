# Test Generator: [Component/Function Type]

## Instructions for AI Assistant

This prompt will guide you in generating comprehensive tests for a specific component or function. Please follow these instructions carefully to ensure the tests are thorough, maintainable, and aligned with project conventions.

## Test Target Information

- **Target Type:** [Component/Function/API/etc.]
- **Target Name:** [Name of the target to test]
- **File Path:** [Path to the file containing the target]
- **Dependencies:** [List of key dependencies]

## Test Framework Information

- **Test Framework:** [Jest/Mocha/Cypress/etc.]
- **Test File Location:** [Where to save the test file]
- **Test File Naming Convention:** [e.g., `*.test.js`, `*.spec.js`]

## Test Requirements

Please generate tests that cover:

1. **Happy Path Scenarios**
   - Normal operation with valid inputs
   - Expected successful outcomes

2. **Edge Cases**
   - Boundary values
   - Empty/null inputs
   - Maximum/minimum values

3. **Error Handling**
   - Invalid inputs
   - Dependency failures
   - Exception handling

4. **Integration Points**
   - Interactions with dependencies
   - API contracts

## Mock Requirements

- **Dependencies to Mock:** [List of dependencies to mock]
- **Mock Approach:** [How to create mocks]
- **Mock Return Values:** [Expected return values for mocks]

## Code to Test

```javascript
// Paste the code to test here, or provide a reference to it
```

## Test Structure

Please structure the tests as follows:

```javascript
describe('[Target Name]', () => {
  // Setup and teardown
  beforeEach(() => {
    // Setup code
  });
  
  afterEach(() => {
    // Teardown code
  });
  
  describe('[Functionality Group 1]', () => {
    it('should [expected behavior 1]', () => {
      // Test code
    });
    
    it('should [expected behavior 2]', () => {
      // Test code
    });
  });
  
  describe('[Functionality Group 2]', () => {
    // More tests
  });
});
```

## Testing Best Practices

1. **Arrange-Act-Assert Pattern**
   - Arrange: Set up the test conditions
   - Act: Perform the action being tested
   - Assert: Verify the expected outcome

2. **Test Isolation**
   - Each test should be independent
   - Avoid test interdependencies

3. **Descriptive Test Names**
   - Use clear, descriptive names that explain what is being tested
   - Follow the pattern: "should [expected behavior] when [condition]"

4. **Focused Assertions**
   - Each test should assert one specific behavior
   - Use precise assertions

## Example Test

```javascript
describe('UserService', () => {
  let userService;
  let mockUserRepository;
  
  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      save: jest.fn()
    };
    userService = new UserService(mockUserRepository);
  });
  
  describe('getUserById', () => {
    it('should return user when valid ID is provided', async () => {
      // Arrange
      const userId = '123';
      const mockUser = { id: userId, name: 'Test User' };
      mockUserRepository.findById.mockResolvedValue(mockUser);
      
      // Act
      const result = await userService.getUserById(userId);
      
      // Assert
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
    
    it('should throw error when user is not found', async () => {
      // Arrange
      const userId = '456';
      mockUserRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(userService.getUserById(userId)).rejects.toThrow('User not found');
      expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
    });
  });
});
```

## Output Format

Please generate the complete test file based on the provided information. Include:

1. Imports and setup
2. Mock definitions
3. Test cases organized by functionality
4. Comments explaining complex test logic

---

*Note: This test generator should be customized for each project's testing framework and conventions.*
