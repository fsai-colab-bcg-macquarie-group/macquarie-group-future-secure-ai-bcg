# -----------------------------------------------------------------------------
# Dockerfile for aa_browser_research API + worker
# -----------------------------------------------------------------------------

    FROM python:3.11-slim

    # 1) Install system dependencies (Playwright needs a few libraries + ffmpeg for pydub)
    RUN apt-get update \
      && apt-get install -y --no-install-recommends \
           git \
           curl \
           unzip \
           ffmpeg \
           libnss3 \
           libatk-bridge2.0-0 \
           libgtk-3-0 \
           libx11-6 \
           libxrandr2 \
           libgbm-dev \
           libcups2 \
           libxss1 \
           libasound2 \
           libpangocairo-1.0-0 \
           libxcomposite1 \
           libxdamage1 \
           libxext6 \
      && rm -rf /var/lib/apt/lists/*

    # 2) Install Poetry (bundles pep-621 support)
    ENV POETRY_HOME=/opt/poetry \
        POETRY_VIRTUALENVS_CREATE=false \
        PATH="/opt/poetry/bin:$PATH" \
        PYTHONDONTWRITEBYTECODE=1 \
        PYTHONUNBUFFERED=1

    RUN curl -sSL https://install.python-poetry.org | python -

    WORKDIR /app

    COPY pyproject.toml poetry.lock ./
    RUN poetry install --no-interaction --no-ansi --no-root

    # 4) Download Playwright browsers into the cache
    RUN poetry run playwright install --with-deps chromium

    COPY api ./api
    COPY aa_browser_research ./aa_browser_research
    COPY README.md .

    # 6) Ensure the api package is importable
    RUN test -f api/__init__.py || touch api/__init__.py

    # 7) Expose port & set the launch command
    EXPOSE 8000
    CMD ["poetry", "run", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000"]
