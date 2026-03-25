import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Button from "../components/Button";

/* ─── DATA ── */
const days = ["Heure", "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const hours = ["8:00", "9:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

const activityColors = {
  Yoga:      { bg: "#22c55e",  light: "#22c55e22", border: "#22c55e55" },
  CrossFit:  { bg: "#3a7bd5",  light: "#3a7bd522", border: "#3a7bd555" },
  Pilates:   { bg: "#8b5cf6",  light: "#8b5cf622", border: "#8b5cf655" },
  Boxing:    { bg: "#e63946",  light: "#e6394622", border: "#e6394655" },
  Spinning:  { bg: "#f59e0b",  light: "#f59e0b22", border: "#f59e0b55" },
  Aqua:      { bg: "#06b6d4",  light: "#06b6d422", border: "#06b6d455" },
};

const sessions = [
  // Lundi (col 2)
  { day: 2, hour: 0, title: "Yoga Flow",   coach: "Marie L.",    spots: 8,  max: 12, activity: "Yoga",     duration: 2 },
  { day: 2, hour: 2, title: "CrossFit",    coach: "Thomas B.",   spots: 5,  max: 10, activity: "CrossFit", duration: 1 },
  { day: 2, hour: 4, title: "Yoga Flow",   coach: "Marie L.",    spots: 10, max: 12, activity: "Yoga",     duration: 1 },
  // Mardi (col 3)
  { day: 3, hour: 1, title: "Pilates",     coach: "Sophie D.",   spots: 6,  max: 8,  activity: "Pilates",  duration: 2 },
  { day: 3, hour: 3, title: "Boxing",      coach: "Lucas M.",    spots: 4,  max: 8,  activity: "Boxing",   duration: 1 },
  // Mercredi (col 4)
  { day: 4, hour: 0, title: "Yoga Flow",   coach: "Marie L.",    spots: 7,  max: 12, activity: "Yoga",     duration: 1 },
  { day: 4, hour: 2, title: "Spinning",    coach: "Julie P.",    spots: 9,  max: 15, activity: "Spinning", duration: 2 },
  // Jeudi (col 5)
  { day: 5, hour: 1, title: "CrossFit",    coach: "Thomas B.",   spots: 3,  max: 10, activity: "CrossFit", duration: 2 },
  { day: 5, hour: 4, title: "Spinning",    coach: "Julie P.",    spots: 11, max: 15, activity: "Spinning", duration: 1 },
  // Vendredi (col 6)
  { day: 6, hour: 0, title: "Pilates",     coach: "Sophie D.",   spots: 5,  max: 8,  activity: "Pilates",  duration: 1 },
  { day: 6, hour: 2, title: "Yoga Flow",   coach: "Marie L.",    spots: 8,  max: 12, activity: "Yoga",     duration: 2 },
  // Samedi (col 7)
  { day: 7, hour: 1, title: "CrossFit",    coach: "Thomas B.",   spots: 6,  max: 10, activity: "CrossFit", duration: 2 },
  { day: 7, hour: 4, title: "Yoga Relax",  coach: "Marie L.",    spots: 10, max: 12, activity: "Yoga",     duration: 1 },
  // Dimanche (col 1)
  { day: 1, hour: 3, title: "Aqua Gym",    coach: "Camille R.",  spots: 7,  max: 10, activity: "Aqua",     duration: 2 },
];

const CELL_HEIGHT = 80; // px per hour slot

const SessionCard = ({ session }) => {
  const col = activityColors[session.activity] || activityColors.Yoga;
  const isFull = session.spots >= session.max;
  const pct = Math.round((session.spots / session.max) * 100);

  return (
    <div style={{
      position: "absolute",
      top: 2, left: 2, right: 2,
      height: session.duration * CELL_HEIGHT - 4,
      background: `linear-gradient(135deg, ${col.bg}dd, ${col.bg}99)`,
      borderRadius: 8,
      padding: "8px 10px",
      cursor: "pointer",
      overflow: "hidden",
      boxShadow: `0 2px 12px ${col.bg}44`,
      border: `1px solid ${col.bg}88`,
      transition: "transform .15s, box-shadow .15s",
      zIndex: 2,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = `0 6px 20px ${col.bg}66`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 2px 12px ${col.bg}44`; }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: "#fff", marginBottom: 2, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.title}</div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)", marginBottom: session.duration > 1 ? 6 : 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{session.coach}</div>
      {session.duration > 1 && (
        <>
          {/* progress bar */}
          <div style={{ height: 3, background: "rgba(255,255,255,.2)", borderRadius: 10, marginBottom: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: isFull ? "#ff4444" : "#fff", borderRadius: 10, transition: "width .3s" }} />
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

/* ─── MAIN ── */
const Planning = () => {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = "24 Fév";
  const weekEnd   = "02 Mars 2026";

  // Build a grid map: grid[day][hour] = session | null
  const grid = {};
  for (let d = 1; d <= 7; d++) {
    grid[d] = {};
    for (let h = 0; h < hours.length; h++) grid[d][h] = null;
  }
  // Track occupied cells for multi-hour spans
  const occupied = {}; // "d-h" -> true
  sessions.forEach(s => {
    grid[s.day][s.hour] = s;
    for (let span = 1; span < s.duration; span++) {
      occupied[`${s.day}-${s.hour + span}`] = true;
    }
  });

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "#0b0b12",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#f1f1f1",
    }}>

      {/* Sidebar */}
      <div style={{ flexShrink: 0, height: "100vh", position: "sticky", top: 0, overflowY: "auto" }}>
        <Sidebar />
      </div>

      {/* Main */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
              <div style={{ width: 4, height: 26, borderRadius: 4, background: "linear-gradient(180deg,#e63946,#c1121f)" }} />
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.4px" }}>Planning des séances</h1>
            </div>
            <p style={{ margin: "0 0 0 14px", color: "#444", fontSize: 13 }}>
              Gérez et organisez les séances de la semaine
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button style={{
              background: "#1a1a26", border: "1px solid #ffffff0f", color: "#888",
              borderRadius: 10, padding: "9px 16px", fontSize: 13, cursor: "pointer", fontWeight: 500,
              transition: "all .15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "#22222f"; e.currentTarget.style.color = "#ddd"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1a1a26"; e.currentTarget.style.color = "#888"; }}
            >
              Aujourd'hui
            </button>
            <Button variant="primary" icon={Plus}>Ajouter une séance</Button>
          </div>
        </div>

        {/* Week navigator */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#1a1a26", border: "1px solid #ffffff08",
          borderRadius: 14, padding: "14px 20px", marginBottom: 20,
        }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{
            width: 32, height: 32, borderRadius: 8, background: "#ffffff08", border: "1px solid #ffffff10",
            color: "#777", cursor: "pointer", display: "grid", placeItems: "center", transition: "all .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#ffffff15"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ffffff08"; e.currentTarget.style.color = "#777"; }}
          ><ChevronLeft size={15} /></button>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e8e8e8" }}>Semaine du 24 Février 2026</div>
            <div style={{ fontSize: 11, color: "#444", marginTop: 2 }}>Du {weekStart} au {weekEnd}</div>
          </div>

          <button onClick={() => setWeekOffset(w => w + 1)} style={{
            width: 32, height: 32, borderRadius: 8, background: "#ffffff08", border: "1px solid #ffffff10",
            color: "#777", cursor: "pointer", display: "grid", placeItems: "center", transition: "all .15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "#ffffff15"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#ffffff08"; e.currentTarget.style.color = "#777"; }}
          ><ChevronRight size={15} /></button>
        </div>

        {/* Calendar grid */}
        <div style={{ background: "#1a1a26", borderRadius: 16, border: "1px solid #ffffff08", overflow: "hidden", marginBottom: 24 }}>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "64px repeat(7, 1fr)", borderBottom: "1px solid #ffffff08" }}>
            {days.map((d, i) => (
              <div key={d} style={{
                padding: "12px 8px", textAlign: "center",
                fontSize: i === 0 ? 10 : 12,
                color: i === 2 ? "#e63946" : "#555", /* highlight Lun as "today" */
                fontWeight: i === 0 ? 500 : 700,
                background: i === 2 ? "#e6394608" : "transparent",
                borderRight: i < days.length - 1 ? "1px solid #ffffff05" : "none",
                letterSpacing: ".3px",
              }}>
                {i === 2 ? (
                  <div>
                    <div style={{ fontSize: 10, color: "#e63946", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 2 }}>{d}</div>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#e63946", color: "#fff", fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center", margin: "0 auto" }}>24</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ textTransform: "uppercase", fontSize: 10, letterSpacing: ".5px", marginBottom: 2 }}>{d}</div>
                    {i > 0 && <div style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>{20 + i}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {hours.map((hour, hIdx) => (
            <div key={hour} style={{
              display: "grid",
              gridTemplateColumns: "64px repeat(7, 1fr)",
              height: CELL_HEIGHT,
              borderBottom: hIdx < hours.length - 1 ? "1px solid #ffffff05" : "none",
            }}>
              {/* Hour label */}
              <div style={{
                padding: "8px 10px 0", fontSize: 11, color: "#444", fontWeight: 600,
                borderRight: "1px solid #ffffff05", textAlign: "right",
              }}>{hour}</div>

              {/* Day cells */}
              {[1,2,3,4,5,6,7].map(dayIdx => {
                const key = `${dayIdx}-${hIdx}`;
                if (occupied[key]) {
                  return (
                    <div key={dayIdx} style={{
                      borderRight: dayIdx < 7 ? "1px solid #ffffff05" : "none",
                      background: dayIdx === 2 ? "#e6394604" : "transparent",
                      position: "relative",
                    }} />
                  );
                }
                const session = grid[dayIdx][hIdx];
                return (
                  <div key={dayIdx} style={{
                    borderRight: dayIdx < 7 ? "1px solid #ffffff05" : "none",
                    background: dayIdx === 2 ? "#e6394604" : "transparent",
                    position: "relative",
                    transition: "background .1s",
                  }}
                    onMouseEnter={e => { if (!session) e.currentTarget.style.background = "#ffffff03"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = dayIdx === 2 ? "#e6394604" : "transparent"; }}
                  >
                    {session && <SessionCard session={session} />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{
          background: "#1a1a26", border: "1px solid #ffffff08",
          borderRadius: 14, padding: "16px 22px",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#888", marginBottom: 12, letterSpacing: ".3px", textTransform: "uppercase" }}>
            Légende des activités
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
            {Object.entries(activityColors).map(([name, col]) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: col.bg }} />
                <span style={{ fontSize: 12, color: "#888", fontWeight: 500 }}>{name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Planning;