# Dave's Running Club

A memorial website honouring our dear friend Dave Reynolds, who found joy and peace in running. This running club was founded to remember him, support each other, and raise awareness about mental health.

## 💙 In Memory of Dave Reynolds

This website serves as a tribute to Dave Reynolds, who tragically lost his life to suicide. We honour his memory by continuing his love of running and building a supportive community that promotes mental health awareness.

## Features

- **Home Page**: Tribute to Dave with mental health awareness messaging
- **Schedule**: Upcoming runs that honour Dave's memory
- **Members**: Community of runners who carry on Dave's legacy
- **Gallery**: Photos of our running club members and activities
- **Contact**: Get in touch to join our community
- **Add Your Run**: Share your runs and contribute to the club's total distance

## Architecture

This is a full-stack application with:
- **Frontend**: React.js with modern styling
- **Backend**: Node.js/Express API
- **Data Storage**: JSON file (simple, no database required)
- **Real-time Updates**: All users see the same running data

## Mental Health Resources

If you or someone you know is struggling with mental health:

- **National Suicide Prevention Lifeline**: 988 (Available 24/7)
- **Crisis Text Line**: Text HOME to 741741
- **Emergency**: 911

You are not alone. Reach out to friends, family, or professional help.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd davesrunningclub
```

2. Install dependencies:
```bash
npm install
```

3. Start both the backend server and React app:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- React app on http://localhost:3000

### Alternative: Run Separately

If you prefer to run the services separately:

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm start
```

## API Endpoints

- `GET /api/runs` - Get total km and recent runs
- `POST /api/runs` - Add a new run
- `GET /api/health` - Health check

## Data Storage

Runs data is stored in `data/runs.json` and includes:
- Total kilometres run by the club
- Recent runs with runner details
- Timestamps for each run

## Available Scripts

- `npm start` - Runs the React app in development mode
- `npm run server` - Runs the Express backend server
- `npm run dev` - Runs both frontend and backend concurrently
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technology Stack

- **Frontend**: React 19, CSS3 with modern styling
- **Backend**: Node.js, Express.js
- **Data**: JSON file storage
- **Development**: Concurrently for running both services

## Contributing

This is a memorial project. If you'd like to contribute to mental health awareness or running community initiatives, please reach out.

## License

This project is dedicated to Dave's memory and the running community.

---

**Remember**: Mental health matters. You are not alone. 💙
