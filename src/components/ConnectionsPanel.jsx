// src/components/ConnectionsPanel.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function groupConnections(rawConnections, currentUserId, profilesById) {
  const incoming = [];
  const outgoing = [];
  const accepted = [];

  for (const c of rawConnections) {
    const isMeSource = c.user_id === currentUserId;
    const otherId = isMeSource ? c.target_user_id : c.user_id;
    const profile = profilesById.get(otherId) || null;

    const base = {
      id: c.id,
      status: c.status,
      created_at: c.created_at,
      otherId,
      profile,
      direction: isMeSource ? "outgoing" : "incoming",
    };

    if (c.status === "accepted") {
      accepted.push(base);
    } else if (c.status === "pending") {
      if (isMeSource) outgoing.push(base);
      else incoming.push(base);
    }
  }

  return { incoming, outgoing, accepted };
}

export default function ConnectionsPanel() {
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState({
    incoming: [],
    outgoing: [],
    accepted: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadConnections = async () => {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      setLoading(false);
      setMessage("No se pudo obtener el usuario actual.");
      return;
    }

    // 1. Traer todas las conexiones donde yo estoy involucrado
    const { data: rawConns, error: conErr } = await supabase
      .from("constella_connections")
      .select("*")
      .or(`user_id.eq.${user.id},target_user_id.eq.${user.id}`);

    if (conErr) {
      setMessage(conErr.message);
      setLoading(false);
      return;
    }

    if (!rawConns || rawConns.length === 0) {
      setConnections({ incoming: [], outgoing: [], accepted: [] });
      setLoading(false);
      return;
    }

    // 2. Conseguir perfiles de las otras personas
    const otherIds = Array.from(
      new Set(
        rawConns.map((c) =>
          c.user_id === user.id ? c.target_user_id : c.user_id
        )
      )
    );

    const { data: profiles, error: profErr } = await supabase
      .from("constella_profiles")
      .select("id, username, display_name, avatar_url, email")
      .in("id", otherIds);

    if (profErr) {
      setMessage(profErr.message);
      setLoading(false);
      return;
    }

    const map = new Map();
    (profiles || []).forEach((p) => map.set(p.id, p));

    const grouped = groupConnections(rawConns, user.id, map);
    setConnections(grouped);
    setLoading(false);
  };

  useEffect(() => {
    loadConnections();
  }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;

    setSearchLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Sesión no válida.");
      setSearchLoading(false);
      return;
    }

    // 🔎 BÚSQUEDA POR USERNAME, NOMBRE PARA MOSTRAR Y CORREO
    const { data, error } = await supabase
      .from("constella_profiles")
      .select("id, username, display_name, avatar_url, email")
      .or(
        `username.ilike.%${term}%,display_name.ilike.%${term}%,email.ilike.%${term}%`
      )
      .neq("id", user.id)
      .limit(10);

    if (error) {
      setMessage(error.message);
      setSearchLoading(false);
      return;
    }

    setSearchResults(data || []);
    setSearchLoading(false);
  };

  const sendRequest = async (targetId) => {
    setMessage("");
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Sesión no válida.");
      return;
    }

    const { error } = await supabase.from("constella_connections").insert({
      user_id: user.id,
      target_user_id: targetId,
      status: "pending",
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Solicitud enviada.");
      await loadConnections();
    }
  };

  const acceptRequest = async (connId) => {
    setMessage("");
    const { error } = await supabase
      .from("constella_connections")
      .update({ status: "accepted" })
      .eq("id", connId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Conexión aceptada.");
      await loadConnections();
    }
  };

  const rejectRequest = async (connId) => {
    setMessage("");
    const { error } = await supabase
      .from("constella_connections")
      .delete()
      .eq("id", connId);

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Solicitud rechazada.");
      await loadConnections();
    }
  };

  return (
    <div className="panel panel-scroll">
      <div className="panel-header">
        <div>
          <h2>Conexiones</h2>
          <p className="panel-subtitle">
            Solicitudes, amistades aceptadas y búsqueda de nuevas constelaciones.
          </p>
        </div>
      </div>

      {/* Buscar personas */}
      <section className="circles-section">
        <h3 className="section-title">Buscar personas</h3>
        <form className="form" onSubmit={handleSearch}>
          <label className="field">
            <span>Nombre de usuario, nombre o correo</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej.: carlos, luna_creativa, alguien@correo.com..."
            />
          </label>
          <button type="submit" className="primary-btn" disabled={searchLoading}>
            {searchLoading ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {searchResults.length > 0 && (
          <ul className="notes-list" style={{ marginTop: 10 }}>
            {searchResults.map((p) => (
              <li key={p.id} className="note-item">
                <div className="note-bullet" />
                <div>
                  <p className="note-text">
                    <strong>{p.display_name || p.username}</strong>{" "}
                    <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>
                      @{p.username}
                    </span>
                    {p.email && (
                      <span
                        style={{
                          color: "#9ca3af",
                          fontSize: "0.72rem",
                          marginLeft: 6,
                        }}
                      >
                        · {p.email}
                      </span>
                    )}
                  </p>
                  <button
                    type="button"
                    className="chip chip-primary"
                    onClick={() => sendRequest(p.id)}
                  >
                    Conectar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Solicitudes entrantes */}
      <section className="circles-section">
        <h3 className="section-title">Solicitudes recibidas</h3>
        {connections.incoming.length === 0 ? (
          <p className="empty-text">No tienes solicitudes nuevas.</p>
        ) : (
          <ul className="notes-list">
            {connections.incoming.map((c) => (
              <li key={c.id} className="note-item">
                <div className="note-bullet" />
                <div>
                  <p className="note-text">
                    <strong>
                      {c.profile?.display_name || c.profile?.username || "Usuario"}
                    </strong>{" "}
                    quiere conectar contigo.
                  </p>
                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      type="button"
                      className="chip chip-primary"
                      onClick={() => acceptRequest(c.id)}
                    >
                      Aceptar
                    </button>
                    <button
                      type="button"
                      className="chip"
                      onClick={() => rejectRequest(c.id)}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Solicitudes enviadas */}
      <section className="circles-section">
        <h3 className="section-title">Solicitudes enviadas</h3>
        {connections.outgoing.length === 0 ? (
          <p className="empty-text">No tienes solicitudes pendientes enviadas.</p>
        ) : (
          <ul className="notes-list">
            {connections.outgoing.map((c) => (
              <li key={c.id} className="note-item">
                <div className="note-bullet" />
                <p className="note-text">
                  Solicitud enviada a{" "}
                  <strong>
                    {c.profile?.display_name || c.profile?.username || "Usuario"}
                  </strong>{" "}
                  (pendiente).
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Conexiones aceptadas */}
      <section className="circles-section">
        <h3 className="section-title">Conexiones activas</h3>
        {connections.accepted.length === 0 ? (
          <p className="empty-text">
            Aún no tienes conexiones aceptadas. Empieza buscando personas arriba.
          </p>
        ) : (
          <ul className="notes-list">
            {connections.accepted.map((c) => (
              <li key={c.id} className="note-item">
                <div className="note-bullet" />
                <p className="note-text">
                  Conectado con{" "}
                  <strong>
                    {c.profile?.display_name || c.profile?.username || "Usuario"}
                  </strong>
                  .
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {loading && <p className="helper-text">Actualizando conexiones...</p>}
      {message && <p className="helper-text">{message}</p>}
    </div>
  );
}