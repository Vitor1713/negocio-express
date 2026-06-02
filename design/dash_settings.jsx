// ============================================================================
// SEÇÕES — ENTREGADORES, EQUIPE e CONFIGURAÇÕES DA LOJA
//   Deliverer: name, phone, vehicleType, isActive
//   TeamMember: userName, userEmail, role
//   Store (PUT /store): name, email, phone, category  (slug/cnpj read-only)
// ============================================================================

// ----------------------------------------------------------------------------
// ENTREGADORES
// ----------------------------------------------------------------------------
function DeliverersSection() {
  const D = window.DASH;
  const { VEHICLE_TYPE } = D;
  const [list, setList] = React.useState(D.DELIVERERS);
  const [editing, setEditing] = React.useState(null);

  const phoneFmt = (raw) => {
    const d = raw.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  };
  const newD = () => setEditing({ id: null, name: "", phone: "", vehicleType: "motorcycle", isActive: true });
  const save = (x) => { if (x.id) setList((p) => p.map((y) => (y.id === x.id ? x : y))); else setList((p) => [...p, { ...x, id: "d" + Date.now() }]); setEditing(null); };
  const del = (id) => { setList((p) => p.filter((y) => y.id !== id)); setEditing(null); };
  const toggle = (id) => setList((p) => p.map((y) => (y.id === id ? { ...y, isActive: !y.isActive } : y)));

  return (
    <React.Fragment>
      <PageHead title="Entregadores" subtitle={`${list.filter((d) => d.isActive).length} ativos de ${list.length}`}>
        <Button icon="Plus" onClick={newD}>Novo entregador</Button>
      </PageHead>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((d) => {
          const vt = VEHICLE_TYPE[d.vehicleType];
          return (
            <Card key={d.id} className="p-4 flex items-center gap-3" hoverable>
              <Avatar name={d.name} size="lg" tone="brand" />
              <div className="flex-1 min-w-0">
                <div className="font-display font-semibold text-[15px] text-ink-900 truncate">{d.name}</div>
                <div className="text-[12.5px] text-ink-500 truncate">{d.phone}</div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Badge tone="neutral" size="sm"><Icon name={vt.icon} size={11} /> {vt.label}</Badge>
                  {d.isActive ? <Badge tone="success" size="sm" dot>Ativo</Badge> : <Badge tone="neutral" size="sm">Inativo</Badge>}
                </div>
              </div>
              <KebabMenu items={[
                { label: "Editar", icon: "Pencil", onClick: () => setEditing(d) },
                { label: d.isActive ? "Desativar" : "Ativar", icon: d.isActive ? "EyeOff" : "Eye", onClick: () => toggle(d.id) },
                { label: "Excluir", icon: "Trash2", danger: true, onClick: () => del(d.id) },
              ]} />
            </Card>
          );
        })}
      </div>

      <DashDrawer open={!!editing} onClose={() => setEditing(null)} icon="Bike"
        title={editing && editing.id ? "Editar entregador" : "Novo entregador"}
        footer={editing && (
          <div className="flex gap-2">
            {editing.id && <Button variant="danger" icon="Trash2" onClick={() => del(editing.id)}>Excluir</Button>}
            <Button fullWidth icon="Check" onClick={() => save(editing)}>Salvar</Button>
          </div>
        )}>
        {editing && (
          <div className="p-5 space-y-4">
            <Field label="Nome completo" required><TextInput value={editing.name} onChange={(v) => setEditing((e) => ({ ...e, name: v }))} placeholder="Ex: Marcos Souza" /></Field>
            <Field label="Telefone" required><TextInput value={editing.phone} onChange={(v) => setEditing((e) => ({ ...e, phone: phoneFmt(v) }))} placeholder="(11) 99999-9999" /></Field>
            <Field label="Veículo">
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(VEHICLE_TYPE).map(([key, t]) => (
                  <button key={key} onClick={() => setEditing((e) => ({ ...e, vehicleType: key }))}
                    className={`py-2.5 rounded-lg border text-sm font-medium transition-all inline-flex items-center justify-center gap-1.5 ${editing.vehicleType === key ? "border-brand-600 bg-brand-50 text-brand-800 ring-2 ring-brand-100" : "border-ink-200 text-ink-700 hover:bg-ink-50"}`}>
                    <Icon name={t.icon} size={15} /> {t.label}
                  </button>
                ))}
              </div>
            </Field>
            <div className="flex items-center justify-between p-3 rounded-lg border border-ink-200 bg-ink-50/40">
              <div className="text-sm font-medium text-ink-900">Disponível para entregas</div>
              <Toggle checked={editing.isActive} onChange={(v) => setEditing((e) => ({ ...e, isActive: v }))} />
            </div>
          </div>
        )}
      </DashDrawer>
    </React.Fragment>
  );
}

// ----------------------------------------------------------------------------
// EQUIPE
// ----------------------------------------------------------------------------
function TeamSection() {
  const D = window.DASH;
  const { TEAM_ROLES, fmtDate } = D;
  const [team, setTeam] = React.useState(D.TEAM);
  const [inviting, setInviting] = React.useState(null);

  const invite = () => setInviting({ userEmail: "", role: "staff" });
  const save = (m) => {
    setTeam((p) => [...p, { id: "t" + Date.now(), userId: "u" + Date.now(), userName: m.userEmail.split("@")[0], userEmail: m.userEmail, role: m.role, createdAt: new Date().toISOString() }]);
    setInviting(null);
  };
  const remove = (id) => setTeam((p) => p.filter((m) => m.id !== id));

  return (
    <React.Fragment>
      <PageHead title="Equipe" subtitle={`${team.length} membros`}>
        <Button icon="UserPlus" onClick={invite}>Convidar membro</Button>
      </PageHead>

      <Card className="overflow-hidden">
        <div className="divide-y divide-ink-100">
          {team.map((m) => {
            const role = TEAM_ROLES[m.role] || TEAM_ROLES.staff;
            return (
              <div key={m.id} className="flex items-center gap-3 px-4 sm:px-5 py-4 hover:bg-ink-50 transition-colors">
                <Avatar name={m.userName} size="md" tone={m.role === "owner" ? "brand" : "blue"} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-ink-900 truncate capitalize">{m.userName}</div>
                  <div className="text-[12.5px] text-ink-500 truncate">{m.userEmail}</div>
                </div>
                <div className="hidden sm:block text-xs text-ink-400">desde {fmtDate(m.createdAt)}</div>
                <Badge tone={role.tone} size="sm">{role.label}</Badge>
                {m.role !== "owner" && (
                  <KebabMenu items={[{ label: "Remover", icon: "Trash2", danger: true, onClick: () => remove(m.id) }]} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <DashDrawer open={!!inviting} onClose={() => setInviting(null)} icon="UserPlus" title="Convidar membro"
        footer={inviting && <Button fullWidth icon="Send" onClick={() => save(inviting)}>Enviar convite</Button>}>
        {inviting && (
          <div className="p-5 space-y-4">
            <Field label="E-mail" required hint="O convite será enviado para este e-mail.">
              <TextInput type="email" value={inviting.userEmail} onChange={(v) => setInviting((e) => ({ ...e, userEmail: v }))} placeholder="pessoa@email.com" />
            </Field>
            <Field label="Função">
              <div className="space-y-2">
                {Object.entries(TEAM_ROLES).filter(([k]) => k !== "owner").map(([key, r]) => (
                  <button key={key} onClick={() => setInviting((e) => ({ ...e, role: key }))}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all ${inviting.role === key ? "border-brand-600 bg-brand-50 ring-2 ring-brand-100" : "border-ink-200 hover:bg-ink-50"}`}>
                    <span className="font-medium text-ink-900">{r.label}</span>
                    {inviting.role === key && <Icon name="Check" size={16} className="text-brand-600" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}
      </DashDrawer>
    </React.Fragment>
  );
}

// ----------------------------------------------------------------------------
// CONFIGURAÇÕES DA LOJA
// ----------------------------------------------------------------------------
function SettingsSection({ onNavigate }) {
  const D = window.DASH;
  const { STORE, STORE_STATUS, fmtDate } = D;
  const [form, setForm] = React.useState(STORE);
  const [saved, setSaved] = React.useState(false);
  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setSaved(false); };
  const status = STORE_STATUS[form.status] || STORE_STATUS.active;

  const CATS = [
    { key: "restaurante", label: "Restaurante" }, { key: "padaria", label: "Padaria" },
    { key: "salao", label: "Salão / Beleza" }, { key: "moda", label: "Moda & Roupas" },
    { key: "petshop", label: "Pet Shop" }, { key: "farmacia", label: "Farmácia" },
    { key: "mercado", label: "Mercado" }, { key: "outros", label: "Outros" },
  ];

  return (
    <React.Fragment>
      <PageHead title="Configurações da loja" subtitle="Dados públicos e de contato" />

      <div className="max-w-2xl space-y-4">
        {/* Identidade */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
            <span className="h-12 w-12 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center shadow-soft">
              <Icon name="Wheat" size={22} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-ink-900">{form.name}</div>
              <div className="text-xs text-ink-500 font-mono">negocioexpress.com.br/{form.slug}</div>
            </div>
            <Badge tone={status.tone} dot>{status.label}</Badge>
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Nome da loja" required><TextInput value={form.name} onChange={(v) => set("name", v)} /></Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Endereço (slug)" hint="Não pode ser alterado."><TextInput value={form.slug} disabled prefix="/" /></Field>
              <Field label="CNPJ" hint="Não pode ser alterado."><TextInput value={form.cnpj} disabled /></Field>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="E-mail de contato" required><TextInput type="email" value={form.email} onChange={(v) => set("email", v)} /></Field>
              <Field label="Telefone" required><TextInput value={form.phone} onChange={(v) => set("phone", v)} /></Field>
            </div>
            <Field label="Segmento">
              <select value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full bg-white border border-ink-200 rounded-lg px-3 py-2.5 text-sm text-ink-900 focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100">
                {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="mt-5 pt-4 border-t border-ink-100 flex items-center justify-between">
            <span className={`text-sm inline-flex items-center gap-1.5 transition-opacity ${saved ? "text-brand-700 opacity-100" : "opacity-0"}`}>
              <Icon name="CheckCircle2" size={15} /> Alterações salvas
            </span>
            <Button icon="Check" onClick={() => setSaved(true)}>Salvar alterações</Button>
          </div>
        </Card>

        {/* Meta */}
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-500">Loja criada em</span>
            <span className="text-ink-900 font-medium">{fmtDate(form.createdAt)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-ink-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-ink-900">Ver loja pública</div>
              <div className="text-xs text-ink-500">Veja como os clientes enxergam sua vitrine.</div>
            </div>
            <Button variant="outline" icon="ExternalLink" onClick={() => onNavigate("STORE")}>Abrir</Button>
          </div>
        </Card>
      </div>
    </React.Fragment>
  );
}

Object.assign(window, { DeliverersSection, TeamSection, SettingsSection });
