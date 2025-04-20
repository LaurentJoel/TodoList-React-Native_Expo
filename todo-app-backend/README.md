# Todo App Backend

Node.js/Express backend for the Todo application with PostgreSQL database.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure Database:

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_db
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=3000
NODE_ENV=development
```

3. Database Setup:

```sql
-- Create database
CREATE DATABASE todo_db;

-- Create todos table
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    category VARCHAR(50) DEFAULT 'general',
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

4. Start the server:

```bash
npm run dev
```

## API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create new todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

## Environment Variables

| Variable    | Description       | Default   |
| ----------- | ----------------- | --------- |
| DB_HOST     | Database host     | localhost |
| DB_PORT     | Database port     | 5432      |
| DB_NAME     | Database name     | todo_db   |
| DB_USER     | Database user     | -         |
| DB_PASSWORD | Database password | -         |
| PORT        | Server port       | 3000      |

## Error Handling

The API returns standard HTTP status codes:

- 200: Success
- 400: Bad Request
- 404: Not Found
- 500: Server Error
