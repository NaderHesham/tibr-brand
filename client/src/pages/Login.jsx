import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/stores/auth";
import { useToast } from "@/components/ui/Toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const signIn = useAuth((s) => s.signIn);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      toast("Welcome back!");
      navigate("/account");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="store-container auth">
      <motion.div
        className="auth__card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="auth__brand">
          <Link className="store-wordmark" to="/" style={{ fontSize: "1.8rem" }}>
            Tibr<span className="dot">.</span>
          </Link>
        </div>
        <h1 className="auth__title">Sign in</h1>
        <p className="auth__sub">Welcome back to Tibr.</p>

        <form className="auth__form" onSubmit={handleSubmit} noValidate>
          <div className={`field${error ? " is-invalid" : ""}`}>
            <label className="field__label" htmlFor="email">
              Email <span className="field__req" aria-hidden="true">*</span>
            </label>
            <input
              id="email"
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={`field${error ? " is-invalid" : ""}`}>
            <label className="field__label" htmlFor="password">
              Password <span className="field__req" aria-hidden="true">*</span>
            </label>
            <input
              id="password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <p className="field__error" role="alert">{error}</p>}
          </div>

          <div className="auth__row">
            <span />
            <Link className="auth__link" to="/forgot-password">Forgot password?</Link>
          </div>

          <button
            className={`btn btn--primary btn--block btn--lg${loading ? " is-loading" : ""}`}
            type="submit"
            disabled={loading}
          >
            {loading ? "" : "Sign in"}
          </button>
        </form>

        <p className="auth__switch">
          New to Tibr? <Link to="/signup">Create account</Link>
        </p>
      </motion.div>
    </div>
  );
}
