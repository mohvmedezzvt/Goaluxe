# Goaluxe

**Goaluxe** is a monorepo project containing two main services: a **backend** API and a **frontend** application. This repository uses Docker for containerization, ensuring consistent environments across development, testing, and production.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup and Installation](#setup-and-installation)
- [Using Docker Compose](#using-docker-compose)
- [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

This repository includes:
- **Backend**: Located in `packages/backend`. It is built with Node.js and Express, using ES Modules. Dependencies are managed with pnpm.
- **Frontend**: Located in `packages/frontend`. It is a Next.js application built with npm and uses a `package-lock.json` for dependency management.

We use Docker to containerize both services. A `docker-compose.yml` file orchestrates the containers for easy setup and management.

## Project Structure

```
Goaluxe/
├── Goaluxe-API
├── LICENSE
├── README.md            # This file
├── instructions.md
├── lerna.json
├── node_modules
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── packages
    ├── backend          # Backend service (Node.js/Express)
    │   ├── package.json
    │   └── Dockerfile
    └── frontend         # Frontend service (Next.js)
        ├── package.json
        ├── package-lock.json
        ├── Dockerfile
        └── .dockerignore
```

## Prerequisites

Team members should have the following installed on their machine:
- **Docker Engine** (Docker CE) and **Docker Compose**
  Follow the [official Docker installation guide for Ubuntu](https://docs.docker.com/engine/install/ubuntu/) if needed.
- **Git** for version control

## Setup and Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/mohvmedezzvt/Goaluxe.git
   cd Goaluxe
   ```

2. **Docker Installation:**

   Ensure Docker and Docker Compose are installed by running:

   ```bash
   docker --version
   docker compose version
   ```

3. **User Permissions (Optional):**

   To avoid using `sudo` for Docker commands, add your user to the `docker` group:

   ```bash
   sudo usermod -aG docker $USER
   ```
   Then log out and back in or reboot your system.

## Using Docker Compose

The project uses a `docker-compose.yml` file at the root to manage both the backend and frontend services.

### Build the Docker Images

From the root of the repository, run:

```bash
docker compose build
```

### Run the Containers

Start the services with:

```bash
docker compose up
```

- The **backend** service is mapped to host port `3001` (container port `3000`).
- The **frontend** service is mapped to host port `3000`.

You can now access:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend**: [http://localhost:3001](http://localhost:3001)

### Stop the Containers

To stop and remove containers, networks, and images created by Docker Compose, run:

```bash
docker compose down
```

## Common Issues and Troubleshooting

- **node_modules Conflicts:**
  Make sure the `.dockerignore` file in the `packages/frontend` directory excludes `node_modules` (and other unnecessary directories) to avoid conflicts.

- **Dependency Errors:**
  If you encounter dependency issues during build, ensure you're using the correct Node version (as specified in the Dockerfiles, e.g., `node:18-alpine`).

- **Cache Issues:**
  If you make changes to dependency files (like `package.json`), you might need to rebuild without cache:

  ```bash
  docker compose build --no-cache
  ```

## Contributing

Team members are encouraged to:
- Follow the Docker and code standards as described in this README.
- Update the documentation if changes are made to the containerization setup.
- Run tests and lint checks before committing code.

## License

This project is licensed under the terms found in the [LICENSE](LICENSE) file.
