import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Users, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import QuickActions from "../components/QuickActions";
import NouvelSeanceModal from "../components/NouvelSeanceModal";
import gym from "../../images/gym.png";

// ══════════════════════════════════════════════
//  CONSTANTES
// ══════════════════════════════════════════════
const C = {
  bg: "#0e0f11", card: "#1a1d24", border: "#252833", borderHover: "#e53935",
  accent: "#e53935", accentDim: "rgba(229,57,53,0.12)", accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0", muted: "#6b7280", subtle: "#9ca3af", green: "#22c55e",
};

const HOURS = [
  "8:00","9:00","10:00","11:00","12:00","13:00",
  "14:00","15:00","16:00","17:00","18:00","19:00","20:00","21:00","22:00",
];
const DAY_NAMES = ["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"];
const CELL_H = 80;

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function getWeekBounds(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

function toYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayOfWeekIndex(dateStr) {
  return new Date(dateStr).getDay();
}

function sessionHeightAndTop(heureDebut, heureFin) {
  const [hS, mS] = String(heureDebut).split(":").map(Number);
  const [hE, mE] = String(heureFin).split(":").map(Number);
  const startMins    = (hS - 8) * 60 + mS;
  const durationMins = (hE * 60 + mE) - (hS * 60 + mS);
  return {
    top:    (startMins / 60) * CELL_H,
    height: Math.max((durationMins / 60) * CELL_H, CELL_H * 0.5),
  };
}

/**
 * Regroupe les séances qui se chevauchent dans le temps et
 * retourne une Map idSeance → { colIndex, totalCols }.
 */
function assignColumns(daySeances) {
  const toMins = t => { const [h, m] = String(t).split(":").map(Number); return h * 60 + m; };
  const sorted = [...daySeances].sort((a, b) => toMins(a.heureDebut) - toMins(b.heureDebut));
  const assigned = new Map();
  const groups = [];

  for (const s of sorted) {
    const sStart = toMins(s.heureDebut);
    const sEnd   = toMins(s.heureFin);
    let placed = false;
    for (const group of groups) {
      const overlaps = group.some(g => {
        const gStart = toMins(g.heureDebut);
        const gEnd   = toMins(g.heureFin);
        return sStart < gEnd && sEnd > gStart;
      });
      if (overlaps) { group.push(s); placed = true; break; }
    }
    if (!placed) groups.push([s]);
  }

  for (const group of groups) {
    const total = group.length;
    group.forEach((s, idx) => assigned.set(s.idSeance, { colIndex: idx, totalCols: total }));
  }
  return assigned;
}

function buildPlanningHTML(seances, monday, sunday, formatWeekLabel) {
  const rows = seances.map(s => `
    <tr>
      <td>${DAY_NAMES[dayOfWeekIndex(s.date)]} ${new Date(s.date).toLocaleDateString("fr-FR")}</td>
      <td>${String(s.heureDebut).slice(0, 5)}</td>
      <td>${String(s.heureFin).slice(0, 5)}</td>
      <td>${s.activiteNom || "—"}</td>
      <td>${(s.coachPrenom || "") + " " + (s.coachNom || "")}</td>
      <td>${s.publicCible || "—"}</td>
      <td>${s.participantsMax}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8">
<style>
  body { font-family: sans-serif; font-size: 13px; padding: 24px; color: #1a1a1a; }
  h2   { color: #e53935; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
  th { background: #e53935; color: #fff; }
  tr:nth-child(even) { background: #f9f9f9; }
</style></head><body>
  <h2>Planning — ${formatWeekLabel()}</h2>
  <table>
    <thead><tr>
      <th>Jour</th><th>Début</th><th>Fin</th>
      <th>Activité</th><th>Coach</th><th>Public</th><th>Places max</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
</body></html>`;
}

// ══════════════════════════════════════════════
//  MODAL — AJOUTER UN PARTICIPANT
// ══════════════════════════════════════════════
const AddParticipantModal = ({ seance, onClose, onSuccess }) => {
  const [query,     setQuery]     = useState("");
  const [results,   setResults]   = useState([]);
  const [searching, setSearching] = useState(false);
  const [adding,    setAdding]    = useState(null);
  const [feedback,  setFeedback]  = useState(null);
  const [addedIds,  setAddedIds]  = useState(new Set());

  useEffect(() => {
    window.api.getPresencesSeance(seance.idSeance)
      .then(ids => setAddedIds(new Set(ids)))
      .catch(() => {});
  }, [seance.idSeance]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await window.api.searchAdherents(query.trim());
        const arr  = Array.isArray(data) ? data : [];
        setResults(arr.filter(a => !addedIds.has(a.idAdherent)));
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [query, addedIds]);

  const handleAdd = async (adh) => {
    setAdding(adh.idAdherent);
    setFeedback(null);
    try {
      const dateStr = String(seance.date).split("T")[0];
      await window.api.addPresence({
        adherent_id: adh.idAdherent,
        seance_id:   seance.idSeance,
        date:        dateStr,
      });
      setFeedback({ msg: `✓ ${adh.prenom} ${adh.nom} ajouté(e)`, ok: true });
      setAddedIds(prev => new Set([...prev, adh.idAdherent]));
      setResults(prev => prev.filter(a => a.idAdherent !== adh.idAdherent));
      onSuccess();
    } catch {
      setFeedback({ msg: "❌ Erreur (déjà inscrit ?)", ok: false });
    } finally {
      setAdding(null);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 3000,
      background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 14, width: 480, maxWidth: "94vw",
        maxHeight: "80vh", display: "flex", flexDirection: "column",
        overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: C.text, fontWeight: 700, fontSize: 15 }}>Ajouter un participant</div>
            <div style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>
              {seance.activiteNom} — {DAY_NAMES[dayOfWeekIndex(seance.date)]} {String(seance.heureDebut).slice(0, 5)}
              {"  "}
              <span style={{ fontWeight: 700, color: seance.presents >= seance.participantsMax ? "#ff6b6b" : C.green }}>
                {seance.presents}/{seance.participantsMax} places
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ position: "relative" }}>
            <Search size={13} color={C.muted} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              autoFocus type="text"
              placeholder="Nom, prénom ou téléphone…"
              value={query} onChange={e => setQuery(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                padding: "8px 10px 8px 32px",
                background: C.bg, border: `1px solid ${C.border}`,
                borderRadius: 8, color: C.text, fontFamily: "inherit", fontSize: 13, outline: "none",
              }}
            />
          </div>
        </div>

        {feedback && (
          <div style={{
            padding: "8px 16px", fontSize: 12, fontWeight: 600,
            color:      feedback.ok ? C.green    : "#ff6b6b",
            background: feedback.ok ? "rgba(34,197,94,0.09)" : "rgba(239,68,68,0.09)",
            borderBottom: `1px solid ${C.border}`,
          }}>{feedback.msg}</div>
        )}

        <div style={{ flex: 1, overflowY: "auto" }}>
          {searching ? (
            <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 13 }}>Recherche…</div>
          ) : results.length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: C.muted, fontSize: 13 }}>
              {query.trim() ? "Aucun adhérent trouvé" : "Tapez un nom pour rechercher"}
            </div>
          ) : results.map(adh => (
            <div key={adh.idAdherent} style={{
              padding: "11px 16px", borderBottom: `1px solid ${C.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div>
                <div style={{ color: C.text, fontWeight: 600, fontSize: 13 }}>{adh.prenom} {adh.nom}</div>
                <div style={{ color: C.muted, fontSize: 11, marginTop: 2, display: "flex", alignItems: "center", gap: 8 }}>
                  {adh.numTelephone || "—"}
                  {adh.abonnementStatut && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 20,
                      background: adh.abonnementStatut === "actif" ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.2)",
                      color:      adh.abonnementStatut === "actif" ? C.green : C.muted,
                    }}>{adh.abonnementStatut}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleAdd(adh)}
                disabled={adding === adh.idAdherent}
                style={{
                  background: adding === adh.idAdherent ? C.muted : C.accent,
                  color: "#fff", border: "none", borderRadius: 7,
                  padding: "6px 16px", fontSize: 12, fontWeight: 700,
                  cursor: adding === adh.idAdherent ? "not-allowed" : "pointer", flexShrink: 0,
                }}
              >{adding === adh.idAdherent ? "Ajout…" : "+ Ajouter"}</button>
            </div>
          ))}
        </div>

        <div style={{ padding: "12px 16px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "7px 22px", color: C.subtle, fontSize: 13, cursor: "pointer",
          }}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
//  MODAL — MESSAGE SPÉCIAL
// ══════════════════════════════════════════════
const SpecialMessageModal = ({ onClose }) => {
  const [type,          setType]    = useState("aidkoum");
  const [customText,    setText]    = useState("");
  const [customSubject, setSub]     = useState("");
  const [sending,       setSending] = useState(false);
  const [result,        setResult]  = useState(null);

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await window.api.sendSpecialMessage({ type, customText, customSubject });
      setResult(res.success
        ? `✓ Message envoyé à ${res.count} adhérent(s)`
        : `❌ Erreur : ${res.error || res.message}`
      );
    } catch {
      setResult("❌ Erreur inattendue");
    } finally {
      setSending(false);
    }
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, zIndex: 3000,
      background: "rgba(0,0,0,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 14, width: 460, padding: 24,
        boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
      }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 16 }}>
          📢 Envoyer un message spécial
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {[
            { key: "aidkoum",   label: "🌙 Saha Aidkoum" },
            { key: "fermeture", label: "⚠️ Fermeture" },
            { key: "custom",    label: "✏️ Personnalisé" },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setType(key)} style={{
              flex: 1, padding: "8px 0", borderRadius: 8,
              border:      `1px solid ${type === key ? C.accent : C.border}`,
              background:  type === key ? C.accentDim : "transparent",
              color:       type === key ? C.accent    : C.muted,
              fontSize: 12, fontWeight: 700, cursor: "pointer",
            }}>{label}</button>
          ))}
        </div>

        {type === "custom" && (
          <input
            type="text" placeholder="Sujet de l'email"
            value={customSubject} onChange={e => setSub(e.target.value)}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "8px 12px", marginBottom: 10,
              background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.text, fontSize: 13, outline: "none",
            }}
          />
        )}

        {(type === "fermeture" || type === "custom") && (
          <textarea
            placeholder="Contenu du message…"
            value={customText} onChange={e => setText(e.target.value)}
            rows={4}
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "8px 12px", marginBottom: 10,
              background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 8, color: C.text, fontSize: 13,
              resize: "vertical", fontFamily: "inherit", outline: "none",
            }}
          />
        )}

        {result && (
          <div style={{
            padding: "8px 12px", borderRadius: 8, marginBottom: 12,
            fontSize: 12, fontWeight: 600,
            color:      result.startsWith("✓") ? C.green    : "#ff6b6b",
            background: result.startsWith("✓") ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
          }}>{result}</div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{
            padding: "8px 20px", borderRadius: 8,
            border: `1px solid ${C.border}`, background: "transparent",
            color: C.muted, fontSize: 13, cursor: "pointer",
          }}>Annuler</button>
          <button onClick={handleSend} disabled={sending} style={{
            padding: "8px 24px", borderRadius: 8, border: "none",
            background: sending ? C.muted : C.accent,
            color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}>{sending ? "Envoi…" : "Envoyer à tous les actifs"}</button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
//  POPUP DÉTAIL SÉANCE
// ══════════════════════════════════════════════
const SeancePopup = ({ seance, pos, onClose, onDelete, onAddParticipant }) => {
  const color  = seance.activiteCouleur || "#e53935";
  const isFull = seance.presents >= seance.participantsMax;
  const pct    = seance.participantsMax
    ? Math.min(100, Math.round((seance.presents / seance.participantsMax) * 100))
    : 0;

  const left = Math.min(pos.x, window.innerWidth  - 290);
  const top  = Math.min(pos.y, window.innerHeight - 340);

  return (
    <div style={{
      position: "fixed", left, top, width: 270,
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, zIndex: 1000, overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
    }} onClick={e => e.stopPropagation()}>

      <div style={{ background: `linear-gradient(135deg,${color}cc,${color}66)`, padding: "14px 16px", position: "relative" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#fff" }}>{seance.activiteNom || "Séance"}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,.75)", marginTop: 2 }}>
          {DAY_NAMES[dayOfWeekIndex(seance.date)]} • {String(seance.heureDebut).slice(0,5)} – {String(seance.heureFin).slice(0,5)}
        </div>
        <button onClick={onClose} style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(0,0,0,0.3)", border: "none", borderRadius: "50%",
          width: 22, height: 22, color: "#fff", cursor: "pointer",
          fontSize: 15, display: "grid", placeItems: "center", lineHeight: 1,
        }}>×</button>
      </div>

      <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 9 }}>
        {[
          { label: "Coach",  value: `${seance.coachPrenom || ""} ${seance.coachNom || ""}`.trim() || "—" },
          { label: "Salle",  value: seance.salle  || "—" },
          { label: "Statut", value: seance.statut || "confirmée" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.muted }}>{label}</span>
            <span style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{value}</span>
          </div>
        ))}

        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 2 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: C.muted }}>Participants</span>
            <span style={{ fontSize: 13, fontWeight: 800, color: isFull ? "#ff6b6b" : C.green }}>
              {seance.presents} / {seance.participantsMax}
            </span>
          </div>
          <div style={{ height: 5, background: C.border, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: isFull ? C.accent : C.green, borderRadius: 10, transition: "width .3s" }} />
          </div>

          {(seance.nbHommes > 0 || seance.nbFemmes > 0 || seance.nbEnfants > 0) && (
            <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
              {seance.nbHommes > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                  background: "rgba(59,130,246,.2)", color: "#93c5fd" }}>♂ {seance.nbHommes} H</span>
              )}
              {seance.nbFemmes > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                  background: "rgba(236,72,153,.2)", color: "#f9a8d4" }}>♀ {seance.nbFemmes} F</span>
              )}
              {seance.nbEnfants > 0 && (
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4,
                  background: "rgba(34,197,94,.2)", color: C.green }}>⚬ {seance.nbEnfants} E</span>
              )}
            </div>
          )}

          {isFull && (
            <div style={{ fontSize: 10, color: "#ff6b6b", marginTop: 5, fontWeight: 700 }}>Séance complète</div>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button onClick={onDelete} style={{
            flex: 1, padding: "8px 0", borderRadius: 8,
            border: "1px solid rgba(229,57,53,0.4)",
            background: "rgba(229,57,53,0.1)",
            color: C.accent, fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>Supprimer</button>
          <button
            onClick={() => !isFull && onAddParticipant()}
            disabled={isFull}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
              background: isFull ? C.border : C.accent,
              color: isFull ? C.muted : "#fff",
              fontSize: 12, fontWeight: 700,
              cursor: isFull ? "not-allowed" : "pointer",
            }}
          >+ Participant</button>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════
//  CARTE DE SÉANCE
// ══════════════════════════════════════════════
const SessionCard = ({ seance, onClick, genderFilter }) => {
  const color  = seance.activiteCouleur || "#e53935";
  const pct    = seance.participantsMax ? Math.round((seance.presents / seance.participantsMax) * 100) : 0;
  const isFull = seance.presents >= seance.participantsMax;

  // Badge "public cible" visible uniquement en mode "Tous" (filtre = null)
  const showGenderBadge = !genderFilter && seance.publicCible;

  const genderStyle = {
    "Homme":  { bg: "rgba(59,130,246,.6)",  label: "♂ H" },
    "Femme":  { bg: "rgba(236,72,153,.6)",  label: "♀ F" },
    "Enfant": { bg: "rgba(34,197,94,.55)",  label: "⚬ E" },
  };
  const badge = genderStyle[seance.publicCible] || { bg: "rgba(255,255,255,.2)", label: seance.publicCible };

  return (
    <div
      onClick={(e) => onClick(e, seance)}
      style={{
        position: "absolute", top: 2, left: 2, right: 2, bottom: 2,
        background: `linear-gradient(135deg,${color}dd,${color}88)`,
        borderRadius: 8, padding: "6px 8px", cursor: "pointer",
        overflow: "hidden", border: `1px solid ${color}88`,
        boxShadow: `0 2px 12px ${color}44`, transition: "transform .15s",
      }}
      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
      onMouseLeave={e => e.currentTarget.style.transform = ""}
    >
      {/* Badge public cible — affiché en mode "Tous" uniquement */}
      {showGenderBadge && (
        <div style={{
          position: "absolute", top: 4, right: 4,
          background: badge.bg,
          color: "#fff", fontSize: 8, fontWeight: 800,
          padding: "2px 5px", borderRadius: 4,
          lineHeight: 1.2,
        }}>
          {badge.label}
        </div>
      )}

      <div style={{
        fontSize: 11, fontWeight: 800, color: "#fff",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        paddingRight: showGenderBadge ? 28 : 0,
      }}>
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

      {(seance.nbHommes > 0 || seance.nbFemmes > 0 || seance.nbEnfants > 0) && (
        <div style={{ display: "flex", gap: 3, marginTop: 4, flexWrap: "wrap" }}>
          {seance.nbHommes > 0 && (
            <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3,
              background: "rgba(59,130,246,.45)", color: "rgba(255,255,255,.9)" }}>♂{seance.nbHommes}</span>
          )}
          {seance.nbFemmes > 0 && (
            <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3,
              background: "rgba(236,72,153,.45)", color: "rgba(255,255,255,.9)" }}>♀{seance.nbFemmes}</span>
          )}
          {seance.nbEnfants > 0 && (
            <span style={{ fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3,
              background: "rgba(34,197,94,.4)", color: "rgba(255,255,255,.9)" }}>⚬{seance.nbEnfants}</span>
          )}
        </div>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════
//  PAGE PRINCIPALE
// ══════════════════════════════════════════════
export default function Planning() {
  const [weekOffset,      setWeekOffset]      = useState(0);
  const [seances,         setSeances]         = useState([]);
  const [activites,       setActivites]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [openModal,       setOpenModal]       = useState(false);
  const [selectedSeance,  setSelectedSeance]  = useState(null);
  const [popupPos,        setPopupPos]        = useState({ x: 0, y: 0 });
  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showSpecialMsg,  setShowSpecialMsg]  = useState(false);
  const [genderFilter,    setGenderFilter]    = useState(null);
  const [emailStatus,     setEmailStatus]     = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { monday, sunday } = getWeekBounds(weekOffset);

  const envoyerPlanningParEmail = useCallback(async (seancesAJour) => {
    setEmailStatus("sending");
    try {
      const formatWeekLabel = () =>
        `Du ${monday.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} ` +
        `au ${sunday.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
      const html = buildPlanningHTML(seancesAJour, monday, sunday, formatWeekLabel);
      const res = await window.api.exportEtEnvoyerPlanningPDF({
        html,
        filename:  `planning-${toYMD(monday)}.pdf`,
        dateDebut: toYMD(monday),
        dateFin:   toYMD(sunday),
      });
      setEmailStatus(res.success ? "success" : "error");
      setTimeout(() => setEmailStatus(null), 4000);
    } catch {
      setEmailStatus("error");
      setTimeout(() => setEmailStatus(null), 4000);
    }
  }, [monday, sunday]);

  const filteredSeances = genderFilter
    ? seances.filter(s => s.publicCible === genderFilter)
    : seances;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([
        window.api.getSeancesSemaine({ dateDebut: toYMD(monday), dateFin: toYMD(sunday) }),
        window.api.getActivites(),
      ]);
      setSeances(Array.isArray(s) ? s : []);
      setActivites(Array.isArray(a) ? a : []);
    } catch (err) {
      console.error("Planning load:", err);
    } finally {
      setLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("openModal") === "true") {
      setOpenModal(true);
      navigate("/planning", { replace: true });
    }
  }, [location.search]);

  const handleCardClick = (e, seance) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopupPos({ x: rect.right + 8, y: rect.top });
    setSelectedSeance(seance);
    setShowAddModal(false);
  };

  const handleOverlayClick = () => {
    setSelectedSeance(null);
    setShowAddModal(false);
  };

  const handleParticipantAdded = useCallback(async () => {
    try {
      const fresh = await window.api.getSeancesSemaine({ dateDebut: toYMD(monday), dateFin: toYMD(sunday) });
      const arr   = Array.isArray(fresh) ? fresh : [];
      setSeances(arr);
      if (selectedSeance) {
        const updated = arr.find(s => s.idSeance === selectedSeance.idSeance);
        if (updated) setSelectedSeance(updated);
      }
    } catch {
      load();
    }
  }, [selectedSeance, monday, sunday, load]);

  const handleExportPDF = async (e) => {
    e.stopPropagation();
    const formatWeekLabel = () =>
      `Du ${monday.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} au ${sunday.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;
    const html = buildPlanningHTML(seances, monday, sunday, formatWeekLabel);
    await window.api.exportPlanningPDF({ html, filename: `planning-${toYMD(monday)}.pdf` });
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const formatWeekLabel = () =>
    `Du ${monday.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} au ${sunday.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}`;

  const totalSeances  = seances.length;
  const totalPresents = seances.reduce((a, s) => a + (s.presents || 0), 0);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}
      onClick={handleOverlayClick}
    >
      {/* ── HERO ── */}
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
          <button
            onClick={e => { e.stopPropagation(); setOpenModal(true); }}
            style={{ display: "flex", alignItems: "center", gap: 8, background: C.accent, color: "#fff", border: "none", borderRadius: 10, padding: "12px 22px", fontFamily: "'Barlow',sans-serif", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 20px rgba(229,57,53,0.4)" }}
          >
            <Plus size={17} /> Ajouter une séance
          </button>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 36px", background: C.bg,
        borderBottom: `1px solid ${C.border}`, flexShrink: 0, gap: 12, flexWrap: "wrap",
      }}>
        {/* Navigation semaine */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={e => { e.stopPropagation(); setWeekOffset(w => w - 1); }} style={{ width: 34, height: 34, borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <ChevronLeft size={15} />
          </button>
          <div style={{ fontSize: "0.875rem", fontWeight: 700, color: C.text, fontFamily: "'Barlow Condensed',sans-serif" }}>
            {formatWeekLabel()}
          </div>
          <button onClick={e => { e.stopPropagation(); setWeekOffset(w => w + 1); }} style={{ width: 34, height: 34, borderRadius: 8, background: C.card, border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Filtre genre */}
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { key: null,      label: "Tous" },
            { key: "Homme",   label: "♂ Hommes" },
            { key: "Femme",   label: "♀ Femmes" },
          ].map(({ key, label }) => (
            <button
              key={String(key)}
              onClick={e => { e.stopPropagation(); setGenderFilter(key); }}
              style={{
                padding: "5px 14px", borderRadius: 9999,
                border: "none", cursor: "pointer",
                fontSize: "0.78rem", fontWeight: 700,
                background: genderFilter === key ? C.accent : C.card,
                color:      genderFilter === key ? "#fff"   : C.muted,
              }}
            >{label}</button>
          ))}
        </div>

        {/* Actions droite */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={e => { e.stopPropagation(); setShowSpecialMsg(true); }} style={{
            padding: "6px 14px", borderRadius: 8,
            border: `1px solid ${C.border}`, background: C.card,
            color: C.subtle, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
          }}>📢 Message spécial</button>

          <button onClick={handleExportPDF} style={{
            padding: "6px 14px", borderRadius: 8,
            border: `1px solid ${C.border}`, background: C.card,
            color: C.subtle, fontSize: "0.8rem", fontWeight: 700, cursor: "pointer",
          }}>📄 Exporter PDF</button>

          <button
            onClick={async (e) => { e.stopPropagation(); await envoyerPlanningParEmail(seances); }}
            disabled={emailStatus === "sending"}
            style={{
              padding: "6px 14px", borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.card,
              color: emailStatus === "sending" ? C.muted : C.subtle,
              fontSize: "0.8rem", fontWeight: 700,
              cursor: emailStatus === "sending" ? "not-allowed" : "pointer",
            }}
          >📧 Envoyer le planning</button>

          <button onClick={e => { e.stopPropagation(); setWeekOffset(0); }} style={{
            padding: "6px 20px", borderRadius: 9999, border: "none", cursor: "pointer",
            fontFamily: "'Barlow',sans-serif", fontSize: "0.875rem", fontWeight: 700,
            background: C.accent, color: "#fff",
          }}>Aujourd'hui</button>
        </div>
      </div>

      {/* Notification email */}
      {emailStatus && (
        <div style={{
          margin: "0 36px",
          padding: "10px 16px",
          borderRadius: 8,
          fontSize: "0.85rem",
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: emailStatus === "sending" ? "rgba(255,193,7,0.1)"  :
                      emailStatus === "success"  ? "rgba(34,197,94,0.1)"  :
                                                   "rgba(239,68,68,0.1)",
          border: `1px solid ${
                      emailStatus === "sending" ? "rgba(255,193,7,0.3)"  :
                      emailStatus === "success"  ? "rgba(34,197,94,0.3)"  :
                                                   "rgba(239,68,68,0.3)"}`,
          color: emailStatus === "sending" ? "#fbbf24" :
                 emailStatus === "success"  ? "#22c55e" :
                                              "#f87171",
        }}>
          <span style={{ fontSize: "1.1rem" }}>
            {emailStatus === "sending" ? "⏳" : emailStatus === "success" ? "✅" : "❌"}
          </span>
          {emailStatus === "sending" && "Envoi du planning en cours…"}
          {emailStatus === "success"  && "Planning envoyé avec succès à tous les adhérents actifs !"}
          {emailStatus === "error"    && "Erreur lors de l'envoi du planning."}
        </div>
      )}

      {/* ── GRILLE ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 36px 36px" }}>
        <div style={{ background: C.card, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>

          {/* En-têtes des jours */}
          <div style={{ display: "grid", gridTemplateColumns: `64px repeat(7,1fr)`, borderBottom: `1px solid ${C.border}`, background: "#14161c" }}>
            <div style={{ borderRight: `1px solid ${C.border}` }} />
            {weekDays.map((dayDate, i) => {
              const isToday = toYMD(dayDate) === toYMD(new Date());
              return (
                <div key={i} style={{ padding: "12px 8px", textAlign: "center", borderRight: i < 6 ? `1px solid ${C.border}` : "none", background: isToday ? "rgba(229,57,53,0.08)" : "transparent" }}>
                  <div style={{ fontSize: "0.65rem", color: isToday ? C.accent : C.muted, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>
                    {DAY_NAMES[dayDate.getDay()]}
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: isToday ? C.accent : "transparent", color: isToday ? "#fff" : C.subtle, fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center", margin: "0 auto" }}>
                    {dayDate.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Corps de la grille */}
          <div style={{ display: "grid", gridTemplateColumns: `64px repeat(7,1fr)` }}>

            {/* Colonne heures */}
            <div style={{ background: "#14161c" }}>
              {HOURS.map((hour, hIdx) => (
                <div key={hour} style={{
                  height: CELL_H,
                  display: "flex", alignItems: "flex-start",
                  justifyContent: "flex-end",
                  paddingRight: 10, paddingTop: 8,
                  borderBottom: hIdx < HOURS.length - 1 ? `1px solid ${C.border}` : "none",
                  borderRight: `1px solid ${C.border}`,
                }}>
                  <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{hour}</span>
                </div>
              ))}
            </div>

            {/* Colonnes jours */}
            {weekDays.map((dayDate, i) => {
              const dow        = dayDate.getDay();
              const isToday    = toYMD(dayDate) === toYMD(new Date());
              const daySeances = filteredSeances.filter(s => dayOfWeekIndex(s.date) === dow);
              const colMap     = assignColumns(daySeances);

              return (
                <div key={i} style={{
                  position: "relative",
                  height: CELL_H * HOURS.length,
                  borderRight: i < 6 ? `1px solid ${C.border}` : "none",
                  background: isToday ? "rgba(229,57,53,0.03)" : "transparent",
                }}>
                  {/* Lignes horaires */}
                  {HOURS.map((_, hIdx) => (
                    <div key={hIdx} style={{
                      position: "absolute", left: 0, right: 0,
                      top: hIdx * CELL_H, height: CELL_H,
                      borderBottom: hIdx < HOURS.length - 1 ? `1px solid ${C.border}` : "none",
                      pointerEvents: "none",
                    }} />
                  ))}

                  {/* Cartes séances — côte à côte si chevauchement */}
                  {daySeances.map(seance => {
                    const { top, height } = sessionHeightAndTop(seance.heureDebut, seance.heureFin);
                    const { colIndex, totalCols } = colMap.get(seance.idSeance) || { colIndex: 0, totalCols: 1 };
                    const colW  = 100 / totalCols;
                    const left  = `calc(${colW * colIndex}% + 2px)`;
                    const right = `calc(${colW * (totalCols - colIndex - 1)}% + 2px)`;

                    return (
                      <div key={seance.idSeance} style={{
                        position: "absolute",
                        left,
                        right,
                        top: top + 2,
                        height: height - 4,
                      }}>
                        <SessionCard
                          seance={seance}
                          onClick={handleCardClick}
                          genderFilter={genderFilter}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Légende activités */}
        {activites.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "16px 22px" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: C.muted, marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>
              Légende des activités
            </div>
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

      {/* ── OVERLAYS & MODALS ── */}
      {selectedSeance && (
        <div onClick={handleOverlayClick} style={{ position: "fixed", inset: 0, zIndex: 999 }} />
      )}

      {selectedSeance && (
        <SeancePopup
          seance={selectedSeance}
          pos={popupPos}
          onClose={() => { setSelectedSeance(null); setShowAddModal(false); }}
          onDelete={async () => {
            await window.api.deleteSeance(selectedSeance.idSeance);
            setSelectedSeance(null);
            setShowAddModal(false);
            const fresh = await window.api.getSeancesSemaine({
              dateDebut: toYMD(monday),
              dateFin:   toYMD(sunday),
            });
            setSeances(Array.isArray(fresh) ? fresh : []);
          }}
          onAddParticipant={() => setShowAddModal(true)}
        />
      )}

      {showAddModal && selectedSeance && (
        <AddParticipantModal
          seance={selectedSeance}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleParticipantAdded}
        />
      )}

      {showSpecialMsg && (
        <SpecialMessageModal onClose={() => setShowSpecialMsg(false)} />
      )}

      {openModal && (
        <NouvelSeanceModal
          activites={activites}
          onClose={() => setOpenModal(false)}
          onSave={async () => {
            setOpenModal(false);
            const fresh = await window.api.getSeancesSemaine({
              dateDebut: toYMD(monday),
              dateFin:   toYMD(sunday),
            });
            setSeances(Array.isArray(fresh) ? fresh : []);
          }}
        />
      )}
    </div>
  );
}