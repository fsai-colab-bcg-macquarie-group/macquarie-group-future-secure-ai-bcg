## Development Workflow

Before committing code, please run the following steps to ensure consistency and test coverage.

### Run Pre-Commit Hooks

Use pre-commit to auto-fix and validate code formatting, imports, EOFs, etc.

```bash
pre-commit run --all-files
```

### Manual Pytest Gating

This project supports [Dev Containers](https://containers.dev/) via the [.devcontainer](.devcontainer) folder.

Because Github Runner cannot reach our services, we need to run the tests manually and attached as screenshot to the PR.
pre-commit is done on the runner.

Steps:

1. **Open the project in VS Code or Cursor**
2. **Configure `devcontainer.env` in folder [.devcontainer](.devcontainer):**
   ```text
   DB_USER=slruser
   DB_PASSWORD=<your db pw>
   DB_HOST=<your db host>
   DB_PORT=<your db port>
   DB_NAME=<your db name>
   OPENAI_API_KEY=<openai api key>
   MLFLOW_TRACKING_URI=https://mlflow.dev.fsailabs.com/
   MLFLOW_TRACKING_USERNAME=<mlflow tracing username>
   MLFLOW_TRACKING_PASSWORD=<mlflow tracking password>
   ```
   > ⚠️ The environment variable names **must match exactly** with what's expected in [
   `fsai_rag/utils/config.py`](fsai_rag/utils/config.py).
   > If you're adding a new environment, update the config file accordingly.

3. **Connect to AWS VPN client**
4. **Rebuild the container**

   Open the project in VS Code or Cursor**
   Mac Shortcut (VS Code / Cursor), press:
   ```text
   Command (⌘) + P
   ```
   Then type:
   ```text
   > Dev Containers: Rebuild and Reopen in Container
   ```
   Select it and hit **Enter**.

5. **From the terminal of VS Code / Cursor**

   ```base
   pre-commit run --all-files
   ```
   and
   ```
   python -m pytest -n 4 .
   ```

## Installing this Project from GitHub

You can install this project directly from a GitHub repository using `pip`. This is useful during development, testing,
or deployment to environments such as DEV or PROD.

### Installation Methods

| Method          | Description                          | Use Case                       | Example Command                                                                    |
|-----------------|--------------------------------------|--------------------------------|------------------------------------------------------------------------------------|
| **SSH**         | Install via Git over SSH             | Local development (SSH access) | `pip install git+ssh://git@github.com/Future-Secure-AI/fsai_rag.git`               |
| **HTTPS + PAT** | Install via HTTPS using GitHub token | Cloud/CI/CD (no SSH setup)     | `pip install git+https://${GITHUB_TOKEN}@github.com/Future-Secure-AI/fsai_rag.git` |

---

#### Option 1: Install via SSH (for local development)

If your machine has SSH access configured with GitHub:

```bash
pip install git+ssh://git@github.com/Future-Secure-AI/fsai_rag.git
```

#### Option 2: Install via HTTPS and GitHub Token (CI/CD or Cloud Environments)

1. Generate a fine-grained Personal Access Token (PAT) at https://github.com/settings/tokens

    * Restrict access to `fsai_rag` repo
    * Set `Read-only` permissions
2. Use the token at runtime:

```bash
export GITHUB_TOKEN=<your_fine_grained_pat>
pip install git+https://${GITHUB_TOKEN}@github.com/Future-Secure-AI/fsai_rag.git
```

### Installing from GitHub in `requirements.txt`

You can include the `fsai_rag` GitHub repo in your `requirements.txt` along with any third-party packages. This is
useful for automating installs in DEV, PROD, or CI/CD environments.

#### Example `requirements.txt`

```txt
# requirements.txt

# A standard third-party package from PyPI
pandas==2.2.3

# Install fsai_rag from GitHub using an environment-injected GitHub token
git+https://${GITHUB_TOKEN}@github.com/Future-Secure-AI/fsai_rag.git
```

Then install all dependencies with:

```bash
export GITHUB_TOKEN=<your_fine_grained_pat>
pip install -r requirements.txt
```

### Using Modules in `fsai_rag`

Once installed or used in development, you can directly import and use utilities and components from the project.

### Example: Importing from [
`fsai_rag/utils/sql_connection.py`](https://github.com/Future-Secure-AI/fsai_rag/blob/main/fsai_rag/utils/sql_connection.py)

```python
from fsai_rag.utils.sql_connection import get_engine, get_connection_string

connection_str = get_connection_string()
engine = get_engine(connection_str)
```
