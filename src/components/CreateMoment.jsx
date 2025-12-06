// src/components/CreateMoment.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

const MOODS = ["inspirado", "reflexivo", "agradecido", "tranquilo", "intenso"];

const VISIBILITIES = [
  { value: "connections", label: "Conexiones" },
  { value: "public", label: "Público" },
  { value: "private", label: "Solo yo" },
];

export default function CreateMoment({ circles: circlesProp = [], selectedCircle }) {
  const { user } = useAuth();

  // Si en algún momento quieres que este componente se auto-alimente desde Supabase,
  // podemos usar este estado + useEffect. Por ahora usa circlesProp como fuente principal.
  const [circles, setCircles] = useState(circlesProp || []);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("inspirado");
  const [visibility, setVisibility] = useState("connections");
  const [circleId, setCircleId] = useState(selectedCircle?.id || "");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // Sincroniza círculos locales si parent cambia circlesProp
  useEffect(() => {
    setCircles(circlesProp || []);
  }, [circlesProp]);

  // Si cambia el círculo seleccionado desde fuera, actualizamos el select
  useEffect(() => {
    if (selectedCircle?.id) {
      setCircleId(selectedCircle.id);
    }
  }, [selectedCircle]);

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!user) {
      setStatus("Sesión no válida. Vuelve a iniciar sesión.");
      return;
    }

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

    const { error } = await supabase.from("constella_moments").insert({
      user_id: user.id,
      circle_id: circleId,
      title: title.trim(),
      content: content.trim(),
      mood,
      visibility,
    });

    if (error) {
      console.error("Error creando momento:", error);
      setStatus(error.message || "Hubo un problema creando el momento.");
    } else {
      setStatus("Momento creado.");
      setTitle("");
      setContent("");
      // si quieres, aquí podríamos resetear mood/visibility a defaults
      // setMood("inspirado");
      // setVisibility("connections");
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
        <label className="field">
          <span>Círculo</span>
          <select
            value={circleId || ""}
            onChange={(e) => setCircleId(e.target.value || "")}
          >
            <option value="">Elige un círculo...</option>
            {circles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Título</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej.: Borrador de un poema nuevo"
          />
        </label>

        <label className="field">
          <span>Descripción / detalle</span>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Cuenta brevemente qué pasó, qué sentiste o qué aprendiste."
          />
        </label>

        <label className="field">
          <span>Estado de ánimo</span>
          <div className="emotion-row">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                className={mood === m ? "chip chip-primary" : "chip"}
                onClick={() => setMood(m)}
              >
                {m}
              </button>
            ))}
          </div>
        </label>

        <label className="field">
          <span>Visibilidad</span>
          <div className="emotion-row">
            {VISIBILITIES.map((v) => (
              <button
                key={v.value}
                type="button"
                className={
                  visibility === v.value ? "chip chip-primary" : "chip"
                }
                onClick={() => setVisibility(v.value)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </label>

        <button type="submit" className="primary-btn" disabled={loading}>
          {loading ? "Guardando..." : "Publicar momento"}
        </button>

        {status && <p className="helper-text">{status}</p>}
      </form>
    </div>
  );
}