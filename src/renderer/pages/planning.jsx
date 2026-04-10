import React, { useState , useEffect} from "react";
import { ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";
import Button from "../components/AddButton";
import gym from "../../images/gym.png";
import NouvelSeanceModal from "../components/NouvelSeanceModal";
import { useLocation, useNavigate } from "react-router-dom"; 

const C = {
  bg: "#0e0f11", card: "#1a1d24", cardHover: "#1f2330",
  border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af",
  green: "#22c55e",
};

const days = ["Heure", "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const hours = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

const activityColors = {
  Yoga:     { bg: "#22c55e" },
  CrossFit: { bg: "#3a7bd5" },
  Pilates:  { bg: "#8b5cf6" },
  Boxing:   { bg: "#e63946" },
  Spinning: { bg: "#f59e0b" },
  Aqua:     { bg: "#06b6d4" },
};

const sessions = [
  { day: 2, hour: 0, title: "Yoga Flow",  coach: "Marie L.",   spots: 8,  max: 12, activity: "Yoga",     duration: 2 },
  { day: 2, hour: 2, title: "CrossFit",   coach: "Thomas B.",  spots: 5,  max: 10, activity: "CrossFit", duration: 1 },
  { day: 2, hour: 4, title: "Yoga Flow",  coach: "Marie L.",   spots: 10, max: 12, activity: "Yoga",     duration: 1 },
  { day: 3, hour: 1, title: "Pilates",    coach: "Sophie D.",  spots: 6,  max: 8,  activity: "Pilates",  duration: 2 },
  { day: 3, hour: 3, title: "Boxing",     coach: "Lucas M.",   spots: 4,  max: 8,  activity: "Boxing",   duration: 1 },
  { day: 4, hour: 0, title: "Yoga Flow",  coach: "Marie L.",   spots: 7,  max: 12, activity: "Yoga",     duration: 1 },
  { day: 4, hour: 2, title: "Spinning",   coach: "Julie P.",   spots: 9,  max: 15, activity: "Spinning", duration: 2 },
  { day: 5, hour: 1, title: "CrossFit",   coach: "Thomas B.",  spots: 3,  max: 10, activity: "CrossFit", duration: 2 },
  { day: 5, hour: 4, title: "Spinning",   coach: "Julie P.",   spots: 11, max: 15, activity: "Spinning", duration: 1 },
  { day: 6, hour: 0, title: "Pilates",    coach: "Sophie D.",  spots: 5,  max: 8,  activity: "Pilates",  duration: 1 },
  { day: 6, hour: 2, title: "Yoga Flow",  coach: "Marie L.",   spots: 8,  max: 12, activity: "Yoga",     duration: 2 },
  { day: 7, hour: 1, title: "CrossFit",   coach: "Thomas B.",  spots: 6,  max: 10, activity: "CrossFit", duration: 2 },
  { day: 7, hour: 4, title: "Yoga Relax", coach: "Marie L.",   spots: 10, max: 12, activity: "Yoga",     duration: 1 },
  { day: 1, hour: 3, title: "Aqua Gym",   coach: "Camille R.", spots: 7,  max: 10, activity: "Aqua",     duration: 2 },
];

const CELL_HEIGHT = 80;

const SessionCard = ({ session }) => {
  const col = activityColors[session.activity] || activityColors.Yoga;
  const isFull = session.spots >= session.max;
  const pct = Math.round((session.spots / session.max) * 100);
  return (
    <div style={{ position: "absolute", top: 2, left: 2, right: 2, height: session.duration * CELL_HEIGHT - 4, background: `linear-gradient(135deg,${col.bg}dd,${col.bg}99)`, borderRadius: 8, padding: "8px 10px", cursor: "pointer", overflow: "hidden", boxShadow: `0 2px 12px ${col.bg}44`, border: `1px solid ${col.bg}88`, transition: "transform .15s, box-shadow .15s", zIndex: 2 }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = `0 6px 20px ${col.bg}66`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 2px 12px ${col.bg}44`; }}>
      <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 2, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.title}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)", marginBottom: session.duration > 1 ? 6 : 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.coach}</div>
      {session.duration > 1 && (
        <>
          <div style={{ height: 3, background: "rgba(255,255,255,.2)", borderRadius: 10, marginBottom: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: isFull ? "#ff4444" : "#fff", borderRadius: 10 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Users size={9} color="rgba(255,255,255,.8)" />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,.8)", fontWeight: 600 }}>{session.spots}/{session.max}</span>
            {isFull && <span style={{ fontSize: 9, background: "#ff444440", color: "#ff8888", padding: "1px 5px", borderRadius: 4, fontWeight: 700, marginLeft: 2 }}>COMPLET</span>}
          </div>
        </>
      )}
      {session.duration === 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Users size={9} color="rgba(255,255,255,.7)" />
          <span style={{ fontSize: 9, color: "rgba(255,255,255,.7)" }}>{session.spots}/{session.max}</span>
        </div>
      )}
    </div>
  );
};

const Planning = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const location = useLocation();   // ✅ AJOUT
  const navigate = useNavigate();
  
  const grid = {};
  for (let d = 1; d <= 7; d++) { grid[d] = {}; for (let h = 0; h < hours.length; h++) grid[d][h] = null; }
  const occupied = {};
  sessions.forEach(s => {
    grid[s.day][s.hour] = s;
    for (let span = 1; span < s.duration; span++) occupied[`${s.day}-${s.hour + span}`] = true;
  });

  const totalSessions = sessions.length;
  const totalSpots = sessions.reduce((acc, s) => acc + s.spots, 0);
   useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('openModal') === 'true') {
      setOpenModal(true);
      navigate('/planning', { replace: true });
    }
  }, [location.search]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>

      {/* ── Hero Header ── */}
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${gym})`, backgroundSize: "cover", backgroundPosition: "center 35%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(14,15,17,0.93) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.06) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 40, background: `linear-gradient(transparent, ${C.bg})` }} />

        <div style={{ position: "relative", padding: "32px 36px 36px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>FitManager</span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, fontFamily: "'Barlow', sans-serif" }}>Planning</span>
            </div>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Planning des séances
            </h1>
            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12 }}>
              {[
                { count: totalSessions, label: "séances cette semaine", color: C.muted  },
                { count: totalSpots,    label: "places réservées",      color: C.green  },
              ].map(({ count, label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "0.82rem", color: C.muted, fontFamily: "'Barlow', sans-serif" }}><strong style={{ color }}>{count}</strong> {label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <button onClick={() => setOpenModal(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontFamily: "'Barlow', sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,57,53,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(229,57,53,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(229,57,53,0.4)"; }}>
            <Plus size={17} /> Ajouter une séance
          </button>
        </div>
      </div>

      {/* ── Toolbar / Week nav ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ width: 34, height: 34, borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "grid", placeItems: "center", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
            <ChevronLeft size={15} />
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "0.875rem", fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>Semaine du 24 Février 2026</div>
            <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 1 }}>Du 24 Fév au 02 Mars 2026</div>
          </div>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ width: 34, height: 34, borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "grid", placeItems: "center", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = C.borderHover; e.currentTarget.style.color = C.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
            <ChevronRight size={15} />
          </button>
        </div>
        <div style={{ background: C.card, borderRadius: 9999, padding: 4, display: "inline-flex", border: `1px solid ${C.border}` }}>
          <button style={{ padding: "6px 20px", borderRadius: 9999, border: "none", cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontSize: "0.875rem", fontWeight: 700, background: C.accent, color: "#fff" }}>
            Semaine
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 36px 36px" }}>

        {/* Calendar grid */}
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "64px repeat(7, 1fr)", borderBottom: `1px solid ${C.border}`, background: "#14161c" }}>
            {days.map((d, i) => (
              <div key={d} style={{ padding: "12px 8px", textAlign: "center", borderRight: i < days.length - 1 ? `1px solid ${C.border}` : "none", background: i === 2 ? "rgba(229,57,53,0.08)" : "transparent" }}>
                {i === 0 ? (
                  <span style={{ fontSize: 10, color: C.muted, fontFamily: "'Barlow', sans-serif" }}> </span>
                ) : i === 2 ? (
                  <div>
                    <div style={{ fontSize: "0.65rem", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, fontFamily: "'Barlow', sans-serif", fontWeight: 700 }}>{d}</div>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.accent, color: "#fff", fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center", margin: "0 auto", fontFamily: "'Barlow Condensed', sans-serif" }}>24</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: "0.65rem", color: C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>{d}</div>
                    <div style={{ fontSize: "0.75rem", color: C.subtle, fontWeight: 600, fontFamily: "'Barlow Condensed', sans-serif" }}>{20 + i}</div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {hours.map((hour, hIdx) => (
            <div key={hour} style={{ display: "grid", gridTemplateColumns: "64px repeat(7, 1fr)", height: CELL_HEIGHT, borderBottom: hIdx < hours.length - 1 ? `1px solid ${C.border}` : "none" }}>
              <div style={{ padding: "8px 10px 0", fontSize: 11, color: C.muted, fontWeight: 600, borderRight: `1px solid ${C.border}`, textAlign: "right", background: "#14161c", fontFamily: "'Barlow', sans-serif" }}>{hour}</div>
              {[1, 2, 3, 4, 5, 6, 7].map(dayIdx => {
                const key = `${dayIdx}-${hIdx}`;
                if (occupied[key]) return <div key={dayIdx} style={{ borderRight: dayIdx < 7 ? `1px solid ${C.border}` : "none", background: dayIdx === 2 ? "rgba(229,57,53,0.03)" : "transparent", position: "relative" }} />;
                const session = grid[dayIdx][hIdx];
                return (
                  <div key={dayIdx} style={{ borderRight: dayIdx < 7 ? `1px solid ${C.border}` : "none", background: dayIdx === 2 ? "rgba(229,57,53,0.03)" : "transparent", position: "relative", transition: "background .1s" }}
                    onMouseEnter={e => { if (!session) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = dayIdx === 2 ? "rgba(229,57,53,0.03)" : "transparent"; }}>
                    {session && <SessionCard session={session} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 22px" }}>
          <div style={{ fontSize: "0.65rem", fontFamily: "'Barlow', sans-serif", fontWeight: 700, color: C.muted, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Légende des activités</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "10px 16px" }}>
            {Object.entries(activityColors).map(([name, col]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: col.bg, flexShrink: 0 }} />
                <span style={{ fontSize: "0.78rem", color: C.subtle, fontWeight: 500, fontFamily: "'Barlow', sans-serif" }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {openModal && (
        <NouvelSeanceModal
          onClose={() => setOpenModal(false)}
          onSave={(data) => { console.log("Nouvelle séance :", data); setOpenModal(false); }}
        />
      )}
    </div>
  );
};

export default Planning;