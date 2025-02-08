# Goaluxe MVP

Goaluxe is a customizable goal and reward system that allows users to set personal goals and define custom rewards upon completion. This MVP (Minimum Viable Product) backend is built using modern JavaScript (ES6+) with Express.js and MongoDB (managed via MongoDB Atlas). The project follows a layered architecture with controllers, services, and models, adhering to SOLID principles for maintainability and scalability.

## Table of Contents

- [Overview](#overview)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Overview

Goaluxe enables users to:
- **Create a Goal:** Provide a title, description, due date, and a custom reward.
- **Retrieve Goals:** List all goals or get details of a single goal by its ID.
- **Update a Goal:** Modify existing goal details, such as marking a goal as completed.
- **Delete a Goal:** Remove a goal from the system.

> **Note:** This MVP does not yet include user authentication. All goals are assumed to belong to a single user.

## Technologies Used

- **Node.js** with **Express.js** – Backend framework
- **MongoDB Atlas** – Managed MongoDB database service
- **Mongoose** – ODM for MongoDB
- **ES6+** – Modern JavaScript (using ES modules)
- **Jest** – Testing framework
- **ESLint** and **Prettier** – Code quality and formatting

## Project Structure

```
goal-reward-app/
├── config/
│   └── database.js        # Database connection logic
├── controllers/
│   └── goalController.js  # HTTP request handlers
├── middleware/
│   └── errorHandler.js    # Centralized error handling middleware
├── models/
│   └── goalModel.js       # Mongoose schema for goals
├── routes/
│   └── goalRoutes.js      # API endpoint definitions
├── services/
│   └── goalService.js     # Business logic for goals
├── tests/
│   └── goalService.test.js  # Unit tests for service functions
├── .env                   # Environment variables (not committed to VCS)
├── eslint.config.js       # ESLint configuration (flat config)
├── .prettierrc            # Prettier configuration
├── package.json           # Project metadata and dependencies
├── server.js              # Entry point to initialize the Express server
└── README.md              # This documentation file
```

## Setup Instructions

1. **Clone the Repository:**

   ```bash
   git clone <repository-url>
   cd goal-reward-app
   ```

2. **Install Dependencies:**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables:**

   Create a `.env` file in the project root with the following content (replace placeholders with your actual values):

   ```env
   PORT=3001
   DB_URI="mongodb+srv://<username>:<password>@goaluxe-cluster0.t4sau.mongodb.net/?retryWrites=true&w=majority&appName=Goaluxe-Cluster0"
   ```

4. **Configure ESLint and Prettier:**

   The project uses a flat ESLint configuration in `eslint.config.js` and Prettier configuration in `.prettierrc`. To check code quality and format your code, run:

   ```bash
   npm run lint
   npm run format
   ```

5. **Start the Server:**

   Use nodemon for development to auto-restart on changes:

   ```bash
   npm run dev
   ```

   You should see output similar to:

   ```
   Server is running on port 3001
   MongoDB Connected: your-cluster-hostname
   ```

## API Endpoints

All endpoints are prefixed with `/api/goals`.

### 1. **GET `/api/goals`**

- **Description:** Retrieve all goals.
- **Response:** 200 OK with a JSON array of goal objects.
- **Example:**

  ```json
  [
    {
      "_id": "60f8c2d6c2b9a12d4c8e4a3b",
      "title": "Finish Project",
      "description": "Complete the backend MVP",
      "dueDate": "2025-03-01T00:00:00.000Z",
      "reward": "New Laptop",
      "completed": false,
      "createdAt": "2025-02-07T20:00:00.000Z",
      "updatedAt": "2025-02-07T20:00:00.000Z"
    }
  ]
  ```

### 2. **POST `/api/goals`**

- **Description:** Create a new goal.
- **Request Body:** JSON object with the following properties:

  ```json
  {
    "title": "Test Goal",
    "description": "This is a test goal",
    "dueDate": "2025-03-01T00:00:00.000Z",
    "reward": "Ice cream",
    "completed": false
  }
  ```

- **Response:** 201 Created with the newly created goal document.

### 3. **GET `/api/goals/:id`**

- **Description:** Retrieve a specific goal by its ID.
- **Response:**
  - 200 OK with the goal object if found.
  - 404 Not Found if the goal does not exist.

### 4. **PUT `/api/goals/:id`**

- **Description:** Update a goal by its ID.
- **Request Body:** JSON object with updated fields. For example:

  ```json
  {
    "completed": true
  }
  ```

- **Response:**
  - 200 OK with the updated goal document if successful.
  - 404 Not Found if no goal with the provided ID exists.

### 5. **DELETE `/api/goals/:id`**

- **Description:** Delete a goal by its ID.
- **Response:** 204 No Content on successful deletion.

## Testing

Tests are written using Jest and located in the `tests/` directory.

1. **Run Tests:**

   ```bash
   npm test
   ```

2. **What’s Tested:**
   - All CRUD operations in the service layer.
   - Handling of error conditions (e.g., non-existent IDs, creation failures).
   - Use of Jest mocks to simulate database operations.

3. **Teardown:**
   The tests include an `afterAll` hook to disconnect from MongoDB to prevent open handle warnings.

## Error Handling

- **Centralized Error Handler:**
  The middleware defined in `middleware/errorHandler.js` catches errors passed via `next(error)` from controllers and returns standardized JSON error responses.
- **Usage in Controllers:**
  Each controller function uses a `try/catch` block to catch errors and passes them to the error handler, ensuring consistent HTTP responses (e.g., 400 for bad requests, 404 for not found, 500 for server errors).

## Future Enhancements

- **User Authentication:**
  Adding a Users collection and authentication middleware.
- **Enhanced Reward Structures:**
  Expanding the reward field to an object to support multiple reward types.
- **Activity Logging:**
  Implementing an activity log collection for audit and tracking purposes.
- **Frontend Integration:**
  Building a modern web or mobile interface for users.

## License

[MIT](../LICENSE)

---
