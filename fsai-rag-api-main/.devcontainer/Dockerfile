# Basic setup
FROM python:3.10-slim-bookworm

# add git lhs to apt
RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | bash

# Update and install necessary packages
RUN apt-get update && apt-get -y update
# added vim and nano for convenience
RUN apt-get install -y sudo git nano curl wget git-lfs libmagic1 zip gcc

# UV
RUN pip install uv

# Clone the AutoGen repository
WORKDIR /home/test_container

# Set the default command to bash
CMD ["/bin/bash"]

####

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install fsai_rag from GitHub via SSH
RUN apt-get update && apt-get install -y git \
RUN pip install git+ssh://git@github.com/Future-Secure-AI/fsai_rag.git



COPY . .


CMD ["uvicorn", "apis.vectorise:app", "--host", "0.0.0.0", "--port", "8000"]
