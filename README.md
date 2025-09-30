# SecureLink
Connecting with people — Secure, Private, and Real-time Video Calls
SecureLink is a web application for real-time video calls, built using WebRTC for peer-to-peer communication and Node.js + Express + Socket.IO for signaling. The project consists of a frontend (React) and backend (Node.js + Express).

Features:
Real-time Video Calls using WebRTC (UDP-based bi-directional data flow)
Secure Connection with minimal latency
User-friendly Interface built with React
Responsive Navbar with logo and buttons
Signaling & Room Management using Socket.IO

Tech Stack :

Frontend
React
React Router
CSS / Tailwind (for styling)

Backend
Node.js + Express
Socket.IO (real-time communication)
MongoDB (optional, if storing users or call logs)
CORS for handling cross-origin requests
WebRTC
Peer-to-peer video/audio streaming
Bi-directional UDP-based data flow

Project Structure
SecureLink/
│
├── backend/
│   ├── server.js          # Main server file
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── models/            # MongoDB models (optional)
│   └── .env               # Environment variables (PORT, DB_URI)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── LandingPage.jsx
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── public/
│   │   └── index.html
│   └── package.json
│
├── README.md
└── package.json           # Optional if using mono repo

Setup & Installation
Backend
cd backend
npm install
npm start   # or `node server.js`

Frontend
cd frontend
npm install
npm start   # runs React app on localhost:3000


Make sure backend server is running before starting the frontend.

How It Works
Landing Page: User sees logo and navigation buttons.
Create/Join Call: User clicks a button to start a video call.
Signaling: Socket.IO handles exchanging WebRTC offers and answers.

WebRTC Connection: Direct peer-to-peer connection streams video/audio.

Bi-directional Communication: UDP-based data flow ensures low latency and smooth call experience.

Screenshots

(Add screenshots of Landing Page, Navbar with logo, and sample video call here)

Environment Variables

PORT — backend server port

DB_URI — MongoDB connection string (if applicable)

CLIENT_URL — frontend URL for CORS

License

MIT License — Free to use and modify.