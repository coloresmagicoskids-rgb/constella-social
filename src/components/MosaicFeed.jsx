// src/components/MosaicFeed.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "../auth/AuthContext.jsx";

export default function MosaicFeed({ circles, selectedCircle }) {
  const { user } = useAuth();

  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  // Mapa rápido: circle_id -> círculo
  const circleMap = new Map((circles || []).map((c) => [c.id, c]));

  useEffect(() => {
    const fetchFeed = async () => {
      // Si no hay usuario, no hay feed
      if (!user) {
        setMoments([]);
        setStatus("Inicia sesión para ver tu feed.");
        return;
      }

      setLoading(true);
      setStatus("");

      // 1. Conseguir lista de conexiones aceptadas
      const { data: conns, error: connsError } = await supabase
        .from("constella_connections")
        .select("*")
        .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`)
        .eq("status", "accepted");

      if (connsError) {
        console.error("Error cargando conexiones:", connsError);
      }

      const connectedIds = new Set();
      (conns || []).forEach((c) => {
        if (c.user_id === user.id) connectedIds.add(c.target_user_id);
        else connectedIds.add(c.user_id);
      });

      // 2. Traer momentos (los propios + públicos + para conexiones)
      let query = supabase
        .from("constella_moments")
        .select("*")
        .or(
          `visibility.eq.public,visibility.eq.connections,user_id.eq.${user.id}`
        )
        .order("created_at", { ascending: false })
        .limit(80);

      if (selectedCircle) {
        query = query.eq("circle_id", selectedCircle.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error cargando momentos:", error);
        setStatus("No se pudo cargar el feed.");
        setLoading(false);
        return;
      }

      if (data) {
        // 3. Filtrar visibilidad "connections":
        // solo se ven si son míos o de alguien conectado conmigo.
        const filtered = data.filter((m) => {
          if (m.visibility !== "connections") return true;
          if (m.user_id === user.id) return true;
          return connectedIds.has(m.user_id);
        });

        setMoments(filtered);
        if (filtered.length === 0) {
          setStatus(
            "Aún no hay momentos visibles. Crea uno o conéctate con otras personas."
          );
        }
      }

      setLoading(false);
    };

    fetchFeed();
    // Reactiva cuando cambie el usuario o el círculo seleccionado
  }, [user?.id, selectedCircle?.id]);

  return (
    <div className="panel panel-scroll">
      <div className="panel-header">
        <div>
          <h2>Feed</h2>
          <p className="panel-subtitle">
            Momentos tuyos, públicos y de tus conexiones.
          </p>
        </div>
      </div>

      {selectedCircle && (
        <p className="filter-text">
          Filtrado por: <strong>{selectedCircle.name}</strong>
        </p>
      )}

      {loading && <p className="helper-text">Cargando momentos...</p>}
      {!loading && status && (
        <p className="helper-text">{status}</p>
      )}

      <div className="mosaic-grid">
        {moments.map((m) => {
          const c = circleMap.get(m.circle_id);
          return (
            <article key={m.id} className="mosaic-card glow-card">
              <header className="mosaic-card-header">
                <div
                  className="circle-dot small"
                  style={{ backgroundColor: c?.color || "#6366f1" }}
                />
                <span className="mosaic-circle-name">
                  {c ? c.name : "Círculo"}
                </span>
                <span className="mood-pill">{m.mood || "momento"}</span>
              </header>

              <h3 className="mosaic-title">{m.title}</h3>

              {m.content && (
                <p className="mosaic-snippet">{m.content}</p>
              )}

              <footer className="mosaic-footer">
                <span className="helper-text">
                  {new Date(m.created_at).toLocaleString()}
                </span>
              </footer>
            </article>
          );
        })}
      </div>

      {!loading && moments.length === 0 && !status && (
        <p className="empty-text">
          Aún no hay momentos visibles. Crea uno desde la pestaña{" "}
          <strong>Crear</strong> o conéctate con otras personas.
        </p>
      )}
    </div>
  );
}