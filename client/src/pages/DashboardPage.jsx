import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <header>
        <h1>AI Resume + Interview Coach</h1>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          {" | "}
          <Link to="/resume">My Resume</Link>
          {" | "}
          <Link to="/interview">Interview Coach</Link>
        </nav>
      </header>

      <main>
        <h2>Welcome, {user?.name}!</h2>

        <p>Email: {user?.email}</p>

        <section>
          <h3>Resume Coach</h3>

          <p>
            Upload your resume, analyze it with AI, improve
            your content, edit your resume, and generate a PDF.
          </p>

          <Link to="/resume">
            <button type="button">
              Open Resume Coach
            </button>
          </Link>
        </section>

        <section>
          <h3>Interview Coach</h3>

          <p>
            Practice interview questions and receive
            AI-powered feedback.
          </p>

          <Link to="/interview">
            <button type="button">
              Start Interview
            </button>
          </Link>
        </section>

        <section>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;