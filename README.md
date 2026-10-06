# Outfitory

Outfitory is a full-stack digital wardrobe and outfit-planning application. Users can organize clothing, build and save outfits, plan a weekly wardrobe, create travel packing lists, and request AI recommendations grounded in items they actually own.

## What it demonstrates

- React and TypeScript frontend organized by features, contexts, hooks, and API services
- Flask REST API with service and route layers
- JWT authentication with bcrypt password hashing
- MySQL persistence for users, clothing, outfits, collections, calendars, and travel lists
- LLM tool use with structured output validation
- User-scoped authorization for wardrobe and recommendation data
- Docker Compose development environment
- Backend integration tests for the main resources

## Core features

- Register, sign in, and access protected application routes
- Upload clothing images and store detailed wardrobe metadata
- Search and filter clothes by category
- Build outfits visually and save them into collections
- Generate outfit recommendations using the signed-in user's wardrobe
- Validate every recommended item against the database before returning it
- Plan outfits on a weekly calendar
- Create dated packing lists for trips
- Switch between light and dark themes

> **Current status:** the upload flow stores images successfully, but its classification response is placeholder metadata while a production vision classifier is being integrated. The wardrobe-grounded Groq recommendation flow is implemented in the backend.

## Application walkthrough

| Dashboard | Wardrobe | AI recommendation |
| --- | --- | --- |
| ![Dashboard](images/2.png) | ![Wardrobe](images/5.png) | ![AI outfit recommendation](images/8.png) |

Additional screenshots are available in the [`images`](images) directory.

## Architecture

```text
React client
  -> Axios service layer
  -> Flask blueprints and authentication middleware
      -> domain services
          -> MySQL
          -> local image storage
          -> Groq through LangChain
```

The recommendation service first loads the authenticated user's wardrobe, asks the model for structured item selections, and then verifies every returned ID and name against that user's database records. Invalid selections are rejected instead of being shown to the user.

| Area | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, Tailwind CSS, Material UI |
| Backend | Python 3.12, Flask, Flask-CORS |
| Data | MySQL 8, SQLAlchemy, SQLite chat history |
| Authentication | PyJWT, bcrypt |
| AI recommendations | Groq API, LangChain, Pydantic structured output |
| Development | Docker Compose, pytest |

## Project layout

```text
backend/
  db/                  MySQL schema and initialization data
  src/
    routes/            HTTP endpoints grouped by resource
    services/          Authentication, data, upload, and AI logic
    middlewares/       Request authorization
    tests/             Backend integration tests
  uploads/             Local development image storage
  docker-compose.yaml  API and MySQL services
frontend/
  src/
    components/        Shared and feature components
    contexts/          Application state
    hooks/             Reusable feature hooks
    pages/             Route-level screens
    services/          Backend API clients
    types/             TypeScript domain types
images/                README screenshots
```

## Getting started

### Requirements

- Docker Desktop or Docker Engine with Compose
- Node.js 20 or newer
- A Groq API key for AI recommendations

### 1. Configure and start the backend

```bash
git clone https://github.com/seidmengistu/The_Outfitory.git
cd The_Outfitory/backend
cp .env.example .env
docker compose up --build
```

Edit `backend/.env` before starting:

```env
DB_HOST=db
DB_USER=root
DB_PASSWORD=root
DB_NAME=outfitory
SECRET_KEY=replace-with-a-long-random-value
JWT_EXPIRATION_TIME=7200
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=openai/gpt-oss-20b
```

The API runs at `http://localhost:8000`; MySQL is exposed at `localhost:3306` for local development.

### 2. Start the frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Tests and quality checks

Run the backend tests after the database is available:

```bash
cd backend/src
pytest -q
```

Check and build the frontend with:

```bash
cd frontend
npm run lint
npm run build
```

## Security notes

- Keep JWT secrets, API keys, certificates, and database passwords in ignored environment files or a deployment secret manager.
- Uploaded images, chat history, and database volumes are runtime data and should not be committed.
- Use HTTPS, restricted CORS origins, non-default database credentials, and a production WSGI server before deployment.
- If a credential has ever been committed publicly, removing the file is not sufficient: revoke or rotate the credential and purge it from Git history if necessary.

## Roadmap

- Replace placeholder upload classification with a tested vision-classification provider
- Add frontend component and end-to-end tests
- Add repeatable database migrations
- Add CI for backend tests and frontend lint/build checks
- Move chat history and uploaded media to production-managed storage

## License

Licensed under the [Apache License 2.0](LICENSE).

## Author

[Seid Mengistu](https://github.com/seidmengistu)
