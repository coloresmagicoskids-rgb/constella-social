// src/App.jsx
import React, { useEffect, useState } from "react";
import MyConstellation from "./components/MyConstellation.jsx";
import MosaicFeed from "./components/MosaicFeed.jsx";
import CirclesManager from "./components/CirclesManager.jsx";
import QuickNotes from "./components/QuickNotes.jsx";
import CreateMoment from "./components/CreateMoment.jsx";
import ConnectionsPanel from "./components/ConnectionsPanel.jsx";
import { AuthProvider, useAuth } from "./auth/AuthContext.jsx";
import AuthPanel from "./auth/AuthPanel.jsx";
import { supabase } from "./supabaseClient";

// 👇 Si ya tienes el logo en assets, descomenta esta línea
// y asegúrate de que el archivo exista en src/assets/constella-logo.png
// import logoConstella from "./assets/constella-logo.png";

const SECTIONS = {
  CONSTELLATION: "constellation",
  FEED: "feed",
  CREATE: "create",
  CIRCLES: "circles",
  NOTES: "notes",
  CONNECTIONS: "connections",
};

function AppInner() {
  const { user, authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState(SECTIONS.CONSTELLATION);
  const [circles, setCircles] = useState([]);
  const [selectedCircleId, setSelectedCircleId] = useState(null);
  const [loadingCircles, setLoadingCircles] = useState(false);

  // Asegurar que el perfil exista (versión simple)
  useEffect(() => {
    const ensureProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("constella_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (!data && !error) {
        const username =
          user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`;

        await supabase.from("constella_profiles").insert({
          id: user.id,
          username,
          display_name: username,
          email: user.email ?? null,
        });
      }
    };

    ensureProfile();
  }, [user]);

  // Cargar círculos del usuario
  useEffect(() => {
    const fetchCircles = async () => {
      if (!user) return;
      setLoadingCircles(true);

      const { data, error } = await supabase
        .from("constella_circles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setCircles(data);
        if (!selectedCircleId && data.length > 0) {
          setSelectedCircleId(data[0].id);
        }
      }

      setLoadingCircles(false);
    };

    fetchCircles();
  }, [user, selectedCircleId]);

  const handleAddCircleLocal = (circle) => {
    setCircles((prev) => [...prev, circle]);
    if (!selectedCircleId) setSelectedCircleId(circle.id);
  };

  if (authLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-orbit">
          <div className="loading-core" />
        </div>
        <p>Cargando Constella...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPanel />;
  }

  const selectedCircle =
    circles.find((c) => c.id === selectedCircleId) || circles[0] || null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 🔹 Aquí centralizamos qué sección se muestra
  const renderSection = () => {
    switch (activeSection) {
      case SECTIONS.CONSTELLATION:
        return (
          <MyConstellation
            circles={circles}
            selectedCircleId={selectedCircleId}
            onSelectCircle={setSelectedCircleId}
            loading={loadingCircles}
          />
        );

      case SECTIONS.FEED:
        return (
          <MosaicFeed circles={circles} selectedCircle={selectedCircle} />
        );

      case SECTIONS.CIRCLES:
        return (
          <CirclesManager
            circles={circles}
            onAddCircle={handleAddCircleLocal}
          />
        );

      case SECTIONS.NOTES:
        return <QuickNotes />;

      case SECTIONS.CREATE:
        return (
          <CreateMoment circles={circles} selectedCircle={selectedCircle} />
        );

      case SECTIONS.CONNECTIONS:
        return <ConnectionsPanel />;

      default:
        return null;
    }
  };

  return (
    <div className="app-root">
      {/* HEADER */}
      <header className="app-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Si tienes logo, usa esto */}
            {/* <img
              src={logoConstella}
              alt="Constella"
              style={{ height: 32, borderRadius: 999 }}
            /> */}
            <div>
              <h1 className="app-title">Constella</h1>
              <p className="app-subtitle">
                Una red de constelaciones personales · V2
              </p>
            </div>
          </div>

          <button className="chip logout-chip" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="app-main">
        {/* Contenedor con pequeña animación al cambiar de sección */}
        <div key={activeSection} className="section-transition">
          {renderSection()}
        </div>
      </main>

      {/* FOOTER / NAVEGACIÓN */}
      <footer className="app-footer">
        <button
          className={`footer-btn ${
            activeSection === SECTIONS.CONSTELLATION ? "active" : ""
          }`}
          onClick={() => setActiveSection(SECTIONS.CONSTELLATION)}
        >
          Constelación
        </button>

        <button
          className={`footer-btn ${
            activeSection === SECTIONS.FEED ? "active" : ""
          }`}
          onClick={() => setActiveSection(SECTIONS.FEED)}
        >
          Feed
        </button>

        <button
          className={`footer-btn ${
            activeSection === SECTIONS.CREATE ? "active" : ""
          }`}
          onClick={() => setActiveSection(SECTIONS.CREATE)}
        >
          Crear
        </button>

        <button
          className={`footer-btn ${
            activeSection === SECTIONS.CIRCLES ? "active" : ""
          }`}
          onClick={() => setActiveSection(SECTIONS.CIRCLES)}
        >
          Círculos
        </button>

        <button
          className={`footer-btn ${
            activeSection === SECTIONS.CONNECTIONS ? "active" : ""
          }`}
          onClick={() => setActiveSection(SECTIONS.CONNECTIONS)}
        >
          Conexiones
        </button>

        <button
          className={`footer-btn ${
            activeSection === SECTIONS.NOTES ? "active" : ""
          }`}
          onClick={() => setActiveSection(SECTIONS.NOTES)}
        >
          Notas
        </button>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}