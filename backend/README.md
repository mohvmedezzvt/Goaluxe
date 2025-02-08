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
Goaluxe/
├── config/
│   └── database.js        # Database connection logic
├── controllers/
│   ├── goalController.js  # HTTP request handlers for goals
│   └── authController.js  # HTTP request handlers for authentication
├── middleware/
│   ├── errorHandler.js    # Centralized error handling middleware
│   └── authMiddleware.js  # JWT verification middleware
├── models/
│   ├── goalModel.js       # Mongoose schema for goals
│   └── userModel.js       # Mongoose schema for users
├── routes/
│   ├── goalRoutes.js      # API endpoints for goals
│   └── authRoutes.js      # API endpoints for authentication
├── services/
│   ├── goalService.js     # Business logic for goals
│   └── authService.js     # Business logic for user registration & login
├── tests/
│   ├── goalService.test.js  # Unit tests for goal service functions
│   └── authService.test.js  # Unit tests for authentication service functions
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
