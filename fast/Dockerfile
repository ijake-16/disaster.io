FROM python:3.12-slim

WORKDIR /fast

RUN apt-get update \
    && apt-get -y install libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade --no-cache-dir pip
RUN pip install --no-cache-dir uv

# Explicitly install core dependencies to ensure they're available
RUN pip install fastapi uvicorn python-dotenv

# Copy pyproject.toml and extraction script
COPY pyproject.toml ./
COPY extract_deps.py ./

# Install tomli to parse pyproject.toml
RUN pip install --no-cache-dir tomli

# Extract dependencies from pyproject.toml to requirements.txt
RUN python extract_deps.py


# Show generated requirements.txt for debugging
RUN cat requirements.txt

# Install the rest of the dependencies
RUN pip install -r requirements.txt

COPY fast ./fast

# Create a simple startup script that tries different entry points
RUN echo '#!/bin/bash\n\
echo "Trying different FastAPI entry points..."\n\
\n\
# Try each entry point in sequence\n\
if uvicorn "fast.app:app" --host "0.0.0.0" --port "8000"; then\n\
  exit 0\n\
elif uvicorn "fast:app" --host "0.0.0.0" --port "8000"; then\n\
  exit 0\n\
elif uvicorn "fast.api:app" --host "0.0.0.0" --port "8000"; then\n\
  exit 0\n\
elif uvicorn "fast.main:application" --host "0.0.0.0" --port "8000"; then\n\
  exit 0\n\
else\n\
  echo "All entry point attempts failed. Starting with module only..."\n\
  uvicorn "fast.main" --host "0.0.0.0" --port "8000"\n\
fi\n\
' > /fast/start.sh

RUN chmod +x /fast/start.sh

CMD ["/fast/start.sh"]
