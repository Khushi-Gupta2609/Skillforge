# SkillForge: Your AI-Powered Career Planning Platform

<div align="center">
  <img src="/src/assets/skillfroge.png" alt="SkillForge Logo" width="200" height="auto">
</div>

SkillForge is a comprehensive web application designed to empower individuals on their career learning journey. Leveraging the power of AI, it provides personalized learning roadmaps, facilitates goal tracking, offers AI-powered mock interviews, and presents detailed analytics to monitor skill development and progress.

## ✨ Features

- **Personalized Learning Roadmaps:** Generate custom learning paths tailored to your career goals and current skill level using AI
- **Career Goal Tracking:** Define, manage, and track your career milestones with detailed progress indicators
- **AI-Powered Mock Interviews:** Practice for job interviews with AI-generated questions and receive comprehensive feedback to improve your performance
- **Skill Assessment & Analytics:** Visualize your skill development with radar charts and track overall learning progress, daily streaks, and weekly hours
- **Activity Feed:** Stay updated with your recent learning achievements and milestones
- **User Profiles:** Manage your professional details, including current role, target role, experience, location, and skills
- **Theming:** Toggle between light and dark modes for a comfortable user experience
- **Notifications:** Receive timely updates and reminders about your learning journey
- **Responsive Design:** A seamless experience across various devices

## 🚀 Technologies Used

**Frontend:**
- React
- TypeScript
- Tailwind CSS (for styling)
- Lucide React (for icons)
- React Router DOM (for navigation)

**Backend/AI:**
- Firebase (Authentication, Realtime Database)
- Google Gemini API (for AI-powered features like roadmap generation, interview questions, and evaluation)

**Build Tool:**
- Vite

## 🛠️ Link to [Live Demo](https://skillforge-smoky.vercel.app/)

## 🛠️ Installation & Setup

To get SkillForge up and running on your local machine, follow these steps:

### Prerequisites

- Node.js (LTS version recommended)
- npm or Yarn
- Firebase account
- Google AI Studio account

### 1. Clone the repository

```bash
git clone https://github.com/abdalazizesam/skillforge.git
cd skillforge
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase & Gemini Configuration

SkillForge uses Firebase for user authentication and data storage, and Google Gemini for AI capabilities. You'll need to set up your own Firebase project and obtain a Gemini API key.

#### Create a Firebase Project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Enable Firebase Authentication (Email/Password and Google Sign-In providers)
5. Enable Realtime Database (start in test mode for quick setup, then secure your rules)
6. Copy your Firebase configuration object

#### Obtain a Google Gemini API Key:

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API Key

#### Create a .env.local file:

In the root of your project, create a file named `.env.local` and add your Firebase and Gemini API keys:

```env
VITE_FIREBASE_API_KEY="YOUR_FIREBASE_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="YOUR_FIREBASE_AUTH_DOMAIN"
VITE_FIREBASE_PROJECT_ID="YOUR_FIREBASE_PROJECT_ID"
VITE_FIREBASE_STORAGE_BUCKET="YOUR_FIREBASE_STORAGE_BUCKET"
VITE_FIREBASE_MESSAGING_SENDER_ID="YOUR_FIREBASE_MESSAGING_SENDER_ID"
VITE_FIREBASE_APP_ID="YOUR_FIREBASE_APP_ID"
VITE_FIREBASE_DATABASE_URL="YOUR_FIREBASE_DATABASE_URL"
VITE_GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

Replace the placeholder values with your actual keys and URLs. Ensure `VITE_FIREBASE_DATABASE_URL` is correctly set for the Realtime Database.

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

This will start the development server, usually on `http://localhost:5173`. Open your browser and navigate to this URL.



## 🔧 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## 🚀 Deployment

The project is configured to work with various hosting platforms. For deployment:

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your preferred hosting service (Vercel, Netlify, Firebase Hosting, etc.)
3. Make sure to set your environment variables in your hosting platform's dashboard

## 🤝 Contributing

Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, please feel free to:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'feat: Add new feature X'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request

## 📝 Development Guidelines

- Follow the existing code style and conventions
- Write meaningful commit messages using conventional commits
- Add tests for new features when applicable
- Update documentation as needed

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the existing [Issues](https://github.com/abdalazizesam/skillforge/issues)
2. Create a new issue with detailed information about the problem
3. Include steps to reproduce the issue and your environment details

## 📄 License

This project is open-sourced under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Thanks to all contributors who help improve SkillForge
- Built with React, TypeScript, and powered by Google Gemini AI
- Icons provided by Lucide React

---

Made with ❤️ for career development and continuous learning
