# Echelon Workspace

Echelon Workspace is a project that aggregates multiple submodules to create a unified development environment. The project includes various components, which are maintained in separate submodules to facilitate modular development, clean versioning, and easy integration with other tools or systems.

## Table of Contents

- [Installation](#installation)
- [Using Submodules](#using-submodules)
- [Running All Projects](#running-all-projects)

---

## Installation

To get started with **Echelon Workspace**, you can clone the repository with all its submodules using the following command:

```bash
git clone --recurse-submodules git@github.com:Future-Secure-AI/echelon-workspace.git
```

This will clone the main repository and initialize all submodules, making sure you get all the required components for the workspace.

If you’ve already cloned the repository **without the `--recurse-submodules`** flag, you can initialize and update the submodules manually by running:

```bash
git submodule update --init --recursive
```

## Using Submodules

The project includes two submodules. These submodules are separate Git repositories that are included within the main project repository. Here are some good practices for working with submodules:

### 1. Always Initialize Submodules

When you first clone the repository or when pulling the latest changes, always ensure that you have initialized and updated the submodules. This ensures that the latest version of the submodule is always included.

### 2. Keep Submodules Updated

When working with submodules, they may receive updates from their respective maintainers. To fetch the latest updates from the submodule, run:

```bash
git submodule update --remote
```

This will pull the latest changes from the submodule’s default branch.

### 3. Committing Changes to Submodules

If you make any changes directly within the submodule, remember that changes must be committed within the submodule itself before you can commit them in the main project repository. After committing changes in the submodule, you'll need to update the reference in the main project repository:

```bash
~/echelon-workspace/echelon-frontend$ git commit -m "feat: login page"
~/echelon-workspace/echelon-frontend$ git push origin main
~/echelon-workspace/echelon-frontend$ cd ..

~/echelon-workspace$ git commit -m "chore(frontend): update echelon frontend"
~/echelon-workspace$ git push origin main
```

### 4. Cloning Submodules Separately

If you need to clone a submodule independently, you can navigate to the submodule directory and clone it like a regular Git repository:

```bash
cd <submodule-folder>
git clone <submodule-repo-url>
```

## Docker Setup

### Production

To run all projects within the **Echelon Workspace**, follow these steps:

1. **Create `.env` file**:
   The workspace may rely on environment variables for configuration. Copy the provided example `.env` file into the required directory by running:

```bash
cp ./infra/.env.example ./infra/.env
```

Make sure to adjust any settings within the `.env` file to suit your local environment or configuration.

2. **Start Services with Docker Compose**:
   To bring up all the services and run the projects, use Docker Compose. In the root directory of the project, run the following command:
   s

```bash
cd infra
docker-compose up
```

or

```bash
docker compose -f ./infra/docker-compose.yml
```

This will start all the containers defined in the `docker-compose.yml` file, and you will be able to access the services running in the workspace.

### Development

In order to set up the Echelon Workspace in a development environment, follow these instructions to get all necessary services running using Docker. This setup will allow you to run the Supabase containers for authentication and database, as well as your choice of the **echelon-api** or **echelon-frontend** from the Echelon Workspace.

### Steps to Set Up Docker in Development

Navigate to the /infra/dev Directory:

In the root of your project, navigate to the infra/dev folder where the Docker Compose files are located.

```bash
cd infra/dev
```

Set Up Environment Variables:

Copy the example environment file to a new .env file:

```bash
cp .env.example .env
```

Adjust any settings within the .env file if necessary for your local environment.

Start Supabase Containers:

The Supabase service is crucial for authentication and the database layer. First, run the Supabase containers with the docker-compose.supabase.yml file.

```bash
docker-compose -f docker-compose.supabase.yml up
```

This will start the Supabase containers, which include the database and authentication services.

Note: Supabase will be accessible via http://localhost:8000 by default for managing your database.

Start the Echelon Containers:

After starting the Supabase services, you can choose to run either the echelon-api(api) or echelon-frontend(frontend) service from the Echelon Workspace.

To start the echelon-api(api) or echelon-frontend(frontend), use the docker-compose.echelon.yml file. The choice is yours:

To run the API service:

```bash
docker-compose -f docker-compose.echelon.yml up api
```

To run the Frontend service:

```bash
docker-compose -f docker-compose.echelon.yml up frontend
```

You can replace api or frontend with the relevant service name based on which part of the project you want to run.

#### Create Mock Users for Development:

If you want to create users for testing purposes, you can use the Supabase SQL Editor to run a command for creating mock users.

Open the Supabase SQL Editor(by default is http://localhost:8000).

Execute the following SQL command:

```sql
SELECT create_user('user_email', 'user_password');
```

Replace 'user_email' and 'user_password' with the
email and password you want to assign to the user.

#### Stopping Containers:

When you're done with your development environment, you can stop the containers by running:

```bash
docker-compose -f docker-compose.supabase.yml down
docker-compose -f docker-compose.echelon.yml down
```

## SSO

After running Docker using [Production](#production) or [Development](#development), you can link your own SSO provider via a SAML metadata URL. (Note: Echelon project currently supports login exclusively through Microsoft.)

To link your own provider, execute the command below in your CLI:

```bash
curl -X POST 'http://localhost:8000/auth/v1/admin/sso/providers' \
    --header "APIKey: SERVICE_ROLE_KEY" \
    --header "Authorization: Bearer SERVICE_ROLE_KEY" \
    --header "Content-Type: application/json" \
    --data '{
      "metadata_url": "SAML_METADATA_URL",
      "type": "saml",
      "domains": ["yourdomain.com"]
    }'
```

### Notes:

- Ensure Docker and Docker Compose are installed on your machine. If you don’t have them installed, follow the instructions from the [Docker documentation](https://docs.docker.com/get-docker/).
- If you want to run specific services or need to scale any particular container, refer to the `docker-compose.yml` file for available services and options.
