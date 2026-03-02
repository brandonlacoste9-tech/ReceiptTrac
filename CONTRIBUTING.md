# Contributing to ReceiptAI

First off, thank you for considering contributing to ReceiptAI! It's people like you that make ReceiptAI such a great tool for financial transparency.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and encourage diverse perspectives
- Focus on what is best for the community
- Show empathy towards other community members

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

**Bug Report Template:**
```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS, Windows, Linux]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- A detailed description of the proposed feature
- Explain why this enhancement would be useful
- List any alternative solutions you've considered

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Issue that pull request!

## Development Process

### Setting Up Your Development Environment

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR-USERNAME/ReceiptTrac.git
   cd ReceiptTrac
   ```

2. **Install Dependencies**
   ```bash
   npm install
   cd client && npm install && cd ..
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run Development Servers**
   ```bash
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend
   npm run client
   ```

### Project Structure

```
ReceiptTrac/
├── api/              # Backend API
│   ├── routes/       # API endpoints
│   ├── services/     # Business logic
│   ├── models/       # Data models
│   └── middleware/   # Express middleware
├── client/           # React frontend
│   └── src/
│       ├── components/  # Reusable components
│       ├── pages/       # Page components
│       ├── services/    # API client
│       └── styles/      # CSS files
└── server.js         # Express server
```

### Coding Standards

#### JavaScript Style Guide

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript) with some modifications:

```javascript
// Use const for all references, use let if you must reassign
const foo = 1;
let bar = foo;

// Use arrow functions for callbacks
array.map((item) => item.value);

// Use template strings for string concatenation
const greeting = `Hello, ${name}!`;

// Use async/await over promises when possible
async function fetchData() {
  try {
    const data = await api.getData();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### React Component Guidelines

```javascript
// Use functional components with hooks
import React, { useState, useEffect } from 'react';

function MyComponent({ prop1, prop2 }) {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return (
    <div className="my-component">
      {/* Component JSX */}
    </div>
  );
}

export default MyComponent;
```

#### CSS Guidelines

- Use BEM naming convention for classes
- Keep component styles in separate files
- Use CSS variables for colors and common values
- Mobile-first responsive design

```css
/* Component structure */
.component-name {
  /* Main styles */
}

.component-name__element {
  /* Element styles */
}

.component-name--modifier {
  /* Modifier styles */
}
```

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests liberally

**Good commit messages:**
```
Add inflation tracking feature

- Implement 2022 baseline price comparison
- Create shareable social media messages
- Add inflation percentage calculations

Closes #123
```

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/documentation-update` - Documentation changes
- `refactor/refactor-description` - Code refactoring
- `test/test-description` - Test additions/modifications

### Testing

#### Running Tests

```bash
# Backend tests
npm test

# Frontend tests
cd client && npm test
```

#### Writing Tests

**API Endpoint Test Example:**
```javascript
describe('POST /api/receipts/scan', () => {
  it('should scan a receipt successfully', async () => {
    const response = await request(app)
      .post('/api/receipts/scan')
      .attach('receipt', 'test/fixtures/sample-receipt.jpg');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('storeName');
  });
});
```

**Component Test Example:**
```javascript
import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

test('renders hero title', () => {
  render(<HomePage />);
  const titleElement = screen.getByText(/Stop wondering where your money went/i);
  expect(titleElement).toBeInTheDocument();
});
```

## Feature Development Guidelines

### Adding a New Feature

1. **Create an Issue First**
   - Describe the feature
   - Discuss implementation approach
   - Get feedback from maintainers

2. **Design the API**
   - Define endpoints
   - Document request/response formats
   - Consider authentication/authorization

3. **Implement Backend**
   - Create routes
   - Implement service logic
   - Add error handling

4. **Implement Frontend**
   - Create/update components
   - Add API client methods
   - Style the UI

5. **Add Tests**
   - Unit tests for services
   - Integration tests for endpoints
   - Component tests for UI

6. **Update Documentation**
   - Update README if needed
   - Add API documentation
   - Update ARCHITECTURE.md

### Example: Adding a New Insight Type

Let's say you want to add a "Spending Trends" insight:

1. **Backend Service** (`api/services/insightsService.js`)
```javascript
async function getSpendingTrends(userId) {
  const receipts = await receiptService.getUserReceipts(userId);
  
  // Calculate trends
  const trends = calculateTrends(receipts);
  
  return {
    weeklyTrend: trends.weekly,
    monthlyTrend: trends.monthly,
    topCategories: trends.categories
  };
}

module.exports = {
  // ... other exports
  getSpendingTrends
};
```

2. **API Route** (`api/routes/insights.js`)
```javascript
router.get('/spending-trends', async (req, res) => {
  try {
    const userId = req.query.userId || 'demo';
    const trends = await insightsService.getSpendingTrends(userId);
    
    res.json({
      success: true,
      data: trends
    });
  } catch (error) {
    console.error('Spending trends error:', error);
    res.status(500).json({ error: 'Failed to fetch spending trends' });
  }
});
```

3. **Frontend API** (`client/src/services/api.js`)
```javascript
getSpendingTrends: async () => {
  return axios.get(`${API_URL}/insights/spending-trends?userId=demo`);
}
```

4. **React Component** (`client/src/pages/InsightsPage.js`)
```javascript
const [trends, setTrends] = useState(null);

useEffect(() => {
  const loadTrends = async () => {
    const trendsData = await api.getSpendingTrends();
    setTrends(trendsData.data);
  };
  loadTrends();
}, []);
```

## Pull Request Process

1. **Before Submitting**
   - Update the README.md with details of changes if needed
   - Update the ARCHITECTURE.md if you changed the system design
   - Ensure all tests pass
   - Update documentation

2. **PR Title Format**
   ```
   [Type] Brief description
   
   Types: Feature, Fix, Docs, Style, Refactor, Test, Chore
   ```

3. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing performed
   
   ## Screenshots (if applicable)
   Add screenshots here
   
   ## Checklist
   - [ ] My code follows the style guidelines
   - [ ] I have performed a self-review
   - [ ] I have commented my code where needed
   - [ ] I have updated the documentation
   - [ ] My changes generate no new warnings
   - [ ] I have added tests that prove my fix/feature works
   ```

4. **Review Process**
   - At least one maintainer must approve
   - CI/CD checks must pass
   - Address all review comments
   - Squash commits if requested

## Community

### Getting Help

- 📖 Read the [README](README.md)
- 🏗️ Check [ARCHITECTURE](ARCHITECTURE.md)
- 💬 Join our Discord (coming soon)
- 📧 Email: dev@receiptai.com

### Recognition

Contributors will be recognized in:
- README.md Contributors section
- Release notes
- Social media shoutouts

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to ReceiptAI! 🚀
