import React, { useState } from "react";
import "./Register.css"; // Archivo CSS para estilos
import logo from "../assets/logo.png"; // Importa el logo

function Register() {
  const [step, setStep] = useState(1); // Controla la etapa (1 = confirmar correo, 2 = registro completo)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }
    setError("");
    setStep(2); // Pasar al paso de registro
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setError("");
    alert("¡Registro exitoso!");
  };

  return (
    <div className="register-container">
      <form
        className="register-form"
        onSubmit={step === 1 ? handleEmailSubmit : handleRegisterSubmit}
      >
        {/* Logo */}
        <div className="logo-container">
          <img src={logo} alt="Logo" className="logo-image" />
        </div>

        {/* Título */}
        <h2 className="form-title">
          {step === 1 ? "Confirmar Correo" : "Registro"}
        </h2>

        {/* Paso 1: Confirmar Correo */}
        {step === 1 && (
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              placeholder="ejemplo@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="register-button">
              Confirmar Correo
            </button>
          </div>
        )}

        {/* Paso 2: Registro */}
        {step === 2 && (
          <>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar Contraseña</label>
              <input
                type="password"
                placeholder="Confirma tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="register-button">
              Registrarse
            </button>
          </>
        )}

        {/* Botón para ir a Login */}
        <div className="redirect-login">
          <p>¿Ya tienes una cuenta?</p>
          <button
            type="button"
            onClick={() => (window.location.href = "/login")}
            className="login-redirect-button"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
