FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

# Update and install necessary packages
RUN apt-get update && apt-get -y update
# added vim and nano for convenience
RUN apt-get install -y sudo git nano curl wget git-lfs libmagic1 zip gcc

RUN pip install --no-cache-dir -r requirements.txt

# Install fsai_rag from GitHub via SSH
#RUN apt-get update && apt-get install -y git \
#    && pip install git+ssh://git@github.com/Future-Secure-AI/fsai_rag.git
#RUN pip install git+ssh://git@github.com/Future-Secure-AI/fsai_rag.git



COPY . .

CMD ["uvicorn", "apis.vectorise:app", "--host", "0.0.0.0", "--port", "8000"]