const Dashboard = () => {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  return (
    <div className="home">
      <h1>Welcome {username}! 🎉</h1>
      <p>
        You are logged in as <strong>{role}</strong>.
      </p>
    </div>
  );
};

export default Dashboard;
