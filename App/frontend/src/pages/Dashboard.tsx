const Dashboard = () => {
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  return (
    <div className="dashboard-wrapper">

     {/* LEFT SIDE */}
  <div className="side-group left">

    <div className="side-info">
      <h4>📈 Productivity</h4>
      <p>Track progress and manage workflows efficiently.</p>
    </div>

    <div className="side-info delay-1">
      <h4>🔐 Secure System</h4>
      <p>Role-based authentication with JWT security.</p>
    </div>

    <div className="side-info delay-2">
      <h4>⚡ High Performance</h4>
      <p>Optimized backend with Prisma & local AI engine.</p>
    </div>

  </div>

      {/* MAIN CONTENT */}
      <div className="dashboard-container">

        {/* WELCOME BLOCK */}
        <div className="welcome-block">
          <h1>Welcome {username}! 🎉</h1>
          <p>
            You are logged in as <strong>{role}</strong>.
          </p>
        </div>

        {/* DETAILS BLOCK */}
        <div className="details-block">
          <h2>Project Management Overview</h2>

          <p>
            This platform enables structured project tracking,
            secure collaboration, and intelligent AI-powered insights.
          </p>

          <ul>
            <li>📁 View and explore available projects</li>
            <li>🔐 Role-based secure access</li>
            <li>🤖 Integrated AI assistant for smart guidance</li>
          </ul>
        </div>

      </div>

      {/* RIGHT SIDE */}
  <div className="side-group right">

    <div className="side-info">
      <h4>🤖 Smart AI</h4>
      <p>Context-aware AI assistant powered by Ollama.</p>
    </div>

    <div className="side-info delay-1">
      <h4>📊 Insights</h4>
      <p>Get structured summaries and project data instantly.</p>
    </div>

    <div className="side-info delay-2">
      <h4>🚀 Growth Ready</h4>
      <p>Scalable architecture for enterprise expansion.</p>
    </div>

  </div>

</div>
  );
};

export default Dashboard;
