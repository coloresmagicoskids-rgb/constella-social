import React from "react";

export default function MyConstellation({ circles, selectedCircleId, onSelectCircle }) {
  return (
    <div className="panel panel-constellation">
      <div className="panel-header">
        <div>
          <h2>Mi constelación</h2>
          <p className="panel-subtitle">
            Cada círculo es un área importante de tu vida.
          </p>
        </div>
      </div>

      <div className="constellation-wrapper">
        <div className="constellation-core">
          <span className="core-label">Yo</span>
        </div>

        {circles.map((c, index) => {
          const angle = (index / circles.length) * Math.PI * 2;
          const radius = 90;
          const x = 50 + radius * Math.cos(angle);
          const y = 50 + radius * Math.sin(angle);
          const isSelected = c.id === selectedCircleId;

          return (
            <button
              key={c.id}
              className={`circle-node ${isSelected ? "selected" : ""}`}
              style={{
                "--node-color": c.color,
                left: `${x}%`,
                top: `${y}%`,
              }}
              onClick={() => onSelectCircle(c.id)}
            >
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>

      <div className="constellation-info">
        {circles.length === 0 ? (
          <p className="empty-text">
            Aún no tienes círculos. Crea algunos en la sección <strong>Círculos</strong>.
          </p>
        ) : (
          <>
            <h3>Detalle del círculo seleccionado</h3>
            {(() => {
              const sel = circles.find((c) => c.id === selectedCircleId) || circles[0];
              return (
                <div className="circle-detail">
                  <div
                    className="circle-dot"
                    style={{ backgroundColor: sel.color }}
                  />
                  <div className="circle-detail-main">
                    <span className="circle-detail-name">{sel.name}</span>
                    <p className="circle-detail-description">{sel.description}</p>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
