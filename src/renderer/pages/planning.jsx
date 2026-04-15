import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import QuickActions from "../components/QuickActions";
import NouvelSeanceModal from "../components/NouvelSeanceModal";
import gym from "../../images/gym.png";

const C = {
  bg: "#0e0f11", card: "#1a1d24", border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)", accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af", green: "#22c55e",
};

const HOURS = ["8:00","9:00","10:00","11:00","12:00","13:00","14:00"];
const DAY_NAMES = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const CELL_H = 80;

// ── Calcule lundi et dimanche de la semaine courante + offset ──
function getWeekBounds(offset = 0) {
  const now = new Date();
  const day = now.getDay(); // 0=Dim
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

function toYMD(date) {
  return date.toISOString().split('T')[0];
}

function hourToIndex(heureDebut) {
  const h = parseInt(heureDebut.split(':')[0]);
  return Math.max(0, h - 8); // 8h → index 0
}

function dayOfWeekIndex(dateStr) {
  const d = new Date(dateStr);
  const dow = d.getDay(); // 0=Dim … 6=Sam
  // On veut : Dim=0, Lun=1 … Sam=6 → index dans DAY_NAMES
  return dow; 
}

const SessionCard = ({ seance }) => {
  const color = seance.activiteCouleur || "#e53935";
  const pct = seance.participantsMax
    ? Math.round((seance.presents / seance.participantsMax) * 100)
    : 0;
  const isFull = seance.presents >= seance.participantsMax;

  return (
    <div style={{
      position: "absolute", top: 2, left: 2, right: 2, bottom: 2,
      background: `linear-gradient(135deg,${color}dd,${color}88)`,
      borderRadius: 8, padding: "8px 10px", cursor: "pointer",
      overflow: "hidden", border: `1px solid ${color}88`,
      boxShadow: `0 2px 12px ${color}44`, transition: "transform .15s",
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
      onMouseLeave={e => e.currentTarget.style.transform = ""}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {seance.activiteNom || "Séance"}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {seance.coachPrenom} {seance.coachNom}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
        <Users size={9} color="rgba(255,255,255,.8)" />
        <span style={{ fontSize: 9, color: "rgba(255,255,255,.8)", fontWeight: 600 }}>
          {seance.presents}/{seance.participantsMax}
        </span>
        {isFull && (
          <span style={{ fontSize: 9, background: "#ff444440", color: "#ff8888", padding: "1px 5px", borderRadius: 4, fontWeight: 700 }}>
            COMPLET
          </span>
        )}
      </div>
      {seance.participantsMax > 0 && (
        <div style={{ height: 3, background: "rgba(255,255,255,.2)", borderRadius: 10, marginTop: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: isFull ? "#ff4444" : "#fff", borderRadius: 10 }} />
        </div>
      )}
    </div>
  );
};

export default function Planning() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [seances, setSeances]       = useState([]);
  const [activites, setActivites]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [openModal, setOpenModal]   = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();

  const { monday, sunday } = getWeekBounds(weekOffset);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        window.api.getSeancesSemaine({ dateDebut: toYMD(monday), dateFin: toYMD(sunday) }),
        window.api.getActivites(),
      ]);
      setSeances(s);
      setActivites(a);
    } catch (err) {
      console.error('Planning load:', err);
    } finally {
      setLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openModal') === 'true') {
      setOpenModal(true);
      navigate('/planning', { replace: true });
    }
  }, [location.search]);

  // ── Construit la grille [dayOfWeek][hourIndex] ──
  const grid = {};
  for (let d = 0; d <= 6; d++) { grid[d] = {}; for (let h = 0; h < HOURS.length; h++) grid[d][h] = null; }
  seances.forEach(s => {
    const d = dayOfWeekIndex(s.date);
    const h = hourToIndex(s.heureDebut);
    if (h >= 0 && h < HOURS.length) grid[d][h] = s;
  });

  // ── Labels de la semaine ──
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + (i === 0 ? 6 : i - 1)); // Dim en dernier
    // Réordonner : Lun(1) Mar(2) … Sam(6) Dim(0)
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + i);
    return dayDate;
  });

  const formatWeekLabel = () => {
    const opts = { day: 'numeric', month: 'long', year: 'numeric' };
    return `Du ${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} au ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const totalSeances = seances.length;
  const totalPresents = seances.reduce((a, s) => a + (s.presents || 0), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>

      {/* Hero */}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${gym})`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(14,15,17,0.93) 0%,rgba(14,15,17,0.75) 60%,rgba(229,57,53,0.06) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent,${C.bg})` }} />
        <div style={{ position: "relative", padding: "32px 36px 36px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>Planning</span>
              <QuickActions navigate={navigate} />
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Planning des séances
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: totalSeances,  label: "séances cette semaine", color: C.muted },
                { count: totalPresents, label: "présences enregistrées", color: C.green },
              ].map(({ count, label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "0.82rem", color: C.muted }}>
                      <strong style={{ color }}>{loading ? "…" : count}</strong> {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <button onClick={() => setOpenModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontFamily: "'Barlow',sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,57,53,0.4)" }}>
            <Plus size={17} /> Ajouter une séance
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ width: 34, height: 34, borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <ChevronLeft size={15} />
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed',sans-serif" }}>{formatWeekLabel()}</div>
          </div>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ width: 34, height: 34, borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <ChevronRight size={15} />
          </button>
        </div>
        <button onClick={() => setWeekOffset(0)} style={{ padding: "6px 20px", borderRadius: 9999, border: "none", cursor: "pointer", fontFamily: "'Barlow',sans-serif", fontSize: "0.875rem", fontWeight: 700, background: C.accent, color: "#fff" }}>
          Aujourd'hui
        </button>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 36px 36px" }}>
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>

          {/* Headers */}
          <div style={{ display: "grid", gridTemplateColumns: `64px repeat(7,1fr)`, borderBottom: `1px solid ${C.border}`, background: "#14161c" }}>
            <div style={{ borderRight: `1px solid ${C.border}` }} />
            {weekDays.map((dayDate, i) => {
              const isToday = toYMD(dayDate) === toYMD(new Date());
              const dowName = DAY_NAMES[dayDate.getDay()];
              return (
                <div key={i} style={{ padding: "12px 8px", textAlign: "center", borderRight: i < 6 ? `1px solid ${C.border}` : "none", background: isToday ? "rgba(229,57,53,0.08)" : "transparent" }}>
                  <div style={{ fontSize: "0.65rem", color: isToday ? C.accent : C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>{dowName}</div>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: isToday ? C.accent : "transparent", color: isToday ? "#fff" : C.subtle, fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center", margin: "0 auto" }}>
                    {dayDate.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {HOURS.map((hour, hIdx) => (
            <div key={hour} style={{ display: "grid", gridTemplateColumns: `64px repeat(7,1fr)`, height: CELL_H, borderBottom: hIdx < HOURS.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ padding: "8px 10px 0", fontSize: 11, color: C.muted, fontWeight: 600, borderRight: `1px solid ${C.border}`, textAlign: "right", background: "#14161c" }}>{hour}</div>
              {weekDays.map((dayDate, i) => {
                const dow = dayDate.getDay();
                const seance = grid[dow]?.[hIdx];
                const isToday = toYMD(dayDate) === toYMD(new Date());
                return (
                  <div key={i} style={{ borderRight: i < 6 ? `1px solid ${C.border}` : "none", background: isToday ? "rgba(229,57,53,0.03)" : "transparent", position: "relative" }}>
                    {seance && <SessionCard seance={seance} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Légende activités */}
        {activites.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 22px" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: C.muted, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Légende des activités</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 24px" }}>
              {activites.map(a => (
                <div key={a.idActivite} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: a.couleur, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.78rem", color: C.subtle, fontWeight: 500 }}>{a.nom}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {openModal && (
        <NouvelSeanceModal
          activites={activites}
          onClose={() => setOpenModal(false)}
          onSave={async (data) => {
            await window.api.addSeance(data);
            setOpenModal(false);
            load();
          }}
        />
      )}
    </div>
  );
}