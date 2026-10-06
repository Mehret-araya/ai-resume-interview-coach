
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0A0A0A] px-4 text-white sm:px-6">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/4 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="absolute -left-40 top-40 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />

        <div className="absolute -right-40 top-[45%] h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-2 py-8 md:py-12">
        {/* Header */}
        <header className="mb-12 flex flex-col gap-6 border-b border-white/10 pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link
              to="/dashboard"
              className="text-xl font-semibold tracking-tight text-white"
            >
              AI Career <span className="text-purple-400">+</span>{" "}
              Interview Coach
            </Link>

            <p className="mt-1 text-sm text-zinc-500">
              Your AI-powered career preparation workspace
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <Link
              to="/dashboard"
              className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Dashboard
            </Link>

            <Link
              to="/resume"
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              My Resume
            </Link>

            <Link
              to="/interview"
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              Interview Coach
            </Link>
          </nav>
        </header>

        <main>
          {/* Welcome section */}
          <section className="mb-10">
            <p className="mb-4 text-sm uppercase tracking-[0.25em] text-zinc-500">
              AI Career Assistant
            </p>

            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              Welcome,{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {user?.name}
              </span>
              !
            </h1>

            <p className="mt-4 text-sm text-zinc-400 md:text-base">
              Continue improving your resume and preparing for your next
              interview.
            </p>

            <p className="mt-2 text-sm text-zinc-500">
              {user?.email}
            </p>
          </section>

          {/* Coach cards */}
          <section className="grid gap-6 md:grid-cols-2">
            {/* Resume Coach */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(168,85,247,0.12)] backdrop-blur-md transition hover:border-purple-400/20 hover:bg-white/[0.07] md:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-xl text-purple-400">
                📄
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Resume Coach
              </h2>

              <p className="mt-3 min-h-[72px] text-sm leading-6 text-zinc-400">
                Upload your resume, analyze it with AI, improve your content,
                edit your resume, and generate a PDF.
              </p>

              <Link
                to="/resume"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,0.35)] transition hover:from-purple-500 hover:to-pink-500"
              >
                Open Resume Coach
              </Link>
            </div>

            {/* Interview Coach */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_0_40px_rgba(168,85,247,0.12)] backdrop-blur-md transition hover:border-pink-400/20 hover:bg-white/[0.07] md:p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500/10 text-xl text-pink-400">
                🎤
              </div>

              <h2 className="text-2xl font-semibold text-white">
                Interview Coach
              </h2>

              <p className="mt-3 min-h-[72px] text-sm leading-6 text-zinc-400">
                Practice interview questions and receive AI-powered feedback
                to improve your interview performance.
              </p>

              <Link
                to="/interview"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 font-semibold text-white shadow-[0_0_25px_rgba(168,85,247,0.35)] transition hover:from-purple-500 hover:to-pink-500"
              >
                Start Interview
              </Link>
            </div>
          </section>

          {/* Logout */}
          <section className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-medium text-zinc-400 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-400"
            >
              Logout
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;

