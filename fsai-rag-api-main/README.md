# Project Setup Guide

This guide provides steps to set up a local development environment, configure Python, install dependencies, set environment variables, and run the API.



## 1. Create a Local Virtual Environment

### For macOS/Linux:

```bash
python3 -m venv env
source env/bin/activate
````

### For Windows:

```cmd
python -m venv env
.\env\Scripts\activate
```


## 2. Downgrade Python to 3.10.17

> ⚠️ Higher versions of Python may cause compatibility issues. It's recommended to use **Python 3.10.17**.

After installation, ensure your environment is using the correct version:

```bash
python --version
# Should output: Python 3.10.17
```


## 3. Install Dependencies

Make sure your virtual environment is activated, then install the required packages:

```bash
pip install -r requirements.txt
```



## 4. Create a `.env` File

Create a .env file in the root of your project directory and add your credentials from the Keeper folder:

```
# Sample Credentials
API_KEY=your_api_key_here
DB_URI=your_database_uri
SECRET_KEY=your_secret_key
# Add other required variables below
```

> Make sure this file is included in your `.gitignore` to avoid pushing secrets to version control.


## 5. Install `fsai_rag`

Follow the installation instructions provided at the link below:

👉 [fsai\_rag Installation Guide](https://github.com/Future-Secure-AI/fsai_rag)

Exceute the command on the termainal `pip install git+ssh://git@github.com/Future-Secure-AI/fsai_rag.git`


## 6. Run the API

To start the API server using `uvicorn`, run the following command:

```bash
uvicorn <file_name>:app --reload
```

> Replace `<file_name>` with the name of your main Python file (e.g., `main.py`).


## You're All Set!

Once the server is running, you can access the API at:

```
http://127.0.0.1:8000
```


