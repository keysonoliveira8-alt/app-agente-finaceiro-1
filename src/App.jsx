import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line, CartesianGrid,
} from "recharts";
import {
  Wallet, ArrowDownCircle, ArrowUpCircle, PiggyBank, Target, Home,
  PlusCircle, MinusCircle, BarChart3, Moon, Sun, Sparkles, Trash2,
  TrendingUp, TrendingDown, Car, Plane, ShieldCheck, Smartphone,
  MessageCircle, Send, Bot, Crown, Check, Lock,
} from "lucide-react";

// ---------- Tema ----------
const PALETTE = {
  bgDark: "#100B1C",
  surfaceDark: "#1A1428",
  surfaceDark2: "#211A33",
  bgLight: "#F6F4FB",
  surfaceLight: "#FFFFFF",
  surfaceLight2: "#EEEAFB",
  purple: "#8B5CF6",
  purpleDeep: "#5B21B6",
  purpleSoft: "#C4B5FD",
  green: "#34D399",
  greenDeep: "#059669",
  red: "#F87171",
  textDark: "#F4F1FC",
  textMutedDark: "#9C93B8",
  textLight: "#241C38",
  textMutedLight: "#6B6482",
};

const CATEGORY_ICONS = {
  Alimentação: "🍽️", Mercado: "🛒", Transporte: "🚌", Combustível: "⛽",
  Aluguel: "🏠", Energia: "💡", Água: "🚿", Internet: "📶",
  "Cartão de crédito": "💳", Empréstimos: "🏦", Assinaturas: "🔁",
  Saúde: "🩺", Educação: "🎓", Lazer: "🎬", Outros: "📦",
};

const EXPENSE_CATS = Object.keys(CATEGORY_ICONS);
const INCOME_CATS = ["Salário", "Freelances", "Vendas", "Pix recebido", "Dinheiro em espécie", "Outros ganhos"];
const PAYMENT_METHODS = ["Pix", "Dinheiro", "Débito", "Crédito", "Boleto"];

const GOAL_ICONS = { Carro: Car, Casa: Home, Viagem: Plane, "Reserva de emergência": ShieldCheck, Outro: Target };

const money = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const seedIncomes = [
  { id: 1, valor: 4200, data: "2026-07-01", categoria: "Salário", obs: "Salário mensal" },
  { id: 2, valor: 350, data: "2026-07-05", categoria: "Freelances", obs: "Projeto extra" },
];
const seedExpenses = [
  { id: 1, valor: 620, data: "2026-07-02", categoria: "Mercado", forma: "Débito", obs: "Compra do mês" },
  { id: 2, valor: 89, data: "2026-07-03", categoria: "Internet", forma: "Pix", obs: "" },
  { id: 3, valor: 240, data: "2026-07-06", categoria: "Alimentação", forma: "Crédito", obs: "Restaurantes" },
  { id: 4, valor: 180, data: "2026-07-07", categoria: "Combustível", forma: "Débito", obs: "" },
  { id: 5, valor: 65, data: "2026-07-08", categoria: "Lazer", forma: "Pix", obs: "Cinema" },
  { id: 6, valor: 45, data: "2026-07-09", categoria: "Assinaturas", forma: "Crédito", obs: "Streaming" },
];
const seedGoals = [
  { id: 1, nome: "Reserva de emergência", tipo: "Reserva de emergência", alvo: 10000, guardado: 4200 },
  { id: 2, nome: "Viagem para o litoral", tipo: "Viagem", alvo: 5000, guardado: 1350 },
];

// Endereço do backend (server.js) publicado e id do usuário logado.
// Troque pelo endereço real e pela integração de login quando existirem.
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://SEU-BACKEND.exemplo.com";
const USER_ID = "const USER_ID = "00000000-0000-0000-0000-000000000001";

export default function AgenteFinanceiro() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState("dashboard");
  const [plano, setPlano] = useState("gratuito"); // "gratuito" | "premium"
  const [incomes, setIncomes] = useState(seedIncomes);
  const [expenses, setExpenses] = useState(seedExpenses);
  const [goals, setGoals] = useState(seedGoals);

  const c = dark
    ? { bg: PALETTE.bgDark, surface: PALETTE.surfaceDark, surface2: PALETTE.surfaceDark2, text: PALETTE.textDark, muted: PALETTE.textMutedDark }
    : { bg: PALETTE.bgLight, surface: PALETTE.surfaceLight, surface2: PALETTE.surfaceLight2, text: PALETTE.textLight, muted: PALETTE.textMutedLight };

  const totalIncome = useMemo(() => incomes.reduce((s, i) => s + i.valor, 0), [incomes]);
  const totalExpense = useMemo(() => expenses.reduce((s, e) => s + e.valor, 0), [expenses]);
  const balance = totalIncome - totalExpense;
  const savings = Math.max(balance * 0.2, 0);

  const byCategory = useMemo(() => {
    const map = {};
    expenses.forEach((e) => { map[e.categoria] = (map[e.categoria] || 0) + e.valor; });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const topCategory = byCategory[0];
  const pieColors = [PALETTE.purple, PALETTE.green, "#A78BFA", "#6EE7B7", PALETTE.purpleDeep, "#FCA5A5", "#FDE68A", "#93C5FD"];

  const weeklyFlow = useMemo(() => {
    const days = ["01","02","03","04","05","06","07","08","09","10"];
    return days.map((d) => {
      const gasto = expenses.filter((e) => e.data.endsWith(`-${d}`)).reduce((s, e) => s + e.valor, 0);
      return { dia: d, gasto };
    });
  }, [expenses]);

  const monthCompare = [
    { mes: "Mai", gasto: 2100 },
    { mes: "Jun", gasto: 2480 },
    { mes: "Jul", gasto: totalExpense },
  ];

  const dica = topCategory
    ? `Você gastou ${money(topCategory.value)} com ${topCategory.name}, ${Math.round((topCategory.value / (totalExpense || 1)) * 100)}% do total de saídas do mês.`
    : "Cadastre gastos para receber dicas personalizadas.";

  const addIncome = (item) => setIncomes((prev) => [{ ...item, id: Date.now() }, ...prev]);
  const addExpense = (item) => setExpenses((prev) => [{ ...item, id: Date.now() }, ...prev]);
  const addGoal = (item) => setGoals((prev) => [...prev, { ...item, id: Date.now() }]);
  const removeIncome = (id) => setIncomes((prev) => prev.filter((i) => i.id !== id));
  const removeExpense = (id) => setExpenses((prev) => prev.filter((i) => i.id !== id));
  const bumpGoal = (id, amount) => setGoals((prev) => prev.map((g) => g.id === id ? { ...g, guardado: Math.min(g.alvo, g.guardado + amount) } : g));

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'Inter', system-ui, sans-serif", transition: "background .3s,color .3s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
        * { box-sizing: border-box; }
        .num { font-family: 'JetBrains Mono', monospace; font-weight: 700; letter-spacing: -0.02em; }
        .display { font-family: 'Sora', sans-serif; }
        .navbtn { display:flex; flex-direction:column; align-items:center; gap:4px; padding:10px 6px; border-radius:14px; cursor:pointer; border:none; background:transparent; font-size:11px; font-family:'Inter',sans-serif; transition:.2s; }
        .navbtn:hover { background: ${c.surface2}; }
        input, select { font-family:'Inter',sans-serif; }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-thumb { background:${PALETTE.purpleDeep}; border-radius:8px; }
      `}</style>

      {/* Topbar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", position: "sticky", top: 0, background: c.bg, zIndex: 10, borderBottom: `1px solid ${c.surface2}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg, ${PALETTE.purple}, ${PALETTE.green})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <span className="display" style={{ fontSize: 18, fontWeight: 700 }}>Agente <span style={{ color: PALETTE.purple }}>Financeiro</span></span>
        </div>
        <button onClick={() => setDark((d) => !d)} style={{ background: c.surface2, border: "none", borderRadius: 999, padding: 8, cursor: "pointer", color: c.text }}>
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px" }}>
        {tab === "dashboard" && (
          <Dashboard c={c} balance={balance} totalIncome={totalIncome} totalExpense={totalExpense}
            savings={savings} byCategory={byCategory} pieColors={pieColors} dica={dica}
            weeklyFlow={weeklyFlow} monthCompare={monthCompare} goals={goals} dark={dark}
            incomes={incomes} expenses={expenses} />
        )}
        {tab === "entradas" && <ListaEntradas c={c} incomes={incomes} onAdd={addIncome} onRemove={removeIncome} dark={dark} />}
        {tab === "saidas" && <ListaSaidas c={c} expenses={expenses} onAdd={addExpense} onRemove={removeExpense} dark={dark} />}
        {tab === "metas" && <Metas c={c} goals={goals} onAdd={addGoal} onBump={bumpGoal} dark={dark} />}
        {tab === "relatorios" && <Relatorios c={c} byCategory={byCategory} pieColors={pieColors} monthCompare={monthCompare} totalIncome={totalIncome} totalExpense={totalExpense} dark={dark} />}
        {tab === "assistente" && (
          plano === "premium"
            ? <AssistenteIA c={c} dark={dark} balance={balance} addIncome={addIncome} addExpense={addExpense} />
            : <Paywall c={c} onIrParaAssinatura={() => setTab("assinatura")} />
        )}
        {tab === "assinatura" && <Assinatura c={c} dark={dark} plano={plano} setPlano={setPlano} />}
      </div>

      {/* Bottom nav */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: c.surface, borderTop: `1px solid ${c.surface2}`, display: "flex", justifyContent: "space-around", padding: "8px 2px", maxWidth: 480, margin: "0 auto", boxShadow: "0 -8px 24px rgba(0,0,0,0.15)" }}>
        <NavBtn icon={Home} label="Início" active={tab === "dashboard"} onClick={() => setTab("dashboard")} c={c} />
        <NavBtn icon={ArrowUpCircle} label="Entradas" active={tab === "entradas"} onClick={() => setTab("entradas")} c={c} />
        <NavBtn icon={ArrowDownCircle} label="Saídas" active={tab === "saidas"} onClick={() => setTab("saidas")} c={c} />
        <NavBtn icon={Target} label="Metas" active={tab === "metas"} onClick={() => setTab("metas")} c={c} />
        <NavBtn icon={BarChart3} label="Relatórios" active={tab === "relatorios"} onClick={() => setTab("relatorios")} c={c} />
        <NavBtn icon={MessageCircle} label="Assistente" active={tab === "assistente"} onClick={() => setTab("assistente")} c={c} />
        <NavBtn icon={Crown} label="Assinatura" active={tab === "assinatura"} onClick={() => setTab("assinatura")} c={c} />
      </div>
    </div>
  );
}

function NavBtn({ icon: Icon, label, active, onClick, c }) {
  return (
    <button className="navbtn" onClick={onClick} style={{ color: active ? PALETTE.purple : c.muted }}>
      <Icon size={20} strokeWidth={active ? 2.4 : 2} />
      {label}
    </button>
  );
}

function Card({ c, children, style }) {
  return <div style={{ background: c.surface, borderRadius: 20, padding: 18, ...style }}>{children}</div>;
}

// ---------- Dashboard ----------
function Dashboard({ c, balance, totalIncome, totalExpense, savings, byCategory, pieColors, dica, weeklyFlow, monthCompare, goals, dark, incomes, expenses }) {
  const movs = [
    ...incomes.map((i) => ({ ...i, tipo: "entrada" })),
    ...expenses.map((e) => ({ ...e, tipo: "saida" })),
  ].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Hero saldo */}
      <div style={{
        borderRadius: 24, padding: 24, position: "relative", overflow: "hidden",
        background: `radial-gradient(120% 140% at 20% -10%, ${PALETTE.purple}55, transparent 60%), linear-gradient(150deg, ${PALETTE.purpleDeep}, #1A1130 70%)`,
        color: "#fff",
      }}>
        <div style={{ fontSize: 13, opacity: 0.8 }}>Saldo disponível</div>
        <div className="num" style={{ fontSize: 34, marginTop: 4 }}>{money(balance)}</div>
        <div style={{ display: "flex", gap: 18, marginTop: 18 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.75, display: "flex", alignItems: "center", gap: 4 }}><TrendingUp size={12} /> Entradas</div>
            <div className="num" style={{ fontSize: 16, color: PALETTE.green }}>{money(totalIncome)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.75, display: "flex", alignItems: "center", gap: 4 }}><TrendingDown size={12} /> Saídas</div>
            <div className="num" style={{ fontSize: 16, color: "#FCA5A5" }}>{money(totalExpense)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.75 }}>Economia est.</div>
            <div className="num" style={{ fontSize: 16 }}>{money(savings)}</div>
          </div>
        </div>
      </div>

      {/* Dica IA */}
      <Card c={c} style={{ border: `1px solid ${PALETTE.purple}44` }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Sparkles size={18} color={PALETTE.purple} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13.5, lineHeight: 1.5, color: c.text }}>{dica}</div>
        </div>
      </Card>

      {/* Gastos por categoria */}
      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Gastos por categoria</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <ResponsiveContainer width="55%" height={140}>
            <PieChart>
              <Pie data={byCategory} dataKey="value" innerRadius={38} outerRadius={60} paddingAngle={2}>
                {byCategory.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            {byCategory.slice(0, 4).map((cat, i) => (
              <div key={cat.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, color: c.muted }}>
                  <span style={{ width: 8, height: 8, borderRadius: 99, background: pieColors[i % pieColors.length] }} />
                  {cat.name}
                </span>
                <span className="num" style={{ fontSize: 12 }}>{money(cat.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Fluxo semanal */}
      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Fluxo de gastos (mês)</div>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={weeklyFlow}>
            <Line type="monotone" dataKey="gasto" stroke={PALETTE.purple} strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Metas resumo */}
      {goals.length > 0 && (
        <Card c={c}>
          <div className="display" style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Meta financeira</div>
          {goals.slice(0, 1).map((g) => {
            const pct = Math.min(100, Math.round((g.guardado / g.alvo) * 100));
            return (
              <div key={g.id}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                  <span>{g.nome}</span><span className="num">{pct}%</span>
                </div>
                <div style={{ height: 8, borderRadius: 99, background: c.surface2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${PALETTE.purple}, ${PALETTE.green})` }} />
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* Últimas movimentações */}
      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Últimas movimentações</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {movs.map((m) => (
            <div key={`${m.tipo}-${m.id}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{m.tipo === "entrada" ? "💰" : (CATEGORY_ICONS[m.categoria] || "📦")}</span>
                <div>
                  <div>{m.categoria}</div>
                  <div style={{ fontSize: 11, color: c.muted }}>{m.data}</div>
                </div>
              </div>
              <span className="num" style={{ color: m.tipo === "entrada" ? PALETTE.green : "#F87171" }}>
                {m.tipo === "entrada" ? "+" : "-"}{money(m.valor)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---------- Entradas ----------
function ListaEntradas({ c, incomes, onAdd, onRemove, dark }) {
  const [form, setForm] = useState({ valor: "", data: "", categoria: INCOME_CATS[0], obs: "" });
  const submit = () => {
    if (!form.valor || !form.data) return;
    onAdd({ ...form, valor: parseFloat(form.valor) });
    setForm({ valor: "", data: "", categoria: INCOME_CATS[0], obs: "" });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 12, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
          <PlusCircle size={16} color={PALETTE.green} /> Nova entrada
        </div>
        <Form c={c} dark={dark} form={form} setForm={setForm} categories={INCOME_CATS} showPayment={false} onSubmit={submit} accent={PALETTE.green} />
      </Card>
      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Entradas registradas</div>
        <RowList items={incomes} c={c} onRemove={onRemove} sign="+" color={PALETTE.green} icon="💰" />
      </Card>
    </div>
  );
}

// ---------- Saídas ----------
function ListaSaidas({ c, expenses, onAdd, onRemove, dark }) {
  const [form, setForm] = useState({ valor: "", data: "", categoria: EXPENSE_CATS[0], forma: PAYMENT_METHODS[0], obs: "" });
  const submit = () => {
    if (!form.valor || !form.data) return;
    onAdd({ ...form, valor: parseFloat(form.valor) });
    setForm({ valor: "", data: "", categoria: EXPENSE_CATS[0], forma: PAYMENT_METHODS[0], obs: "" });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 12, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
          <MinusCircle size={16} color={"#F87171"} /> Nova saída
        </div>
        <Form c={c} dark={dark} form={form} setForm={setForm} categories={EXPENSE_CATS} showPayment onSubmit={submit} accent={PALETTE.purple} />
      </Card>
      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Saídas registradas</div>
        <RowList items={expenses} c={c} onRemove={onRemove} sign="-" color="#F87171" iconMap={CATEGORY_ICONS} />
      </Card>
    </div>
  );
}

function Form({ c, dark, form, setForm, categories, showPayment, onSubmit, accent }) {
  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 12, border: `1px solid ${c.surface2}`, background: c.surface2, color: c.text, fontSize: 13, outline: "none" };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input style={inputStyle} type="number" placeholder="Valor (R$)" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
      <input style={inputStyle} type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
      <select style={inputStyle} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
        {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      {showPayment && (
        <select style={inputStyle} value={form.forma} onChange={(e) => setForm({ ...form, forma: e.target.value })}>
          {PAYMENT_METHODS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      )}
      <input style={inputStyle} placeholder="Observação (opcional)" value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
      <button onClick={onSubmit} style={{ background: accent, border: "none", borderRadius: 12, padding: "11px", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginTop: 4 }}>
        Registrar
      </button>
    </div>
  );
}

function RowList({ items, c, onRemove, sign, color, icon, iconMap }) {
  if (items.length === 0) return <div style={{ color: c.muted, fontSize: 13 }}>Nada registrado ainda.</div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((it) => (
        <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, borderBottom: `1px solid ${c.surface2}`, paddingBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16 }}>{iconMap ? (iconMap[it.categoria] || "📦") : icon}</span>
            <div>
              <div>{it.categoria}{it.forma ? ` · ${it.forma}` : ""}</div>
              <div style={{ fontSize: 11, color: c.muted }}>{it.data}{it.obs ? ` · ${it.obs}` : ""}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="num" style={{ color }}>{sign}{money(it.valor)}</span>
            <button onClick={() => onRemove(it.id)} style={{ background: "none", border: "none", cursor: "pointer", color: c.muted }}><Trash2 size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- Metas ----------
function Metas({ c, goals, onAdd, onBump, dark }) {
  const [form, setForm] = useState({ nome: "", tipo: "Reserva de emergência", alvo: "", guardado: "" });
  const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 12, border: `1px solid ${c.surface2}`, background: c.surface2, color: c.text, fontSize: 13, outline: "none" };
  const submit = () => {
    if (!form.nome || !form.alvo) return;
    onAdd({ nome: form.nome, tipo: form.tipo, alvo: parseFloat(form.alvo), guardado: parseFloat(form.guardado || 0) });
    setForm({ nome: "", tipo: "Reserva de emergência", alvo: "", guardado: "" });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {goals.map((g) => {
        const pct = Math.min(100, Math.round((g.guardado / g.alvo) * 100));
        const Icon = GOAL_ICONS[g.tipo] || Target;
        const restante = Math.max(0, g.alvo - g.guardado);
        const mesesEst = restante > 0 ? Math.max(1, Math.ceil(restante / 500)) : 0;
        return (
          <Card c={c} key={g.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: `${PALETTE.purple}22`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} color={PALETTE.purple} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{g.nome}</div>
                <div style={{ fontSize: 11, color: c.muted }}>{money(g.guardado)} de {money(g.alvo)}</div>
              </div>
            </div>
            <div style={{ height: 8, borderRadius: 99, background: c.surface2, overflow: "hidden", marginBottom: 8 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${PALETTE.purple}, ${PALETTE.green})` }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: c.muted, marginBottom: 10 }}>
              <span>{pct}% concluído</span>
              <span>{mesesEst > 0 ? `~${mesesEst} meses para concluir` : "Meta concluída 🎉"}</span>
            </div>
            <button onClick={() => onBump(g.id, 100)} style={{ background: c.surface2, border: "none", borderRadius: 10, padding: "8px 12px", fontSize: 12, color: c.text, cursor: "pointer" }}>
              + Guardar R$100
            </button>
          </Card>
        );
      })}

      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>Nova meta</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input style={inputStyle} placeholder="Nome da meta" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          <select style={inputStyle} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>
            {Object.keys(GOAL_ICONS).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input style={inputStyle} type="number" placeholder="Valor da meta (R$)" value={form.alvo} onChange={(e) => setForm({ ...form, alvo: e.target.value })} />
          <input style={inputStyle} type="number" placeholder="Já guardado (R$, opcional)" value={form.guardado} onChange={(e) => setForm({ ...form, guardado: e.target.value })} />
          <button onClick={submit} style={{ background: PALETTE.purple, border: "none", borderRadius: 12, padding: "11px", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Criar meta
          </button>
        </div>
      </Card>
    </div>
  );
}

// ---------- Relatórios ----------
function Relatorios({ c, byCategory, pieColors, monthCompare, totalIncome, totalExpense, dark }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Entradas vs. Saídas</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={[{ name: "Mês atual", Entradas: totalIncome, Saídas: totalExpense }]}>
            <XAxis dataKey="name" tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: c.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => money(v)} contentStyle={{ background: c.surface, border: "none", borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="Entradas" fill={PALETTE.green} radius={[6, 6, 0, 0]} />
            <Bar dataKey="Saídas" fill={PALETTE.purple} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Comparativo mensal de gastos</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={monthCompare}>
            <CartesianGrid strokeDasharray="3 3" stroke={c.surface2} vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: c.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: c.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => money(v)} contentStyle={{ background: c.surface, border: "none", borderRadius: 10, fontSize: 12 }} />
            <Bar dataKey="gasto" fill={PALETTE.purple} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card c={c}>
        <div className="display" style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>Distribuição por categoria</div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={80} label={(d) => d.name}>
              {byCategory.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => money(v)} contentStyle={{ background: c.surface, border: "none", borderRadius: 10, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ fontSize: 11, color: c.muted, textAlign: "center", padding: "0 8px" }}>
        Exportação em PDF/Excel, WhatsApp e login social exigem um backend real — veja a explicação abaixo do app.
      </div>
    </div>
  );
}

// ---------- Assistente IA (mesmo motor que rodaria no WhatsApp) ----------

function AssistenteIA({ c, dark, balance, addIncome, addExpense }) {
  const [messages, setMessages] = useState([
    { from: "bot", text: "Oi! Sou o Agente Financeiro. Me conta seus gastos e ganhos como se estivesse me mandando um WhatsApp — eu registro tudo pra você. Ex: \"gastei 35 no mercado\" ou \"recebi 500 de pix\"." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const texto = input.trim();
    if (!texto || loading) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text: texto }]);
    setLoading(true);

    try {
      // Chama o backend (server.js), que interpreta a mensagem com IA no servidor
      // (a chave da Anthropic nunca fica exposta no navegador) e já registra a
      // transação no banco. Ver BACKEND_URL/USER_ID nas notas da aba Assinatura.
      const resp = await fetch(`${BACKEND_URL}/api/assistente`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, texto }),
      });
      const data = await resp.json();

      if (data.transacao?.tipo === "saida") {
        addExpense({ valor: data.transacao.valor, data: new Date().toISOString().slice(0, 10), categoria: data.transacao.categoria || "Outros", forma: "Pix", obs: data.transacao.descricao || "" });
      } else if (data.transacao?.tipo === "entrada") {
        addIncome({ valor: data.transacao.valor, data: new Date().toISOString().slice(0, 10), categoria: data.transacao.categoria || "Outros ganhos", obs: data.transacao.descricao || "" });
      }
      setMessages((m) => [...m, { from: "bot", text: data.resposta || "Não consegui processar agora." }]);
    } catch (err) {
      setMessages((m) => [...m, { from: "bot", text: "Não consegui falar com o servidor agora. Verifique se o backend está no ar e se BACKEND_URL está configurado corretamente." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 220px)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 999, background: `linear-gradient(135deg, ${PALETTE.purple}, ${PALETTE.green})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Bot size={16} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Assistente do Agente Financeiro</div>
          <div style={{ fontSize: 11, color: c.muted }}>Mesma IA que rodaria via WhatsApp</div>
        </div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 10, padding: "4px 2px" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "78%", padding: "10px 13px", borderRadius: 16,
              borderBottomRightRadius: m.from === "user" ? 4 : 16,
              borderBottomLeftRadius: m.from === "bot" ? 4 : 16,
              background: m.from === "user" ? PALETTE.purple : c.surface2,
              color: m.from === "user" ? "#fff" : c.text,
              fontSize: 13, lineHeight: 1.5, whiteSpace: "pre-wrap",
            }}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 13px", borderRadius: 16, background: c.surface2, color: c.muted, fontSize: 13 }}>digitando…</div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, paddingTop: 10 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ex: gastei 40 no uber"
          style={{ flex: 1, padding: "12px 14px", borderRadius: 999, border: `1px solid ${c.surface2}`, background: c.surface2, color: c.text, fontSize: 13, outline: "none" }}
        />
        <button onClick={send} disabled={loading} style={{ width: 44, height: 44, borderRadius: 999, border: "none", background: PALETTE.purple, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
          <Send size={17} />
        </button>
      </div>
    </div>
  );
}

// ---------- Paywall (bloqueio de recurso premium) ----------
function Paywall({ c, onIrParaAssinatura }) {
  return (
    <Card c={c} style={{ textAlign: "center", padding: 32, marginTop: 40 }}>
      <div style={{ width: 52, height: 52, borderRadius: 16, background: `${PALETTE.purple}22`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
        <Lock size={22} color={PALETTE.purple} />
      </div>
      <div className="display" style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Recurso Premium</div>
      <div style={{ fontSize: 13, color: c.muted, marginBottom: 18, lineHeight: 1.5 }}>
        O Assistente com IA é exclusivo do plano Premium. Assine para registrar gastos por texto ou voz.
      </div>
      <button onClick={onIrParaAssinatura} style={{ background: `linear-gradient(135deg, ${PALETTE.purple}, ${PALETTE.green})`, border: "none", borderRadius: 12, padding: "12px 20px", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
        Ver planos
      </button>
    </Card>
  );
}

// ---------- Assinatura ----------
const PLANOS = [
  {
    id: "gratuito",
    nome: "Gratuito",
    preco: "R$0",
    periodo: "para sempre",
    recursos: ["Cadastro de entradas e saídas", "Dashboard e gráficos básicos", "1 meta financeira"],
  },
  {
    id: "premium",
    nome: "Premium",
    preco: "R$19,90",
    periodo: "/mês",
    recursos: [
      "Tudo do plano Gratuito",
      "Assistente com IA (texto e áudio)",
      "Integração com WhatsApp",
      "Metas ilimitadas",
      "Relatórios avançados + exportação PDF/Excel",
      "Alertas inteligentes de gastos",
    ],
  },
];

function Assinatura({ c, dark, plano, setPlano }) {
  const [processando, setProcessando] = useState(false);

  const assinar = async (id) => {
    if (id === plano) return;
    if (id === "gratuito") { setPlano("gratuito"); return; }

    setProcessando(true);
    try {
      const resp = await fetch(`${BACKEND_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID }),
      });
      const data = await resp.json();
      if (data.url) {
        // Leva o usuário pro Stripe Checkout — lá ele escolhe Pix, cartão ou boleto.
        // Quando o pagamento é confirmado, o webhook do backend marca o plano como
        // "premium" e o usuário volta pro app já liberado.
        window.location.href = data.url;
      } else {
        throw new Error("Checkout não retornou uma URL");
      }
    } catch (err) {
      // Sem backend publicado ainda: cai numa simulação local só pra visualizar o fluxo.
      setTimeout(() => { setPlano("premium"); setProcessando(false); }, 900);
      return;
    }
    setProcessando(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ textAlign: "center", padding: "8px 8px 4px" }}>
        <div className="display" style={{ fontWeight: 700, fontSize: 18 }}>Escolha seu plano</div>
        <div style={{ fontSize: 12.5, color: c.muted, marginTop: 4 }}>Desbloqueie o assistente com IA e recursos avançados</div>
      </div>

      {PLANOS.map((p) => {
        const ativo = plano === p.id;
        const premium = p.id === "premium";
        return (
          <Card key={p.id} c={c} style={{
            border: ativo ? `1.5px solid ${PALETTE.purple}` : `1px solid ${c.surface2}`,
            position: "relative", overflow: "hidden",
            background: premium ? `linear-gradient(160deg, ${c.surface}, ${PALETTE.purpleDeep}22)` : c.surface,
          }}>
            {premium && (
              <div style={{ position: "absolute", top: 14, right: -30, background: PALETTE.green, color: "#0F2A20", fontSize: 10, fontWeight: 700, padding: "3px 34px", transform: "rotate(35deg)" }}>
                POPULAR
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              {premium && <Crown size={16} color={PALETTE.purple} />}
              <div className="display" style={{ fontWeight: 700, fontSize: 15 }}>{p.nome}</div>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "6px 0 14px" }}>
              <span className="num" style={{ fontSize: 26 }}>{p.preco}</span>
              <span style={{ fontSize: 12, color: c.muted }}>{p.periodo}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {p.recursos.map((r) => (
                <div key={r} style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5 }}>
                  <Check size={14} color={PALETTE.green} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: c.text }}>{r}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => assinar(p.id)}
              disabled={ativo || processando}
              style={{
                width: "100%", padding: "12px", borderRadius: 12, border: "none", fontSize: 13, fontWeight: 600, cursor: ativo ? "default" : "pointer",
                background: ativo ? c.surface2 : (premium ? `linear-gradient(135deg, ${PALETTE.purple}, ${PALETTE.green})` : c.surface2),
                color: ativo ? c.muted : (premium ? "#fff" : c.text),
              }}
            >
              {ativo ? "Plano atual" : processando ? "Processando…" : premium ? "Assinar Premium" : "Voltar para o gratuito"}
            </button>
          </Card>
        );
      })}

      <div style={{ fontSize: 11, color: c.muted, textAlign: "center", padding: "0 12px", lineHeight: 1.5 }}>
        O botão chama o endpoint /api/checkout do seu backend (Stripe) e abre o pagamento por Pix, cartão ou boleto. Sem um backend publicado ainda, ele cai numa simulação local só para visualização.
      </div>
    </div>
  );
}
