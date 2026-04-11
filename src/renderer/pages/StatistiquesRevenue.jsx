import React, { useEffect, useMemo, useState } from "react";
import { ChevronRight, RefreshCw, Wallet, ShoppingCart, TrendingUp, Clock3, BadgeInfo } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import gymBg from "../../images/Gymnastique.png";
import QuickActions from "../components/QuickActions";

const C = {
  bg: "#0e0f11",
  card: "#1a1d24",
  cardHover: "#1f2330",
  border: "#252833",
  borderHover: "#e53935",
  accent: "#e53935",
  accentDim: "rgba(229,57,53,0.12)",
  accentBorder: "rgba(229,57,53,0.3)",
  text: "#f0f0f0",
  muted: "#6b7280",
  subtle: "#9ca3af",
  green: "#22c55e",
  gold: "#f59e0b",
  blue: "#3b82f6",
};

const MONTHS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

function formatDA(value) {
  return `${Number(value || 0).toLocaleString("fr-DZ")} DA`;
}

function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function getDateValue(item) {
  return item?.date || item?.datePaiement || item?.createdAt || item?.created_at || null;
}

function getMonthLabel(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;
  return MONTHS[d.getMonth()];
}

function StatCard({ icon: Icon, label, value, sub, trend, trendColor, bg }) {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: "20px 22px",
        background: bg,
        border: "1px solid rgba(255,255,255,0.06)",
        transition: "all 0.22s",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p
            style={{
              color: C.muted,
              fontSize: "0.75rem",
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 6,
              marginTop: 0,
            }}
          >
            {label}
          </p>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "2.4rem",
              fontWeight: 800,
              color: C.text,
              margin: 0,
              lineHeight: 1,
            }}
          >
            {value}
          </h2>
          {trend && (
            <p style={{ color: trendColor, fontSize: "0.78rem", marginTop: 8, marginBottom: 0, fontWeight: 600 }}>
              {trend}
            </p>
          )}
          {sub && (
            <p style={{ color: C.muted, fontSize: "0.72rem", marginTop: 4, marginBottom: 0 }}>
              {sub}
            </p>
          )}
        </div>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.06)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={17} color={trendColor || C.accent} />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${trendColor || C.accent}60, transparent)`,
        }}
      />
    </div>
  );
}

export default function StatistiquesRevenue({ onPageChange }) {
  const navigate = (page) => {
    if (onPageChange) onPageChange(page);
  };

  const [paiements, setPaiements] = useState([]);
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [pData, prodData] = await Promise.all([
          window.api?.getPaiements ? window.api.getPaiements() : Promise.resolve([]),
          window.api?.getProduits ? window.api.getProduits() : Promise.resolve([]),
        ]);

        setPaiements(Array.isArray(pData) ? pData : []);
        setProduits(Array.isArray(prodData) ? prodData : []);
      } catch (e) {
        setError("Impossible de charger les données.");
        setPaiements([]);
        setProduits([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [refreshKey]);

  const stats = useMemo(() => {
    const payes = paiements.filter((p) => (p.statut || "Payé") === "Payé");
    const attente = paiements.filter((p) => p.statut === "En attente");
    const retard = paiements.filter((p) => p.statut === "En retard");

    const totalEncaisse = payes.reduce((acc, p) => acc + toNumber(p.montant), 0);
    const totalAttente = attente.reduce((acc, p) => acc + toNumber(p.montant), 0);
    const totalRetard = retard.reduce((acc, p) => acc + toNumber(p.montant), 0);

    const stockTotal = produits.reduce((acc, p) => acc + toNumber(p.stock), 0);
    const lowStock = produits.filter((p) => toNumber(p.stock) <= 5).length;
    const valeurStock = produits.reduce((acc, p) => acc + toNumber(p.stock) * toNumber(p.prix), 0);

    const byMonth = MONTHS.map((month) => ({
      month,
      ventes: 0,
      abonnements: 0,
    }));

    paiements.forEach((p) => {
      const d = getDateValue(p);
      const month = d ? getMonthLabel(d) : null;
      if (!month) return;

      const row = byMonth.find((x) => x.month === month);
      if (!row) return;

      const amount = toNumber(p.montant);
      const type = `${p.type || p.categorie || p.mode || p.modePaiement || ""}`.toLowerCase();

      if (type.includes("abonn")) {
        row.abonnements += amount;
      } else {
        row.ventes += amount;
      }
    });

    const monthlyTotal = byMonth.reduce((acc, x) => acc + x.ventes + x.abonnements, 0);
    const avgMonthly = monthlyTotal / 12;

    const currentMonth = new Date().getMonth();
    const current = byMonth[currentMonth] || { ventes: 0, abonnements: 0 };
    const previous = byMonth[Math.max(0, currentMonth - 1)] || { ventes: 0, abonnements: 0 };
    const currentTotal = current.ventes + current.abonnements;
    const previousTotal = previous.ventes + previous.abonnements;
    const trendPct = previousTotal > 0 ? (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1) : "0.0";

    return {
      payes,
      attente,
      retard,
      totalEncaisse,
      totalAttente,
      totalRetard,
      stockTotal,
      lowStock,
      valeurStock,
      byMonth,
      monthlyTotal,
      avgMonthly,
      trendPct,
    };
  }, [paiements, produits]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: C.bg }}>
      <div style={{ position: "relative", overflow: "hidden", flexShrink: 0 }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${gymBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center 35%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(14,15,17,0.93) 0%, rgba(14,15,17,0.75) 60%, rgba(229,57,53,0.06) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 40,
            background: `linear-gradient(transparent, ${C.bg})`,
          }}
        />

        <div style={{ position: "relative", padding: "32px 36px 36px", display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <QuickActions navigate={navigate} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, marginTop: 12 }}>
              <span style={{ fontSize: "0.72rem", color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
                FitManager
              </span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
                Statistiques
              </span>
              <ChevronRight size={12} color={C.muted} />
              <span style={{ fontSize: "0.72rem", color: C.accent, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
                Revenue
              </span>
            </div>

            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "3rem", fontWeight: 800, letterSpacing: 1, lineHeight: 1, margin: 0, textTransform: "uppercase", color: C.text }}>
              Statistiques Revenue
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
              {[
                { count: `${Math.round(stats.monthlyTotal / 1000)}k`, label: "DA mensuel", color: C.green },
                { count: `${Math.round(stats.totalEncaisse / 1000)}k`, label: "DA encaissé", color: C.gold },
                { count: `${stats.stockTotal}`, label: "stock total", color: C.blue },
              ].map(({ count, label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 14, background: C.border }} />}
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                    <span style={{ fontSize: "0.82rem", color: C.muted }}>
                      <strong style={{ color }}>{count}</strong> {label}
                    </span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: C.accent,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 22px",
              fontSize: "0.9rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 6px 20px rgba(229,57,53,0.4)",
            }}
          >
            <RefreshCw size={17} />
            Rafraîchir
          </button>
        </div>
      </div>

      <div style={{ display: "flex", padding: "14px 36px", background: C.bg, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ background: "#1a1d24", borderRadius: 9999, padding: 4, display: "inline-flex", gap: 4, border: `1px solid ${C.border}` }}>
          {[
            { label: "Abonnement", page: "abonnement", active: false },
            { label: "Adhérent", page: "adherent", active: false },
            { label: "Revenue", page: "revenue", active: true },
          ].map(({ label, page, active }) => (
            <button
              key={page}
              onClick={() => navigate(page)}
              style={{
                padding: "8px 28px",
                borderRadius: 9999,
                border: "none",
                cursor: "pointer",
                fontFamily: "'Barlow', sans-serif",
                fontSize: "0.875rem",
                fontWeight: active ? 700 : 400,
                background: active ? C.accent : "transparent",
                color: active ? "#fff" : C.muted,
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 36px 40px" }}>
        {error && (
          <div
            style={{
              marginBottom: 18,
              padding: "12px 14px",
              borderRadius: 10,
              background: "rgba(229,57,53,0.12)",
              border: "1px solid rgba(229,57,53,0.3)",
              color: "#fca5a5",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ color: C.muted, padding: "20px 0" }}>Chargement des statistiques...</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
              <StatCard
                icon={Wallet}
                label="Revenus encaissés"
                value={formatDA(stats.totalEncaisse)}
                sub={`${stats.payes.length} paiements`}
                trend={`+${stats.trendPct}% ce mois`}
                trendColor={C.green}
                bg="linear-gradient(145deg,#1F2A25,#2F4F3E)"
              />
              <StatCard
                icon={Clock3}
                label="En attente"
                value={formatDA(stats.totalAttente)}
                sub={`${stats.attente.length} paiements`}
                trend={stats.totalAttente ? "Montants à suivre" : "Aucun montant"}
                trendColor={C.gold}
                bg="linear-gradient(145deg,#2A2515,#4A3A10)"
              />
              <StatCard
                icon={TrendingUp}
                label="En retard"
                value={formatDA(stats.totalRetard)}
                sub={`${stats.retard.length} paiements`}
                trend={stats.totalRetard ? "À relancer" : "Aucun retard"}
                trendColor={C.accent}
                bg="linear-gradient(145deg,#2A1F1F,#5A1F1F)"
              />
              <StatCard
                icon={ShoppingCart}
                label="Valeur stock"
                value={formatDA(stats.valeurStock)}
                sub={`${stats.lowStock} produits faibles`}
                trend={`${stats.stockTotal} unités`}
                trendColor={C.blue}
                bg="linear-gradient(145deg,#1f2430,#1b2030)"
              />
            </div>

            <div style={{ background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
              <h3
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  color: C.text,
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  marginBottom: 20,
                  marginTop: 0,
                }}
              >
                Revenus mensuels
              </h3>

              <div style={{ height: 340 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.byMonth} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#252833" vertical={false} />
                    <XAxis dataKey="month" stroke="#888" tick={{ fill: "#888", fontSize: 12 }} axisLine={{ stroke: "#888" }} tickLine={false} />
                    <YAxis
                      stroke="#888"
                      tick={{ fill: "#888", fontSize: 12 }}
                      axisLine={{ stroke: "#888" }}
                      tickLine={false}
                      tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1a1d24", border: `1px solid ${C.border}`, borderRadius: 8 }}
                      formatter={(v, name) => [formatDA(v), name === "ventes" ? "Ventes" : "Abonnements"]}
                      labelStyle={{ color: C.text }}
                    />
                    <Legend
                      wrapperStyle={{ color: C.muted, paddingTop: 12, fontFamily: "'Barlow', sans-serif", fontSize: "0.82rem" }}
                      iconType="circle"
                      formatter={(v) => (v === "ventes" ? "Ventes" : "Abonnements")}
                    />
                    <Bar dataKey="abonnements" fill="#649E56" name="abonnements" radius={[4, 4, 0, 0]} barSize={44} />
                    <Bar dataKey="ventes" fill={C.accent} name="ventes" radius={[4, 4, 0, 0]} barSize={44} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginTop: 20 }}>
              <div style={{ background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
                <h3 style={{ marginTop: 0, color: C.text, textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Résumé
                </h3>
                <div style={{ display: "grid", gap: 12 }}>
                  {[
                    ["Revenu total", formatDA(stats.totalEncaisse)],
                    ["Montant en attente", formatDA(stats.totalAttente)],
                    ["Montant en retard", formatDA(stats.totalRetard)],
                    ["Moyenne mensuelle", formatDA(stats.avgMonthly)],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: "rgba(255,255,255,0.03)", borderRadius: 10, border: `1px solid ${C.border}` }}>
                      <span style={{ color: C.muted }}>{label}</span>
                      <strong style={{ color: C.text }}>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: C.card, borderRadius: 14, padding: "20px 22px", border: `1px solid ${C.border}` }}>
                <h3 style={{ marginTop: 0, color: C.text, textTransform: "uppercase", fontFamily: "'Barlow Condensed', sans-serif" }}>
                  Aperçu produits
                </h3>
                <div style={{ display: "grid", gap: 10 }}>
                  {produits.slice(0, 6).map((p) => (
                    <div key={p.idProduit || p.id} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}` }}>
                      <div style={{ color: C.text, fontSize: "0.9rem", fontWeight: 700 }}>{p.nom}</div>
                      <div style={{ color: C.muted, fontSize: "0.75rem", marginTop: 4 }}>
                        {p.categorie} • stock {p.stock} • {formatDA(p.prix)}
                      </div>
                    </div>
                  ))}
                  {!produits.length && <div style={{ color: C.muted, fontSize: "0.9rem" }}>Aucun produit trouvé.</div>}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}