import { useAuth } from "../context/AuthContext.jsx";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div>
      <h1>Dashboard</h1>

      <p>Welcome, {user?.name}!</p>

      <p>Email: {user?.email}</p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default DashboardPage;