import React, { useState } from "react";

const SUGGESTED_COLORS = ["#f97316", "#22c55e", "#38bdf8", "#e11d48", "#a855f7"];

export default function CirclesManager({ circles, onAddCircle }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(SUGGESTED_COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Ponle un nombre al círculo.");
      return;
    }
    onAddCircle({
      name: name.trim(),
      description: description.trim() || "Sin descripción aún.",
      color,
    });
    setName("");
    setDescription("");
  };

  return (
    <div className="panel panel-scroll">
      <div className="panel-header">
        <div>
          <h2>Círculos</h2>
          <p className="panel-subtitle">
            Diseña las áreas clave que formarán tu constelación.
          </p>
        </div>
      </div>

      <section className="circles-section">
        <h3 className="section-title">Círculos actuales</h3>
        {circles.length === 0 ? (
          <p className="empty-text">
            Aún no has creado círculos. Empieza definiendo las áreas que más
            importan en tu vida.
          </p>
        ) : (
          <ul className="circles-list">
            {circles.map((c) => (
              <li key={c.id} className="circles-item">
                <div
                  className="circle-dot"
                  style={{ backgroundColor: c.color }}
                />
                <div className="circle-detail-main">
                  <span className="circle-detail-name">{c.name}</span>
                  <p className="circle-detail-description">{c.description}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="circles-section">
        <h3 className="section-title">Crear un nuevo círculo</h3>
        <form className="form" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nombre del círculo</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej.: Proyectos, Familia, Fe, Juego..."
            />
          </label>

          <label className="field">
            <span>Descripción breve</span>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Qué representa este círculo en tu vida?"
            />
          </label>

          <label className="field">
            <span>Color</span>
            <div className="color-row">
              {SUGGESTED_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={
                    c === color ? "color-dot active" : "color-dot"
                  }
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </label>

          <button type="submit" className="primary-btn">
            Añadir círculo
          </button>
        </form>
      </section>
    </div>
  );
}
