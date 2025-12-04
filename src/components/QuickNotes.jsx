import React, { useState } from "react";

export default function QuickNotes() {
  const [text, setText] = useState("");
  const [notes, setNotes] = useState([]);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setNotes((prev) => [
      {
        id: prev.length ? prev[prev.length - 1].id + 1 : 1,
        text: trimmed,
      },
      ...prev,
    ]);

    setText("");
  };

  return (
    <div className="panel panel-scroll">
      <div className="panel-header">
        <div>
          <h2>Notas rápidas</h2>
          <p className="panel-subtitle">
            Apunta ideas sueltas, frases, pensamientos. Espacio personal.
          </p>
        </div>
      </div>

      <div className="form">
        <label className="field">
          <span>Escribe una nota</span>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Una idea, algo que no quieres olvidar, una sensación..."
          />
        </label>
        <button type="button" className="primary-btn" onClick={handleAdd}>
          Guardar nota (solo en memoria)
        </button>
        <p className="helper-text">
          Estas notas no se guardan en servidor, solo viven mientras la app está
          abierta.
        </p>
      </div>

      <section className="notes-section">
        {notes.length === 0 ? (
          <p className="empty-text">
            Tu mente está despejada aquí. Cuando escribas algo, lo verás como
            una pequeña galaxia de ideas.
          </p>
        ) : (
          <ul className="notes-list">
            {notes.map((n) => (
              <li key={n.id} className="note-item">
                <div className="note-bullet" />
                <p className="note-text">{n.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}