# ❄️ IceMonster Portfolio - Local Setup Guide

Follow these instructions to run the Flask portfolio application locally on your machine.

## Prerequisites
* **Python 3.10+** installed on your system.

---

## 🛠️ Step-by-Step Installation

### 1. Activate the Virtual Environment
Open your terminal in the project directory and run:

**On Windows:**
```powershell
.\venv\Scripts\activate
```

**On macOS/Linux:**
```bash
source venv/bin/activate
```

*(If you don't have a virtual environment yet, create one first with `python -m venv venv` before running the activation command).*

### 2. Install Dependencies
Install all required libraries:
```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables (Optional)
Create a `.env` file in the root directory to connect your database and secure the session:
```env
SECRET_KEY=your_random_secret_key_here
DATABASE_URL=your_postgresql_connection_string
```
> 💡 **Note**: If you do not configure a `DATABASE_URL`, the application will automatically create and use a local SQLite database (`instance/portfolio.db`) instead.

### 4. Run the Application
Start the local server:
```bash
python app.py
```

### 5. Access the Website
Open your web browser and go to:
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**
