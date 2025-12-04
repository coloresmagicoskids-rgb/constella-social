import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const YEARS = Array.from({ length: 90 }, (_, i) => 2025 - i);
const MONTHS = [
  "ene.",
  "feb.",
  "mar.",
  "abr.",
  "may.",
  "jun.",
  "jul.",
  "ago.",
  "sept.",
  "oct.",
  "nov.",
  "dic.",
];
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function AuthPanel() {
  const [view, setView] = useState("login"); // login | signup

  // login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [day, setDay] = useState(1);
  const [month, setMonth] = useState("dic.");
  const [year, setYear] = useState(2000);
  const [gender, setGender] = useState("Hombre"); // Mujer | Hombre | Personalizado

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) throw error;
      setStatus("Inicio de sesión correcto.");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    const email = signupEmail.trim();
    const password = signupPassword;
    const displayName = `${firstName} ${lastName}`.trim();
    const usernameBase = email.split("@")[0] || "usuario";

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      const user = data.user;
      if (user) {
        // Guardar perfil básico en constella_profiles
        await supabase.from("constella_profiles").upsert({
          id: user.id,
          username: usernameBase,
          display_name: displayName || usernameBase,
        });
      }

      setStatus("Cuenta creada. Revisa tu correo para confirmar.");
      setView("login");
    } catch (err) {
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        {/* LADO IZQUIERDO: marca / mensaje */}
        <div className="auth-left">
          <h1 className="auth-brand">CONSTELLA</h1>
          <p className="auth-tagline">
            Conecta tus momentos, tus círculos y tus conexiones en una sola
            constelación personal.
          </p>
        </div>

        {/* LADO DERECHO: tarjetas */}
        <div className="auth-right">
          {/* Tarjeta de login */}
          {view === "login" && (
            <>
              <div className="auth-login-card">
                <form onSubmit={handleLogin}>
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="Correo electrónico"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                  <input
                    className="auth-input"
                    type="password"
                    placeholder="Contraseña"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="submit"
                    className="auth-btn-primary"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : "Iniciar sesión"}
                  </button>

                  <div className="auth-forgot">
                    <button
                      type="button"
                      className="auth-forgot-link"
                      onClick={() =>
                        setStatus(
                          "Para recuperar la contraseña, usa la opción de reset de contraseña de Supabase o implementa esa ruta luego."
                        )
                      }
                    >
                      ¿Has olvidado la contraseña?
                    </button>
                  </div>

                  {status && <p className="auth-status-text">{status}</p>}

                  <div className="auth-divider" />

                  <div className="auth-create-btn-wrapper">
                    <button
                      type="button"
                      className="auth-btn-secondary"
                      onClick={() => {
                        setView("signup");
                        setStatus("");
                      }}
                    >
                      Crear una cuenta nueva
                    </button>
                  </div>
                </form>
              </div>

              <p className="auth-small-note">
                Constella V2 · Inspirada en la sencillez de los formularios
                clásicos, pero pensada para un universo propio.
              </p>
            </>
          )}

          {/* Tarjeta de registro estilo Facebook */}
          {view === "signup" && (
            <div className="auth-register-card">
              <div className="auth-register-header">
                <h2>Crea una cuenta nueva</h2>
                <p>Es rápido y sencillo.</p>
              </div>

              <form onSubmit={handleSignup}>
                <div className="auth-register-row">
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Nombre"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Apellidos"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>

                <label className="auth-label">Fecha de nacimiento</label>
                <div className="auth-register-row">
                  <select
                    className="auth-input"
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    className="auth-input"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    className="auth-input"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="auth-label">Género</label>
                <div className="auth-register-row">
                  <label className="auth-gender-option">
                    <span>Mujer</span>
                    <input
                      type="radio"
                      name="gender"
                      value="Mujer"
                      checked={gender === "Mujer"}
                      onChange={(e) => setGender(e.target.value)}
                    />
                  </label>
                  <label className="auth-gender-option">
                    <span>Hombre</span>
                    <input
                      type="radio"
                      name="gender"
                      value="Hombre"
                      checked={gender === "Hombre"}
                      onChange={(e) => setGender(e.target.value)}
                    />
                  </label>
                  <label className="auth-gender-option">
                    <span>Personalizado</span>
                    <input
                      type="radio"
                      name="gender"
                      value="Personalizado"
                      checked={gender === "Personalizado"}
                      onChange={(e) => setGender(e.target.value)}
                    />
                  </label>
                </div>

                <input
                  className="auth-input"
                  type="email"
                  placeholder="Número de móvil o correo electrónico"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />

                <input
                  className="auth-input"
                  type="password"
                  placeholder="Contraseña nueva"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />

                <p className="auth-legal-text">
                  Al hacer clic en Registrarte, aceptas las bases de uso de
                  Constella. Más adelante puedes editar tu perfil y tu
                  constelación personal.
                </p>

                {status && <p className="auth-status-text">{status}</p>}

                <button
                  type="submit"
                  className="auth-btn-secondary"
                  disabled={loading}
                >
                  {loading ? "Creando cuenta..." : "Registrarte"}
                </button>

                <button
                  type="button"
                  className="auth-back-login"
                  onClick={() => {
                    setView("login");
                    setStatus("");
                  }}
                >
                  ¿Ya tienes una cuenta? Inicia sesión
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}