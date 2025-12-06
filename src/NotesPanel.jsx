// src/components/NotesPanel.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthContext.jsx";

export default function NotesPanel() {
  const { user } = useAuth();

  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");

  // ─────────────────────────────────────────
  // Cargar notas del usuario
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!user) return;

    const loadNotes = async () => {
      const { data, error } = await supabase
        .from("constella_notes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error cargando notas:", error);
      } else {
        setNotes(data || []);
      }
    };

    loadNotes();
  }, [user]);

  // ─────────────────────────────────────────
  // Guardar una nota nueva
  // ─────────────────────────────────────────
  const handleSaveNote = async () => {
    if (!user) {
      setStatus("Inicia sesión para guardar notas.");
      return;
    }
    if (!text.trim()) {
      setStatus("Escribe algo antes de guardar.");
      return;
    }

    const { data, error } = await supabase
      .from("constella_notes")
      .insert({ user_id: user.id, text: text.trim() })
      .select()
      .single();

    if (error) {
      console.error("Error guardando nota:", error);
      setStatus("Hubo un problema guardando la nota.");
      return;
    }

    // Insertar al inicio de la lista
    setNotes((prev) => [data, ...prev]);
    setText("");
    setStatus("Nota guardada.");
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="panel panel-scroll">
      <div className="panel-header">
        <div>
          <h2>Notas</h2>
          <p className="panel-subtitle">
            Guarda pequeñas ideas, reflexiones y aprendizajes.
          </p>
        </div>
      </div>

      {/* Formulario */}
      <section className="notes-section">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe una nota rápida..."
        />

        <button className="primary-btn" onClick={handleSaveNote}>
          Guardar nota
        </button>

        {status && <p className="helper-text">{status}</p>}
      </section>

      {/* Lista de notas */}
      <section className="notes-section">
        <ul className="notes-list">
          {notes.map((n) => (
            <li key={n.id} className="note-item">
              <div className="note-bullet" />
              <p className="note-text">{n.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {notes.length === 0 && (
        <p className="empty-text">
          Aún no has guardado notas. Empieza escribiendo tu primera idea.
        </p>
      )}
    </div>
  );
}