# SmartPantry

SmartPantry is a full-stack AI kitchen assistant that uses Computer Vision to identify ingredients from photos and Large Language Models (LLMs) to generate personalized, structured recipes.

## Live Demo

🔗 [https://smart-pantry-rho.vercel.app/](https://smart-pantry-rho.vercel.app/)


## Features

- **Cross-Platform AI Scanner**: Custom WebRTC integration for native-feeling live camera access on both mobile and desktop, with a secure file-upload fallback.
- **Secure Authentication**: Robust, stateless authentication using JSON Web Tokens (JWT) with secure token blacklisting.
- **Smart Error Parsing**: Intercepts raw backend API errors, including CORS and 400/500 responses, and translates them into clean, human-readable UI alerts.
- **Strict JSON Enforcement**: Custom prompt-engineering logic forces strict JSON responses from the LLM, ensuring the frontend receives consistently structured and parseable data.

## Tech Stack & Architecture

### Frontend

- Deployed on: **Vercel**
- Framework: **React + TypeScript**
- Styling: **TailwindCSS**
- State & Routing: **React Router**
- HTTP Client: **Axios**
- Hardware Integration: **WebRTC MediaDevices API**

### Backend

- Deployed on: **Render**
- Framework: **Python + Django REST Framework (DRF)**
- Database: **SQLite**
- Authentication: **SimpleJWT**

### AI & Integrations

- **Google GenAI SDK**: Multimodal vision processing and text generation using Google's Gemini models.

## Running the Project Locally

### Prerequisites

- Node.js v18+
- Python 3.10+
- A Google Gemini API Key

### 1. Clone the Repository

```bash
git clone https://github.com/NesanduD/smart-pantry.git
cd smart-pantry
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

**Mac/Linux:**

```bash
source venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file and add your Google Gemini API key:

GOOGLE_API_KEY=your_api_key_here


Run database migrations:

```bash
python manage.py migrate
```

Start the Django development server:

```bash
python manage.py runserver
```

The backend will run on `http://localhost:8000`.

### 3. Frontend Setup

Open a new terminal window:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will run on `http://localhost:5173`.

## Technical Hurdles Overcome

Building SmartPantry required solving several technical challenges across the frontend, backend, and AI pipeline.

One of the major challenges was configuring a strict Cross-Origin Resource Sharing (CORS) pipeline between the Vercel-hosted frontend and the Render-hosted Django API.

The project also required robust asynchronous state management in React to handle the multi-step workflow of:

1. Capturing an image through the device camera
2. Sending the image to the backend
3. Processing the image using a multimodal AI model
4. Identifying available ingredients
5. Generating a structured recipe
6. Returning and rendering the generated result in the frontend

Another challenge was ensuring reliable communication between the AI model and frontend. Custom prompt-engineering and JSON enforcement were implemented to ensure AI-generated responses follow a predictable structure that can be safely parsed and displayed by the application.

## Environment Variables

The backend requires the following environment variable:
GOOGLE_API_KEY=your_api_key_here


**Important:** Never commit your `.env` file or API keys to GitHub.

Make sure `.env` is included in your `.gitignore` file.

## Deployment

### Frontend

The frontend is deployed using **Vercel**.

### Backend

The backend is deployed using **Render**.

The production architecture allows the React frontend to communicate with the Django REST API through authenticated HTTP requests.

## Author

Created by **Nesandu Dissaka Wedippuliarachchi**
