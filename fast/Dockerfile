FROM python:3.12-slim

WORKDIR /fast

RUN apt-get update \
    && apt-get -y install libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade --no-cache-dir pip
RUN pip install --no-cache-dir poetry

COPY pyproject.toml ./

RUN poetry config virtualenvs.create false
RUN poetry install --only main --no-interaction --no-ansi --no-cache

COPY fast ./fast

CMD ["poetry", "run", "fastapi", "run", "fast", "--host", "0.0.0.0", "--port", "8000"]
