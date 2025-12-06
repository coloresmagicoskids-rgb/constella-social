// src/components/CreateMoment.jsx
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const MOODS = ["inspirado", "reflexivo", "agradecido", "tranquilo", "intenso"];

const VISIBILITIES = [
  { value: "connections", label: "Conexiones" },
  { value: "public", label: "Público" },
  { value: "private", label: "Solo yo" },
];

export default function CreateMoment({ circles, selectedCircle }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("inspirado");
  const [visibility, setVisibility] = useState("connections");
  const [circleId, setCircleId] = useState(selectedCircle?.id || "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setStatus("Ponle un título al momento.");
      return;
    }

    if (!circleId) {
      setStatus("Selecciona un círculo.");
      return;
    }

    setLoading(true);
    setStatus("");

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setStatus("Sesión no válida.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("constella_moments").insert({
      user_id: user.id,
      circle_id: circleId,
      title: title.trim(),
      content: content.trim(),
      mood,
      visibility,
    });

    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Momento creado correctamente.");
      setTitle("");
      setContent("");
      setMood("inspirado");
      setVisibility("connections");
    }

    setLoading(false);
  };

  return (
    <div className="panel panel-scroll">
      <div className="panel-header">
        <div>
          <h2>Crear momento</h2>
          <p className="panel-subtitle">
            Un destello corto que quedará en tu constelación.
          </p>
        </div>
      </div>

      <form className="form" onSubmit={handlePublish}>
        {/* CÍRCULO */}
        <label className="field">
          <span>Círculo</span>
          <select
            value={circleId}
            onChange={(e) => setCircleId(e.target.value)}
          >
            <option value="">Elige un círculo...</option>
            {circles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        {/* TÍTULO */}
        <label className="field">
          <span>Título</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej.: Borrador de un poema nuevo"
          />
        </label>

        {/* DESCRIPCIÓN */}
        <label className="field">
          <span>Descripción / detalle</span>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Cuenta brevemente qué pasó, qué sentiste o qué aprendiste."
          />
        </label>

        {/* ESTADO DE ÁNIMO */}
        <label className="field">
          <span>Estado de ánimo</span>
          <div className="emotion-row">
            {MOODS.map((m) => {
              const isActive = mood === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMood(m);
                    console.log("Mood seleccionado:", m);
                  }}
                  className="chip"
                  style={{
                    pointerEvents: "auto",
                    cursor: "pointer",
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: isActive
                      ? "rgba(255,255,255,0.9)"
                      : "rgba(255,255,255,0.3)",
                    background: isActive
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                    color: "#f9fafb",
                    fontSize: "0.8rem",
                    fontWeight: isActive ? 600 : 400,
                    transition: "all 0.15s ease",
                  }}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </label>

        {/* VISIBILIDAD */}
        <label className="field">
          <span>Visibilidad</span>
          <div className="emotion-row">
            {VISIBILITIES.map((v) => {
              const isActive = visibility === v.value;
              return (
                <button
                  key={v.value}
                  type="button"
                  onClick={() => {
                    setVisibility(v.value);
                    console.log("Visibilidad seleccionada:", v.value);
                  }}
                  className="chip"
                  style={{
                    pointerEvents: "auto",
                    cursor: "pointer",
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "1px solid",
                    borderColor: isActive
                      ? "rgba(125,211,252,1)"
                      : "rgba(148,163,184,0.6)",
                    background: isActive
                      ? "rgba(56,189,248,0.18)"
                      : "transparent",
                    color: "#e5e7eb",
                    fontSize: "0.8rem",
                    fontWeight: isActive ? 600 : 400,
                    transition: "all 0.15s ease",
                  }}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </label>

        {/* BOTÓN PUBLICAR */}
        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Guardando..." : "Publicar momento"}
        </button>

        {status && <p className="helper-text">{status}</p>}
      </form>
    </div>
  );
}