# QueryBridge

QueryBridge is a full-stack web application that enables users to interact with databases using natural language queries instead of writing SQL commands. The system translates user-friendly queries into executable database operations and displays the results through an intuitive web interface.

## Features

- Natural Language Query Processing
- SQL Query Generation and Execution
- Interactive User Interface
- Real-Time Data Retrieval
- SQLite Database Integration
- Error Handling and Validation
- Fast and Responsive Frontend

## Tech Stack

### Frontend
- React.js
- Vite
- HTML5
- CSS3
- JavaScript

### Backend
- Node.js
- Express.js

### Database
- SQLite
- better-sqlite3

## Project Structure

```text
QueryBridge
│
├── server
│   ├── index.js
│   ├── package.json
│   └── database files
│
├── mfrontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/QueryBridge.git
cd QueryBridge
```

## Backend Setup

```bash
cd server
npm install
npm start
```

The backend server will start on:

```text
http://localhost:5000
```

## Frontend Setup

Open another terminal:

```bash
cd mfrontend
npm install
npm run dev
```

The frontend will run on:

```text
http://localhost:5173
```

## How It Works

1. User enters a query in natural language.
2. Frontend sends the request to the backend.
3. Backend processes and converts the query into SQL.
4. SQL query is executed on the SQLite database.
5. Results are returned and displayed to the user.

## Objectives

- Simplify database interaction.
- Reduce dependency on SQL knowledge.
- Provide an intuitive interface for data retrieval.
- Demonstrate integration of web technologies with database systems.

## Applications

- Educational Platforms
- Database Management Systems
- Business Analytics Tools
- Reporting Systems
- Data Retrieval Applications

## Future Enhancements

- AI-powered query understanding
- Support for MySQL and PostgreSQL
- User Authentication
- Query History Tracking
- Advanced Data Visualization

## Author

Lakshya Sharma

## License

This project is developed for educational and learning purposes.
