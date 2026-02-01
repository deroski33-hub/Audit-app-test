# Audit Lead Generator

A full-stack application for managing and tracking audit leads. Built with Python (FastAPI) backend and React (Vite + TypeScript) frontend.

## Features

- **Lead Management**: Create, read, update, and delete audit leads
- **Advanced Filtering**: Filter leads by status, priority, and audit type
- **Search**: Search leads by company name, contact name, or email
- **Dashboard**: Overview of lead statistics and recent leads
- **Analytics**: Visual breakdown of leads by status, priority, and audit type
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **SQLAlchemy** - Async ORM with SQLite
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **React Hook Form** - Form handling
- **Axios** - HTTP client
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads/` | List all leads (with pagination and filters) |
| POST | `/api/leads/` | Create a new lead |
| GET | `/api/leads/{id}` | Get a specific lead |
| PUT | `/api/leads/{id}` | Update a lead |
| DELETE | `/api/leads/{id}` | Delete a lead |
| GET | `/api/leads/stats` | Get lead statistics |

## Lead Model

```typescript
interface Lead {
  id: number;
  company_name: string;
  industry?: string;
  company_size?: string;
  annual_revenue?: string;
  website?: string;
  contact_name: string;
  contact_title?: string;
  contact_email: string;
  contact_phone?: string;
  audit_type: 'financial' | 'compliance' | 'operational' | 'it_security' | 'tax' | 'internal' | 'external';
  status: 'new' | 'contacted' | 'qualified' | 'proposal_sent' | 'negotiating' | 'won' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  source?: string;
  estimated_value?: string;
  notes?: string;
  next_follow_up?: string;
  created_at: string;
  updated_at?: string;
}
```

## Project Structure

```
audit-lead-generator/
├── backend/
│   ├── app/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API endpoints
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   ├── config.py     # Configuration
│   │   ├── database.py   # Database setup
│   │   └── main.py       # FastAPI app
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API client
│   │   ├── styles/       # CSS files
│   │   ├── types/        # TypeScript types
│   │   ├── App.tsx       # Root component
│   │   └── main.tsx      # Entry point
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## License

MIT
