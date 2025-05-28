 # TechLearn Solutions

**TechLearn Solutions** is a web-based platform designed to help users learn web development through interactive coding exercises. It offers a modern, responsive interface for practicing HTML, CSS, and JavaScript, tracking progress, and managing user profiles.

---

## 🚀 Features

- **Authentication**: Secure sign-in and sign-up with validation for email, password, mobile number, and gender.
- **Dashboard**: Displays user progress, module status, statistics (completed modules, streak), and recommended actions.
- **Exercise Environment**: Integrated code editors for HTML, CSS, and JavaScript with live preview, progress saving, and submission capabilities.
- **Profile**: View and update user details, including username, email, mobile number, and bio.
- **Progress Tracking**: Tracks module status ("not started", "started", "completed") stored in MongoDB.
- **Dark Mode**: Toggleable light/dark theme on the exercise page.
- **Responsive UI**: Built with Tailwind CSS for seamless mobile and desktop compatibility.

---

## 🛠 Techstack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose, EJS
- **Frontend**: Tailwind CSS, CodeMirror (code editors), Font Awesome (icons), Poppins font
- **Database**: MongoDB for storing user data and module progress
- **Session Management**: Express-session for authentication

---

## 📁 Project Structure

```
FinalRoundProject/
├── models/
│   └── User.js                 # User schema (name, email, modules, etc.)
|
├── views/
│   ├── signin.ejs                # Sign-in/sign-up page
│   ├── dashboard.ejs           # User dashboard
│   ├── exercise.ejs            # Coding exercise page
│   └── profile.ejs             # User profile page
├── public/
│   └── styles.css              # CSS styles
├── package.json                # Dependencies
└── README.md                   # This file
```

---

## ⚙️ Setup

### ✅ Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### 🧩 Installation

1. **Clone the repository**:
   ```bash
   git clone hhttps://github.com/Srinu-29/FinalRoundProject.git
   cd FinalRoundProject
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with the following:
   ```
   MONGODB_URI=your-mongodb-uri
   SESSION_SECRET=your-secret
   PORT=3000
   ```

4. **Start MongoDB** (ensure it's running locally or connected to MongoDB Atlas).

5. **Run the application**:
   ```bash
   npm start
   ```

6. **Access the app**:
   ```
   http://localhost:3000
   ```

---

## 📚 Usage

### 🔐 Sign Up / Sign In

- Navigate to `/` to sign up (name, email, mobile, gender, password) or sign in (email, password).

### 🧭 Dashboard `/dashboard`

- View progress, statistics, and start exercises.

### ✍️ Exercises `/Exercise/:moduleId`

- Write code in HTML, CSS, and JavaScript editors.
- Click **Run** to see a live preview.
- **Save Progress** marks the module as `"started"`.
- **Submit** marks the module as `"completed"`.

### 👤 Profile `/profile`

- View and edit username, email, mobile number, and bio.

### 🌙 Dark Mode

- Toggle light/dark theme in the exercise page navbar.

### 🚪 Logout

- Click **Logout** in the navbar.

---

## 🔑 Key Components

- **User Schema** (`User.js`): Stores user details, module progress, and code submissions.
- 
- **Pages**:
  - `signin.ejs`: Tabbed forms for authentication.
  - `dashboard.ejs`: Overview of progress and modules.
  - `exercise.ejs`: Code editors with live preview.
  - `profile.ejs`: User details and bio update form.

---

## 🤝 Contributing

1. **Fork** the repository.
2. **Create a branch**:
   ```bash
   git checkout -b feature/your-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "Add feature"
   ```
4. **Push to GitHub**:
   ```bash
   git push origin feature/your-feature
   ```
5. **Open a pull request**.

---
# Team Members

- J Srinivas
- Ahmad

© 2025 TechLearn Solutions
