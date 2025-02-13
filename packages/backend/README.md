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
- **User Authentication:**
  Users can register and log in to secure their data. Authentication is implemented using JWT tokens.

> **Note:** In this MVP, all goal-related endpoints are protected, so users must be authenticated to create, update, or delete goals.

## Technologies Used

- **Node.js** with **Express.js** – Backend framework
- **MongoDB Atlas** – Managed MongoDB database service
- **Mongoose** – ODM for MongoDB
- **ES6+** – Modern JavaScript (using ES modules)
- **JWT (jsonwebtoken)** – For token generation and verification
- **bcrypt** – For password hashing
- **Jest** – Testing framework
- **ESLint** and **Prettier** – Code quality and formatting

## Project Structure

```
Goaluxe/backend/
├── babel.config.js         // Babel configuration for transpiling modern JavaScript.
├── eslint.config.js        // ESLint flat configuration for enforcing code quality and style.
├── package.json            // Project metadata, scripts, and dependency definitions.
├── package-lock.json       // Auto-generated file locking dependency versions.
├── jest.config.js          // Jest configuration for running unit and integration tests.
├── BACKLOG.md              // Feature backlog and future enhancement documentation.
├── README.md               // This documentation file.
├── server.js               // Main entry point to initialize and run the Express server.
│
├── config/
│   └── database.js         // Database connection logic using Mongoose.
│
├── controllers/
│   ├── authController.js   // Handles authentication (user registration and login).
│   ├── goalController.js   // Manages goal CRUD operations and ownership enforcement.
│   ├── rewardController.js // Manages reward CRUD operations and reward option selection.
│   └── userController.js   // Manages user profile retrieval, updates, and password changes.
│
├── middleware/
│   ├── authMiddleware.js   // Verifies JWT tokens and attaches authenticated user info to requests.
│   ├── errorHandler.js     // Centralized error-handling middleware for consistent API error responses.
│   └── roleMiddleware.js   // Enforces role-based access control on protected routes.
│
├── models/
│   ├── goalModel.js        // Mongoose schema for user goals, includes a reference to a Reward.
│   ├── rewardModel.js      // Mongoose schema for rewards (supports both public and custom rewards).
│   └── userModel.js        // Mongoose schema for user accounts (with fields like username, email, password, and role).
│
├── routes/
│   ├── authRoutes.js       // Defines API endpoints for authentication (register, login).
│   ├── goalRoutes.js       // Defines API endpoints for goal management (CRUD operations).
│   ├── rewardRoutes.js     // Defines API endpoints for reward management (CRUD and reward options).
│   └── userRoutes.js       // Defines API endpoints for user profile management and password updates.
│
├── services/
│   ├── authService.js      // Contains business logic for user authentication.
│   ├── goalService.js      // Contains business logic for goal CRUD operations.
│   ├── rewardService.js    // Contains business logic for reward CRUD operations and reward option retrieval/creation.
│   └── userService.js      // Contains business logic for user profile management and password change functionality.
│
└── tests/
    ├── authService.test.js // Unit tests for authentication service functions.
    ├── goalService.test.js // Unit tests for goal service functions.
    ├── rewardService.test.js // Unit tests for reward service functions.
    └── userService.test.js // Unit tests for user service functions.
```

## Setup Instructions

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/mohvmedezzvt/Goaluxe.git
   cd Goaluxe
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
   JWT_SECRET="the-secret-key"
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
   MongoDB Connected: cluster-hostname
   ```

## API Endpoints

All endpoints are prefixed with `/api`.

### **Authentication Endpoints**

- **POST `/auth/register`**

  - **Description:** Registers a new user.
  - **Request Body:** JSON object with `username`, `email`, `password`, and optionally `role`.
  - **Response:** 201 Created with the newly created user object (excluding the password).

- **POST `/auth/login`**
  - **Description:** Logs in a user.
  - **Request Body:** JSON object with `email` and `password`.
  - **Response:** 200 OK with a JWT token and basic user information.
  - **Errors:** 400 Bad Request if fields are missing, or 401 Unauthorized for invalid credentials.

### **User Endpoints**

- **GET `/users/profile`**

  - **Description:** Retrieves the profile of the authenticated user.
  - **Response:** 200 OK with the user profile data (password omitted).

- **PUT `/users/profile`**

  - **Description:** Updates the profile of the authenticated user.
> Note: The update data must not include the role, password field (to prevent users from changing their role and password without validation).
  - **Response:** 200 OK with the updated user profile.

- **PUT `/users/password`**

  - **Description:** Updates the password for the authenticated user.
  - **Request Body:** Must include both currentPassword and newPassword.
  - **Security:** Verifies the current password before hashing and updating to the new password.
  - **Response:** 200 OK with a success message and the updated user details (password is omitted).

### **Goal Endpoints**

- **GET `/goals`**

  - **Description:** Retrieve all goals.
  - **Response:** 200 OK with a JSON array of goal objects.

- **POST `/goals`**

  - **Description:** Create a new goal.
  - **Request Body:** JSON object with `title`, `description`, `dueDate`, `reward`, and `completed`.
  - **Response:** 201 Created with the newly created goal document.

- **GET `/goals/:id`**

  - **Description:** Retrieve a specific goal by its ID.
  - **Response:**
    - 200 OK with the goal object if found.
    - 404 Not Found if the goal does not exist.

- **PUT `/goals/:id`**

  - **Description:** Update a goal by its ID.
  - **Request Body:** JSON object containing fields to update.
  - **Response:**
    - 200 OK with the updated goal document if successful.
    - 404 Not Found if no goal with the provided ID exists.

- **DELETE `/goals/:id`**

  - **Description:** Delete a goal by its ID.
  - **Response:** 204 No Content on successful deletion.

> **Note:** These endpoints are protected by JWT authentication. See below for authentication endpoints.

### **Reward Endpoints**

- **GET `/api/rewards`**

  - **Description:** Retrieves the list of reward options available to the authenticated user. This includes public (predefined) rewards as well as custom rewards that the user has created.
  - **Response:** 200 OK with a JSON array of Reward objects.
    _Example Response:_
    ```json
    [
      {
        "_id": "62a9f2e5b1234567890abcef",
        "type": "points",
        "value": 100,
        "description": "100 points reward",
        "public": true,
        "createdBy": null
      },
      {
        "_id": "62a9f2f6b1234567890abcf0",
        "type": "badge",
        "description": "Custom badge for completing 5 goals",
        "public": false,
        "createdBy": "user123"
      }
    ]
    ```

- **POST `/api/rewards`**

  - **Description:** Creates a reward. For non-admin users, any provided `public` flag is ignored and the reward is marked as private. Admin users can explicitly set the `public` field.
  - **Request Body (for non-admin):**
    ```json
    {
      "type": "points",
      "value": 100,
      "description": "Reward for completing a challenging goal",
      "public": true   // This will be forced to false for non-admin users.
    }
    ```
  - **Response:** 201 Created with a JSON object representing the new Reward.
    _Example Response (non-admin):_
    ```json
    {
      "_id": "62a9f2e5b1234567890abcef",
      "type": "points",
      "value": 100,
      "description": "Reward for completing a challenging goal",
      "public": false,
      "createdBy": "user123"
    }
    ```

- **PUT `/api/rewards/:id`**

  - **Description:** Updates an existing reward. Only admins can update public rewards, and non-admin users can update only the custom rewards they created.
  - **Request Body Example:**
    ```json
    {
      "description": "Updated reward description"
    }
    ```
  - **Response:** 200 OK with the updated Reward object.
    _Note:_ If the user is not authorized, a 403 Forbidden is returned.

- **DELETE `/api/rewards/:id`**

  - **Description:** Deletes a reward. Only admins can delete public rewards, and non-admin users can delete only their own custom rewards.
  - **Response:** 204 No Content on successful deletion.
  - **Error Cases:** 403 Forbidden if the user is not authorized, 404 Not Found if the reward doesn't exist.

## Authentication & User Profile Workflow

1. **User Registration:**

   - The client sends a POST request to `/api/auth/register` with username, email, and password.
   - The server validates the input, hashes the password using bcrypt, creates a new user, and returns the new user (without the password).

2. **User Login:**

   - The client sends a POST request to `/api/auth/login` with email and password.
   - The server verifies the email and compares the password. If valid, it returns a JWT token along with basic user details.
   - The client includes the token in the `Authorization` header (as `Bearer <token>`) for subsequent requests to protected endpoints (e.g., goal endpoints).

3. **JWT Verification:**
   - The `authMiddleware` extracts the token from the request header, verifies it, and attaches the decoded user data to `req.user`.
   - If verification fails, a 401 Unauthorized error is returned.

4. **User Profile Management:**
   - Authenticated users can retrieve their profile using the GET /api/users/profile endpoint.
   - They can update their profile using the PUT /api/users/profile endpoint, where updates to the role and password fields are not allowed.
   - Users can update their password through the PUT /api/users/password endpoint, which verifies the current password before updating.

5. **Goal Ownership Enforcement:**

   - When creating a goal, the authenticated user's ID is attached to the goal.
   - For retrieval, updates, and deletion of a goal, the system checks that the goal’s user field matches the authenticated user's ID.

6. **Reward Options & Selection:**
   - Rewards are now managed in a separate collection.
   - Users can choose from a curated list of public rewards (predefined by admins) or create their own custom rewards.
   - When creating or updating a goal, the client can send a `rewardOptionId` to reference a Reward document.
   - The goal's `reward` field stores a reference (ObjectId) to a Reward document, and reward details can be populated as needed.

## Testing

Tests are written using Jest and located in the `tests/` directory.

1. **Run Tests:**

   ```bash
   npm test
   ```

2. **What’s Tested:**

   - **Goal Service:** CRUD operations (create, retrieve, update, delete).
   - **Auth Service:** Registration and login scenarios (valid input, missing fields, duplicate user, invalid credentials).

3. **Teardown:**
   - Tests include teardown steps (e.g., disconnecting from Mongoose) to prevent open handles.

## Error Handling

- **Centralized Error Handler:**
  The middleware defined in `middleware/errorHandler.js` catches errors passed via `next(error)` from controllers and returns standardized JSON error responses.
- **Usage in Controllers:**
  Each controller function uses a `try/catch` block to catch errors and passes them to the error handler, ensuring consistent HTTP responses (e.g., 400 for bad requests, 404 for not found, 500 for server errors).

## Future Enhancements

- **User Authentication:**
  Implement additional role-based access controls.
- **Enhanced Reward Structures:**
  Expanding the reward field to an object to support multiple reward types.
- **Advanced API Pagination & Filtering:**
  Extend GET `/api/goals` to support pagination, sorting, and filtering.
- **Activity Logging:**
  Implementing an activity log collection for audit and tracking purposes.
- **Frontend Integration:**
  Building a modern web or mobile interface for users.

## License

[MIT](../LICENSE)

---
