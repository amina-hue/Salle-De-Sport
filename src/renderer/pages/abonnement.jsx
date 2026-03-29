import React, { useState } from "react";
import {
 Plus, Edit2, Trash2, AlertCircle,
} from "lucide-react";
import Sidebar from '../components/Sidebar';
import Button from "../components/AddButton";
import gym from "../../images/gym.png";


/* ─── PLAN DATA ── */
const planData = [
 { name: "Standard Mensuel",     duration: "1 mois",   price: "490 DA",   per: "par mois",     features: ["Accès salle de sport", "Vestiaires & douches", "5 séances/semaine"],                                            members: 38, full: true,  tier: "standard" },
 { name: "Standard Trimestriel", duration: "3 mois",   price: "1 290 DA", per: "par 3 mois",   features: ["Accès salle de sport", "Vestiaires & douches", "Séances illimitées", "10% de réduction"],                      members: 25, full: false, tier: "standard" },
 { name: "Standard Annuel",      duration: "12 mois",  price: "4 690 DA", per: "par 12 mois",  features: ["Accès salle de sport", "Vestiaires & douches", "Séances illimitées", "20% de réduction"],                      members: 62, full: false, tier: "standard" },
 { name: "Premium Mensuel",      duration: "1 mois",   price: "790 DA",   per: "par mois",     features: ["Tout Standard +", "Coaching personnalisé", "Cours collectifs", "Espace wellness"],                              members: 50, full: true,  tier: "premium"  },
 { name: "Premium Trimestriel",  duration: "3 mois",   price: "2 190 DA", per: "par 3 mois",   features: ["Tout Standard +", "Coaching personnalisé", "Cours collectifs", "Espace wellness", "15% de réduction"],          members: 73, full: true,  tier: "premium"  },
 { name: "Premium Annuel",       duration: "12 mois",  price: "7 990 DA", per: "par 12 mois",  features: ["Tout Standard +", "Coaching personnalisé", "Cours collectifs", "Espace wellness", "25% de réduction"],          members: 52, full: false, tier: "premium"  },
];


const PlanCard = ({ plan }) => {
 const isPremium = plan.tier === "premium";
 const accent = isPremium ? "#e63946" : "#3a7bd5";
 return (
   <div style={{ background: "rgba(21, 20, 20, 0.75)", borderRadius: 14, padding: "20px", border: `1px solid rgb(20, 19, 19)`, position: "relative", overflow: "hidden", transition: "transform .2s, box-shadow .2s" }}
     onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 30px ${accent}22`; }}
     onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
   >
     <div style={{ position: "absolute", top: 0, right: 0, background: isPremium ? "linear-gradient(135deg,#e63946,#c1121f)" : "linear-gradient(135deg,#3a7bd5,#1a56b0)", fontSize: 9, color: "#fff", padding: "3px 10px", borderBottomLeftRadius: 8, fontWeight: 700, letterSpacing: ".5px", textTransform: "uppercase" }}>{isPremium ? "Premium" : "Standard"}</div>
     <div style={{ marginBottom: 4 }}><span style={{ color: "#999", fontSize: 10, background: "#ffffff0d", padding: "2px 8px", borderRadius: 20 }}>{plan.duration}</span></div>
     <h3 style={{ color: "#f1f1f1", fontSize: 14, fontWeight: 700, margin: "6px 0 2px" }}>{plan.name}</h3>
     <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "10px 0 4px" }}><span style={{ color: accent, fontSize: 24, fontWeight: 800 }}>{plan.price}</span></div>
     <p style={{ color: "#555", fontSize: 11, margin: "0 0 14px" }}>{plan.per}</p>
     <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px" }}>
       {plan.features.map((f, i) => (<li key={i} style={{ fontSize: 12, color: "#aaa", display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}><span style={{ color: accent, fontSize: 14 }}>✓</span>{f}</li>))}
     </ul>
     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #ffffff08", paddingTop: 12 }}>
       <span style={{ fontSize: 11, color: "#666" }}><span style={{ color: "#f1f1f1", fontWeight: 600 }}>{plan.members}</span> adhérents</span>
       <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: plan.full ? "#e6394620" : "#22c55e20", color: plan.full ? "#e63946" : "#22c55e" }}>{plan.full ? "COMPLET" : "ACTIF"}</span>
     </div>
     <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
       <button style={{ flex: 1, padding: "7px 0", fontSize: 11, background: `${accent}18`, color: accent, border: `1px solid ${accent}33`, borderRadius: 7, cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}><Edit2 size={12} /> Modifier</button>
       <button style={{ padding: "7px 10px", fontSize: 11, background: "#ffffff08", color: "#666", border: "1px solid #ffffff10", borderRadius: 7, cursor: "pointer", display: "flex", alignItems: "center" }}><Trash2 size={12} /></button>
     </div>
   </div>
 );
};


const expiryData = [
 { initials: "SM", name: "Sophie Martin",  plan: "Premium Mensuel",     days: "2 jours",  status: "urgent",  color: "#e63946" },
 { initials: "LB", name: "Lucas Bernard",  plan: "Standard Mensuel",    days: "4 jours",  status: "warning", color: "#f59e0b" },
 { initials: "ED", name: "Emma Dubois",    plan: "Premium Trimestriel", days: "4 jours",  status: "warning", color: "#f59e0b" },
 { initials: "TP", name: "Thomas Petit",   plan: "Standard Mensuel",    days: "6 jours",  status: "warning", color: "#f59e0b" },
 { initials: "JM", name: "Julie Moreau",   plan: "Premium Annuel",      days: "22 jours", status: "ok",      color: "#22c55e" },
];
const avatarColors = ["#e63946", "#3a7bd5", "#f59e0b", "#8b5cf6", "#22c55e"];


const AbonnementsPage = () => {
 return (
   <div style={{
     display: "flex",       /* conteneur flex principal */
     height: "100vh",       /* bloque au viewport */
     overflow: "hidden",    /* empêche le scroll global */
     background: "#0f0f18",
     fontFamily: "'Inter', 'Segoe UI', sans-serif",
     color: "#f1f1f1",
   }}>


     {/* ── SIDEBAR : flex item, ne scroll jamais ── */}
     <div style={{
       flexShrink: 0,       /* ne se rétrécit pas */
       height: "100vh",
       position: "sticky",
       top: 0,
       overflowY: "auto",
     }}>
       <Sidebar />
     </div>


     {/* ── CONTENU : flex item, scroll indépendant ── */}
     <div style={{
       flex: 1,             /* prend tout l'espace restant */
       overflowY: "auto",   /* scroll uniquement ici */
       padding: "30px 32px",
       backgroundImage: `linear-gradient(rgba(11,11,18,0.6), rgba(11,11,18,0.95)), url(${gym})`
     }}>


       {/* Header */}
       <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
         <div>
           <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: "-.3px" }}>Gestion des abonnements</h1>
           <p style={{ margin: "4px 0 0", color: "#c2bcbc", fontSize: 13 }}>Gérez vos types d'abonnements disponibles</p>
         </div>
         <Button variant="primary" icon={Plus}>Ajouter un abonnement</Button>
       </div>


       {/* Alert */}
       <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#1a1a26", border: "1px solid #e6394633", borderRadius: 12, padding: "14px 18px", marginBottom: 28 }}>
         <AlertCircle size={18} color="#e63946" />
         <div>
           <span style={{ color: "#f1f1f1", fontWeight: 600, fontSize: 13 }}>Abonnements à renouveler — </span>
           <span style={{ color: "#888", fontSize: 13 }}>8 abonnements expirent dans les 15 prochains jours. Pensez à contacter vos adhérents.</span>
         </div>
       </div>


       {/* Plan cards */}
       <div style={{ marginBottom: 36 }}>
         <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: "#ccc", letterSpacing: "-.2px" }}>Plans disponibles</h2>
         <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
           {planData.map((p, i) => <PlanCard key={i} plan={p} />)}
         </div>
       </div>


       {/* Expiry table */}
      <div style={{ background: "#271D1F", borderRadius: 16, border: "1px solid #2a2a3a", overflow: "hidden" }}>
  <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid #1e1819" }}>
    <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#eee" }}>Abonnements arrivant à expiration</h2>
    <p style={{ margin: "3px 0 0", color: "#888", fontSize: 12 }}>Quotas des renouvellements à venir</p>
  </div>
  <table style={{ width: "100%", borderCollapse: "collapse" }}>
    <thead>
      <tr style={{ background: "#1e1819" }}>
        {["ADHÉRENT", "ABONNEMENT", "EXPIRE DANS", "STATUT", "ACTIONS"].map(h => (
          <th key={h} style={{ textAlign: "left", padding: "11px 22px", fontSize: 10, color: "#aaa", letterSpacing: ".8px", fontWeight: 700 }}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody style={{ backgroundColor: "rgba(0,0,0,0.3)" }}>
  {expiryData.map((row, i) => (
    <tr key={i} style={{ borderTop: "1px solid #2a2a3a", transition: "background 0.2s" }}
        onMouseEnter={e => e.currentTarget.style.background = "#2a2a3a"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <td style={{ padding: "13px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: avatarColors[i % avatarColors.length] + "33",
            border: `1px solid ${avatarColors[i % avatarColors.length]}55`,
            display: "grid", placeItems: "center",
            fontSize: 11, fontWeight: 700, color: avatarColors[i % avatarColors.length]
          }}>{row.initials}</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#eee" }}>{row.name}</span>
        </div>
      </td>
      <td style={{ padding: "13px 22px", fontSize: 13, color: "#ccc" }}>{row.plan}</td>
      <td style={{ padding: "13px 22px", fontSize: 13, color: "#bbb", fontWeight: 600 }}>{row.days}</td>
      <td style={{ padding: "13px 22px" }}>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20,
          background: row.color + "33", color: row.color
        }}>
          {row.status === "urgent" ? "Urgent" : row.status === "warning" ? "Bientôt" : "OK"}
        </span>
      </td>
      <td style={{ padding: "13px 22px" }}>
        <button style={{
          fontSize: 12, color: "#3a7bd5",
          background: "#3a7bd533", border: "1px solid #3a7bd544",
          borderRadius: 7, padding: "5px 12px", cursor: "pointer", fontWeight: 600,
          transition: "background 0.2s, color 0.2s"
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#3a7bd544"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "#3a7bd533"; e.currentTarget.style.color = "#3a7bd5"; }}>
          Contacter
        </button>
      </td>
    </tr>
  ))}
</tbody>
  </table>
</div>                       


     </div>
   </div>
 );
};


export default AbonnementsPage;