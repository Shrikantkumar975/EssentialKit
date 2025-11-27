# EssentialKit

**EssentialKit** is a modern, full-stack toolkit featuring a URL shortener and QR code generator, built with the MERN stack (MongoDB, Express, React, Node.js) and Tailwind CSS.

## Features

-   **Shorten URLs**: Instantly create short links for long URLs.
-   **QR Code Generator**: Generate and download QR codes for any text, URL, or UPI ID.
-   **User Accounts**: Sign up and log in to manage your links.
-   **Authentication**: Secure JWT-based authentication.
-   **Dark Mode**: Fully functional light and dark mode UI.
-   **Responsive Design**: Beautiful, mobile-first interface built with Tailwind CSS.
-   **Analytics**: Track the number of clicks for each shortened link.

## Tech Stack

-   **Frontend**: React (Vite), Tailwind CSS, Lucide React, Axios, React Router DOM, react-qr-code.
-   **Backend**: Node.js, Express.js, MongoDB (Mongoose), JSON Web Token (JWT), bcryptjs.

## Prerequisites

-   **Node.js**: Ensure you have Node.js installed (v14+ recommended).
-   **MongoDB**: You need a running MongoDB instance (local or Atlas).

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd url_shortner
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/urlshortener
BASE_URL=http://localhost:5000
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173
```

Start the backend server:

```bash
node index.js
# or for development with nodemon (if installed)
# npm run dev
```

The server will start on `http://localhost:5000`.

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Usage

1.  **Sign Up/Login**: Create an account to track your links.
2.  **Shorten**: Paste a long URL into the input field and click "Shorten URL".
3.  **QR Code**: Navigate to the "QR Code" tab, enter text/URL, and download the generated QR image.
4.  **Copy & Share**: Copy the generated short link and share it.
5.  **Visit**: Clicking the short link will redirect you to the original URL.

## API Endpoints

### Authentication

-   `POST /auth/register`: Register a new user.
-   `POST /auth/login`: Login and receive a JWT token.

### URLs

-   `POST /shorten`: Create a short URL (Auth optional, but required to link to user).
-   `GET /:shortId`: Redirect to the original URL.

## Project Structure

```
url_shortner/
├── backend/                # Node.js/Express Backend
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose models (User, URL)
│   ├── index.js            # Server entry point
│   └── ...
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components (Navbar, etc.)
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # Page components (Home, Auth, QrGenerator)
│   │   ├── App.jsx         # Main App component
│   │   └── ...
│   └── ...
└── README.md               # Project Documentation
```

## License

This project is open source.
