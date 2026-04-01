import { useState, useMemo } from "react";

// ─── Mock Data ───────────────────────────────────────────────
const mockPedidos = [
  { id: 42, cliente: "Assoc. Atlética Paulista", valor: 3200, fechamento: "2026-03-12", entregue: true,  pago: true  },
  { id: 43, cliente: "Escola Mun. Santos Dumont", valor: 5600, fechamento: "2026-03-18", entregue: true,  pago: false },
  { id: 44, cliente: "Time FC Esperança",         valor: 2800, fechamento: "2026-03-22", entregue: false, pago: false },
  { id: 45, cliente: "Academia FitLife",           valor: 3200, fechamento: "2026-03-27", entregue: false, pago: false },
  { id: 46, cliente: "Clube Náutico Araraquara",   valor: 4100, fechamento: "2026-04-05", entregue: false, pago: false },
];
const mockCompras = [
  { descricao: "Malha Dry — 50kg",    fornecedor: "TextilBR", valor: 1800, data: "2026-03-04" },
  { descricao: "Malha PV — 30kg",     fornecedor: "TextilBR", valor: 1200, data: "2026-03-04" },
  { descricao: "Tactel Hidro — 20kg", fornecedor: "FioTex",   valor: 1640, data: "2026-03-14" },
  { descricao: "Linhas e aviamentos", fornecedor: null,        valor: 700,  data: "2026-03-20" },
];
const mockSalarios = [
  { nome: "Ana Paula Rodrigues", valor: 2200 },
  { nome: "Fernanda Oliveira",   valor: 2000 },
  { nome: "Camila Souza",        valor: 2000 },
];

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (iso) => iso.split("-").reverse().join("/");
const today = () => new Date().toISOString().split("T")[0];
const firstOfMonth = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`; };
const addDays = (iso, n) => { const d = new Date(iso); d.setDate(d.getDate()+n); return d.toISOString().split("T")[0]; };
const inRange = (iso, ini, fim) => iso >= ini && iso <= fim;

const PRESETS = [
  { id: "consolidado",  label: "Consolidado",  blocos: ["vendas","compras","salarios"] },
  { id: "vendas",       label: "Vendas",        blocos: ["vendas"] },
  { id: "compras",      label: "Compras",       blocos: ["compras"] },
  { id: "salarios",     label: "Salários",      blocos: ["salarios"] },
  { id: "personalizado",label: "Personalizado", blocos: null },
];

// ─── Subcomponents ───────────────────────────────────────────
function Badge({ children, color }) {
  const colors = {
    green:  { bg: "#dcfce7", text: "#166534" },
    amber:  { bg: "#fef9c3", text: "#854d0e" },
    blue:   { bg: "#dbeafe", text: "#1e40af" },
    gray:   { bg: "#f3f4f6", text: "#6b7280" },
  };
  const c = colors[color] || colors.gray;
  return <span style={{ background: c.bg, color: c.text, borderRadius: 5, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{children}</span>;
}

function Pill({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 13px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
      border: active ? "none" : "1px solid #e5e7eb",
      background: active ? "#1e3a5f" : "#f9fafb",
      color: active ? "#fff" : "#6b7280",
      transition: "all 0.15s",
    }}>{children}</button>
  );
}

function CheckTag({ checked, onChange, color, children }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 13, padding: "4px 10px", borderRadius: 8, border: `1px solid ${checked ? color : "#e5e7eb"}`, background: checked ? color+"15" : "#fff", fontWeight: checked ? 600 : 400, color: checked ? color : "#6b7280", transition: "all 0.15s" }}>
      <input type="checkbox" checked={checked} onChange={onChange} style={{ display: "none" }} />
      {checked ? "✓ " : ""}{children}
    </label>
  );
}

function SectionCard({ dot, title, badge, total, children }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}>
        {dot && <span style={{ width: 10, height: 10, borderRadius: "50%", background: dot, flexShrink: 0 }} />}
        <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>{title}</span>
        {badge}
      </div>
      {total !== undefined && <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: "6px 0 14px" }}>{fmt(total)}</div>}
      {children}
    </div>
  );
}

function Table({ cols, rows }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead>
        <tr>{cols.map(c => <th key={c} style={{ textAlign: "left", padding: "5px 8px", color: "#9ca3af", fontWeight: 600, fontSize: 11, textTransform: "uppercase", borderBottom: "1px solid #f3f4f6" }}>{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>{r.map((cell, j) => <td key={j} style={{ padding: "8px 8px", borderBottom: "1px solid #f9fafb", color: "#374151" }}>{cell}</td>)}</tr>
        ))}
        {rows.length === 0 && <tr><td colSpan={cols.length} style={{ textAlign: "center", padding: 20, color: "#9ca3af" }}>Nenhum registro no período</td></tr>}
      </tbody>
    </table>
  );
}

// ─── Bloco Vendas ─────────────────────────────────────────────
function CardVendas({ ini, fim, subcats }) {
  const filtrados = mockPedidos.filter(p => inRange(p.fechamento, ini, fim));
  const aReceber = filtrados.filter(p => !p.pago);
  const entregues = filtrados.filter(p => p.entregue);
  const recebidos = filtrados.filter(p => p.pago);

  const grupos = [
    subcats.aReceber  && { label: "A Receber",  cor: "#f59e0b", lista: aReceber  },
    subcats.entregues && { label: "Entregues",  cor: "#3b82f6", lista: entregues },
    subcats.recebidos && { label: "Recebidos",  cor: "#22c55e", lista: recebidos },
  ].filter(Boolean);

  const total = grupos.reduce((s, g) => s + g.lista.reduce((a, p) => a + p.valor, 0), 0);

  const statusBadge = (p) => {
    if (p.pago)     return <Badge color="green">Recebido</Badge>;
    if (p.entregue) return <Badge color="blue">Entregue</Badge>;
    return <Badge color="amber">A Receber</Badge>;
  };

  return (
    <SectionCard dot="#22c55e" title="Vendas" badge={<Badge color="gray">{filtrados.length} pedidos</Badge>} total={total}>
      {grupos.map(g => (
        <div key={g.label} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: g.cor }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: g.cor, textTransform: "uppercase", letterSpacing: "0.05em" }}>{g.label}</span>
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 2 }}>— {fmt(g.lista.reduce((a, p) => a + p.valor, 0))}</span>
          </div>
          <Table
            cols={["Pedido","Cliente","Fechamento","Status","Valor"]}
            rows={g.lista.map(p => [
              `#${p.id}`, p.cliente, fmtDate(p.fechamento), statusBadge(p),
              <span style={{ fontWeight: 700, color: p.pago ? "#166534" : "#92400e" }}>{fmt(p.valor)}</span>
            ])}
          />
        </div>
      ))}
    </SectionCard>
  );
}

// ─── Bloco Compras ────────────────────────────────────────────
function CardCompras({ ini, fim }) {
  const lista = mockCompras.filter(c => inRange(c.data, ini, fim));
  const total = lista.reduce((s, c) => s + c.valor, 0);
  return (
    <SectionCard dot="#f59e0b" title="Compras de Materiais" badge={<Badge color="gray">{lista.length} registros</Badge>} total={total}>
      <Table
        cols={["Descrição","Fornecedor","Data","Valor"]}
        rows={lista.map(c => [c.descricao, c.fornecedor ?? <span style={{ color: "#d1d5db" }}>—</span>, fmtDate(c.data), <span style={{ fontWeight: 700, color: "#92400e" }}>{fmt(c.valor)}</span>])}
      />
    </SectionCard>
  );
}

// ─── Bloco Salários ───────────────────────────────────────────
function CardSalarios() {
  const total = mockSalarios.reduce((s, f) => s + f.valor, 0);
  return (
    <SectionCard dot="#818cf8" title="Salários" badge={<Badge color="gray">{mockSalarios.length} funcionárias</Badge>} total={total}>
      <Table
        cols={["Funcionária","Valor"]}
        rows={mockSalarios.map(f => [f.nome, <span style={{ fontWeight: 700, color: "#3730a3" }}>{fmt(f.valor)}</span>])}
      />
    </SectionCard>
  );
}

// ─── Consolidado ──────────────────────────────────────────────
function ResumoConsolidado({ blocos, ini, fim }) {
  const vendas = blocos.includes("vendas")
    ? mockPedidos.filter(p => inRange(p.fechamento, ini, fim) && p.pago).reduce((s, p) => s + p.valor, 0)
    : 0;
  const aReceber = blocos.includes("vendas")
    ? mockPedidos.filter(p => inRange(p.fechamento, ini, fim) && !p.pago).reduce((s, p) => s + p.valor, 0)
    : 0;
  const compras = blocos.includes("compras") ? mockCompras.filter(c => inRange(c.data, ini, fim)).reduce((s, c) => s + c.valor, 0) : 0;
  const salarios = blocos.includes("salarios") ? mockSalarios.reduce((s, f) => s + f.valor, 0) : 0;
  const real = vendas - compras - salarios;
  const previsto = vendas + aReceber - compras - salarios;
  const cor = real > 0 ? "#15803d" : real < 0 ? "#b91c1c" : "#6b7280";

  return (
    <div style={{ background: real >= 0 ? "#f0fdf4" : "#fef2f2", border: `1px solid ${cor}30`, borderRadius: 12, padding: "20px 22px" }}>
      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 14, color: "#111827" }}>Resumo Consolidado</div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 14 }}>
        {blocos.includes("vendas")   && <Parcela label="Vendas recebidas" val={vendas}   cor="#22c55e" sinal="+" />}
        {blocos.includes("vendas") && aReceber > 0 && <Parcela label="A receber (previsto)" val={aReceber} cor="#f59e0b" sinal="+" />}
        {blocos.includes("compras")  && <Parcela label="Compras"           val={compras}  cor="#f59e0b" sinal="−" />}
        {blocos.includes("salarios") && <Parcela label="Salários"          val={salarios} cor="#818cf8" sinal="−" />}
      </div>
      <div style={{ borderTop: "1px dashed #e5e7eb", paddingTop: 14, display: "flex", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>Resultado Real</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: cor }}>{fmt(real)}</div>
        </div>
        {aReceber > 0 && blocos.includes("vendas") && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", marginBottom: 2 }}>Previsto (incl. A Receber)</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: previsto > 0 ? "#1d4ed8" : "#b91c1c" }}>{fmt(previsto)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Parcela({ label, val, cor, sinal }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600, textTransform: "uppercase" }}>{sinal} {label}</span>
      <span style={{ fontSize: 15, fontWeight: 700, color: cor }}>{fmt(val)}</span>
    </div>
  );
}

// ─── Print Header (shown only when printing) ─────────────────
function PrintHeader({ ini, fim }) {
  return (
    <div className="print-header" style={{ display: "none" }}>
      <style>{`
        @media print {
          .print-header { display: block !important; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid #111; }
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <div style={{ fontSize: 18, fontWeight: 700 }}>FCamargo Confecção e Estamparia</div>
      <div style={{ fontSize: 13, color: "#374151", marginTop: 4 }}>
        Relatório Financeiro — {fmtDate(ini)} a {fmtDate(fim)}
      </div>
      <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
        Gerado em: {new Date().toLocaleString("pt-BR")}
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────
export default function Relatorios() {
  const [ini, setIni] = useState(firstOfMonth());
  const [fim, setFim] = useState(today());
  const [preset, setPreset] = useState("consolidado");
  const [customBlocos, setCustomBlocos] = useState({ vendas: true, compras: true, salarios: false });
  const [subcats, setSubcats] = useState({ aReceber: true, entregues: true, recebidos: true });

  const blocosAtivos = useMemo(() => {
    if (preset !== "personalizado") return PRESETS.find(p => p.id === preset).blocos;
    return Object.entries(customBlocos).filter(([,v]) => v).map(([k]) => k);
  }, [preset, customBlocos]);

  const setAtalho = (tipo) => {
    const t = today();
    if (tipo === "semana")    { setIni(addDays(t, -6)); setFim(t); }
    if (tipo === "mes")       { setIni(firstOfMonth()); setFim(t); }
    if (tipo === "mesAnterior") {
      const d = new Date(); d.setMonth(d.getMonth()-1);
      const y = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,"0");
      const last = new Date(y, d.getMonth()+1, 0).getDate();
      setIni(`${y}-${m}-01`); setFim(`${y}-${m}-${last}`);
    }
    if (tipo === "30dias")    { setIni(addDays(t, -29)); setFim(t); }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", background: "#f8fafc", minHeight: "100vh", padding: "28px 22px", color: "#111827", maxWidth: 860, margin: "0 auto" }}>

      <PrintHeader ini={ini} fim={fim} />

      {/* Header */}
      <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Relatórios</h1>
          <p style={{ margin: "3px 0 0", fontSize: 13, color: "#6b7280" }}>Análise financeira da confecção</p>
        </div>
        <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, background: "#1e3a5f", color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          🖨 Imprimir
        </button>
      </div>

      {/* Controles */}
      <div className="no-print" style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: "16px 18px", marginBottom: 22, display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Período */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          <div>
            <div style={lbl}>Período</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="date" value={ini} onChange={e => setIni(e.target.value)} style={inputStyle} />
              <span style={{ color: "#9ca3af", fontSize: 13 }}>→</span>
              <input type="date" value={fim} onChange={e => setFim(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[["semana","Esta semana"],["mes","Este mês"],["mesAnterior","Mês anterior"],["30dias","Últimos 30 dias"]].map(([k,l]) => (
              <button key={k} onClick={() => setAtalho(k)} style={{ padding: "5px 11px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#f9fafb", fontSize: 12, cursor: "pointer", color: "#6b7280" }}>{l}</button>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div>
          <div style={lbl}>Visão</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {PRESETS.map(p => <Pill key={p.id} active={preset === p.id} onClick={() => setPreset(p.id)}>{p.label}</Pill>)}
          </div>
        </div>

        {/* Personalizado */}
        {preset === "personalizado" && (
          <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 12, display: "flex", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={lbl}>Blocos</div>
              <div style={{ display: "flex", gap: 6 }}>
                <CheckTag checked={customBlocos.vendas}   onChange={() => setCustomBlocos(p => ({...p, vendas:   !p.vendas}))}   color="#22c55e">Vendas</CheckTag>
                <CheckTag checked={customBlocos.compras}  onChange={() => setCustomBlocos(p => ({...p, compras:  !p.compras}))}  color="#f59e0b">Compras</CheckTag>
                <CheckTag checked={customBlocos.salarios} onChange={() => setCustomBlocos(p => ({...p, salarios: !p.salarios}))} color="#818cf8">Salários</CheckTag>
              </div>
            </div>
            {customBlocos.vendas && (
              <div>
                <div style={lbl}>Subcategorias de Vendas</div>
                <div style={{ display: "flex", gap: 6 }}>
                  <CheckTag checked={subcats.aReceber}  onChange={() => setSubcats(p => ({...p, aReceber:  !p.aReceber}))}  color="#f59e0b">A Receber</CheckTag>
                  <CheckTag checked={subcats.entregues} onChange={() => setSubcats(p => ({...p, entregues: !p.entregues}))} color="#3b82f6">Entregues</CheckTag>
                  <CheckTag checked={subcats.recebidos} onChange={() => setSubcats(p => ({...p, recebidos: !p.recebidos}))} color="#22c55e">Recebidos</CheckTag>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {blocosAtivos.length === 0
          ? <div style={{ textAlign: "center", color: "#9ca3af", padding: 48 }}>Selecione ao menos um bloco.</div>
          : <>
              {blocosAtivos.includes("vendas")   && <CardVendas   ini={ini} fim={fim} subcats={preset === "personalizado" ? subcats : { aReceber: true, entregues: true, recebidos: true }} />}
              {blocosAtivos.includes("compras")  && <CardCompras  ini={ini} fim={fim} />}
              {blocosAtivos.includes("salarios") && <CardSalarios />}
              {blocosAtivos.length >= 2          && <ResumoConsolidado blocos={blocosAtivos} ini={ini} fim={fim} />}
            </>
        }
      </div>
    </div>
  );
}

const lbl = { fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 };
const inputStyle = { padding: "6px 10px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, background: "#f9fafb", color: "#111827" };