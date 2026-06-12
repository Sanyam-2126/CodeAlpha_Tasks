# CodeAlpha Project Management Tool

A responsive full-stack Project Management Tool (Trello/Asana style) built using **HTML, CSS, JavaScript (Vanilla SPA)**, **Node.js**, **Express.js**, and **MongoDB**. 

This project is designed with rich aesthetics (HSL color styling, responsive sidebar navigation, progress ring dashboard stats, and interactive modals) while maintaining a clean, well-commented student/internship codebase.

---

## Features

- 👤 **User Registration & Login**: Custom secure auth system with JWT tokens.
- 📁 **Project Management**: CRUD operations for projects (Only owners can edit/delete; projects cascade delete all associated tasks and comments).
- 📋 **Task Kanban Board**: CRUD operations for tasks, organized into *To Do*, *In Progress*, and *Completed* columns.
- ⚙️ **Task Metadata**: Status, Priority (Low, Medium, High), Due Dates (with overdue indicator), and Assignees.
- 🔍 **Filters & Search**: Live task searches and filters by projects and priority levels.
- 💬 **Comments System**: Threaded comments inside tasks to facilitate task collaboration.
- 📊 **Interactive Dashboard**: Statistics overview showing total projects, tasks, status distribution, and a dynamic progress completion circle.
- 🗂️ **Database Seeder**: Pre-populate database with dummy projects, tasks, users, and comments for quick evaluation.

---

## Folder Structure

```text
CodeAlpha_Project_Management_Tool/
├── config/
│   └── db.js                 # MongoDB database connection helper
├── middleware/
│   └── auth.js               # JWT security protecting REST API routes
├── models/
│   ├── User.js               # User authentication Schema (with bcrypt hashing)
│   ├── Project.js            # Project Schema (Name, description, owner)
│   ├── Task.js               # Task Schema (Title, description, priority, status, due date)
│   └── Comment.js            # Comment Schema (Task association, user details)
├── public/                   # Static Single Page Application (SPA) frontend
│   ├── css/
│   │   └── style.css         # Modern styling & design system (Kanban boards, modal animations)
│   ├── js/
│   │   └── app.js            # Frontend router, state management, and fetch client
│   └── index.html            # Main SPA frontend HTML markup
├── routes/                   # Back-end Express REST API endpoints
│   ├── auth.js               # Registration, login, user directories
│   ├── projects.js           # Projects CRUD endpoints
│   ├── tasks.js              # Tasks CRUD endpoints
│   ├── comments.js           # Thread comments endpoints
│   └── dashboard.js          # Main statistics and counters
├── .env                      # Application environment variables configuration
├── package.json              # NPM dependencies and project script configurations
├── seed.js                   # MongoDB data seed script
└── server.js                 # Express server entry point configuration
```

---

## MongoDB Schema Details

### 1. User
- `username`: String (Unique, required, minimum 3 chars)
- `email`: String (Unique, required, valid email format)
- `password`: String (Required, minimum 6 chars, hashed via bcrypt)
- `createdAt`: Date (Defaults to current timestamp)

### 2. Project
- `name`: String (Required, maximum 100 chars)
- `description`: String (Maximum 500 chars)
- `owner`: ObjectId (Ref: `User`, required)
- `createdAt`: Date (Defaults to current timestamp)

### 3. Task
- `title`: String (Required, maximum 100 chars)
- `description`: String (Maximum 1000 chars)
- `status`: String (Enum: `To Do`, `In Progress`, `Completed`, default: `To Do`)
- `priority`: String (Enum: `Low`, `Medium`, `High`, default: `Medium`)
- `dueDate`: Date (Optional task deadline)
- `project`: ObjectId (Ref: `Project`, required)
- `assignedTo`: ObjectId (Ref: `User`, optional)
- `owner`: ObjectId (Ref: `User`, creator reference)
- `createdAt`: Date (Defaults to current timestamp)

### 4. Comment
- `content`: String (Required, maximum 1000 chars)
- `task`: ObjectId (Ref: `Task`, required)
- `user`: ObjectId (Ref: `User`, required)
- `createdAt`: Date (Defaults to current timestamp)

---

## Setup Guide

### 1. Prerequisites
- **Node.js** installed (v16+ recommended).
- **MongoDB** running locally on default port `27017` (or access to a MongoDB Atlas cloud URI).

### 2. Install Dependencies
Navigate to the root workspace directory and run:
```bash
npm install
```

### 3. Configure Environments
Create a file named `.env` in the root folder (pre-created defaults are provided):
```ini
PORT=3000
MONGO_URI=mongodb://localhost:27017/project_manager
JWT_SECRET=student_internship_jwt_secret_key_123456
NODE_ENV=development
```

### 4. Populate Dummy Data (Seeder)
To load the system with dummy users, projects, tasks, and comment logs, execute:
```bash
node seed.js
```
This registers the following users for logging in:
- **User 1**: Email `alice@example.com` | Password `password123` (Owner of *Website Redesign* project)
- **User 2**: Email `bob@example.com` | Password `password123` (Owner of *Mobile App Launch* project)
- **User 3**: Email `charlie@example.com` | Password `password123`

### 5. Launch the Server
To run the developer server, use:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your web browser.
