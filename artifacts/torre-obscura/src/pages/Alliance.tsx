import { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useAlliance } from '../context/AllianceContext';
import { NPC, getProfissao, PROFISSOES, ProfissaoId } from '../lib/game-data';
import {
  Handshake, Copy, Check, Send, Inbox, Users, Wheat, Trees, Mountain, Zap,
  Wifi, WifiOff, Pencil, CalendarDays, Building2, UserCheck, ArrowRightLeft,
  Skull,
} from 'lucide-react';

type ResKey = 'comida' | 'madeira' | 'pedra' | 'ferro';
const RES_META: { key: ResKey; label: string; icon: any }[] = [
  { key: 'comida', label: 'Comida', icon: Wheat },
  { key: 'madeira', label: 'Madeira', icon: Trees },
  { key: 'pedra', label: 'Pedra', icon: Mountain },
  { key: 'ferro', label: 'Ferro', icon: Zap },
];

const OPCOES_DIAS = [3, 7, 14] as const;

export function Alliance() {
  const { state, debitarRecursos, estornarRecursos } = useGame();
  const { perfil, aliada, caixa, online, parear, enviar, receber, emprestar, refresh } = useAlliance();

  useEffect(() => { refresh(); }, [refresh]);

  // ── Estado do pareamento ──
  const [codigo, setCodigo] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [pareando, setPareando] = useState(false);

  // ── Estado do envio de recursos ──
  const [envio, setEnvio] = useState<Record<ResKey, string>>({ comida: '', madeira: '', pedra: '', ferro: '' });
  const [enviando, setEnviando] = useState(false);

  // ── Estado do empréstimo de moradores ──
  const [npcSelecionadoId, setNpcSelecionadoId] = useState<string | null>(null);
  const [diasEmprestimo, setDiasEmprestimo] = useState<3 | 7 | 14>(7);
  const [emprestando, setEmprestando] = useState(false);

  // ── Estado do recebimento da caixa ──
  const [recebendoId, setRecebendoId] = useState<number | null>(null);

  // ── Mensagens de feedback ──
  const [msg, setMsg] = useState<{ tipo: 'erro' | 'ok'; texto: string } | null>(null);

  const restanteHoje = perfil ? Math.max(0, perfil.limiteEnvioDiario - perfil.enviadoHoje) : 0;

  // NPCs elegíveis para empréstimo (vivos, não emprestados, não em expedição)
  const elegiveisParaEmprestimo = state.npcs.filter(
    n => n.vivo && !n.emprestadoDe && !n.emExpedicao,
  );

  const copiarCodigo = async () => {
    if (!perfil) return;
    try {
      await navigator.clipboard.writeText(perfil.codigoAlianca);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch { /* clipboard indisponível */ }
  };

  const handleParear = async () => {
    if (!codigo.trim()) return;
    setPareando(true);
    setMsg(null);
    const r = await parear(codigo);
    setPareando(false);
    if (r.ok) { setCodigo(''); setMsg({ tipo: 'ok', texto: 'Aliança formada!' }); }
    else setMsg({ tipo: 'erro', texto: r.erro ?? 'Falha ao parear.' });
  };

  const envioNums = (): Record<ResKey, number> => ({
    comida: Math.max(0, Math.floor(Number(envio.comida) || 0)),
    madeira: Math.max(0, Math.floor(Number(envio.madeira) || 0)),
    pedra: Math.max(0, Math.floor(Number(envio.pedra) || 0)),
    ferro: Math.max(0, Math.floor(Number(envio.ferro) || 0)),
  });
  const totalEnvio = () => { const n = envioNums(); return n.comida + n.madeira + n.pedra + n.ferro; };
  const saldoSuficiente = () => {
    const n = envioNums();
    return (['comida', 'madeira', 'pedra', 'ferro'] as ResKey[]).every(k => state.recursos[k] >= n[k]);
  };
  const podeEnviar = !enviando && totalEnvio() > 0 && totalEnvio() <= restanteHoje && saldoSuficiente();

  const handleEnviar = async () => {
    const n = envioNums();
    if (totalEnvio() <= 0) return;
    const reservado = debitarRecursos(n);
    if (!reservado) { setMsg({ tipo: 'erro', texto: 'Recursos insuficientes no armazém.' }); return; }
    setEnviando(true);
    setMsg(null);
    const r = await enviar(n);
    if (r.ok) {
      setEnvio({ comida: '', madeira: '', pedra: '', ferro: '' });
      setMsg({ tipo: 'ok', texto: 'Recursos enviados à aliada.' });
    } else {
      estornarRecursos(n);
      setMsg({ tipo: 'erro', texto: r.erro ?? 'Falha ao enviar.' });
    }
    setEnviando(false);
  };

  const handleEmprestar = async () => {
    if (!npcSelecionadoId) return;
    setEmprestando(true);
    setMsg(null);
    const r = await emprestar(npcSelecionadoId, diasEmprestimo);
    setEmprestando(false);
    if (r.ok) {
      setNpcSelecionadoId(null);
      setMsg({ tipo: 'ok', texto: `Morador enviado por ${diasEmprestimo} dias.` });
    } else {
      setMsg({ tipo: 'erro', texto: r.erro ?? 'Falha ao enviar morador.' });
    }
  };

  const handleReceber = async (id: number) => {
    setRecebendoId(id);
    setMsg(null);
    const r = await receber(id);
    setRecebendoId(null);
    if (!r.ok) setMsg({ tipo: 'erro', texto: r.erro ?? 'Falha ao receber.' });
  };

  // Renderiza um NPC compacto para seleção de empréstimo
  const renderNpcCard = (npc: NPC) => {
    const prof = getProfissao(npc);
    const selecionado = npcSelecionadoId === npc.id;
    return (
      <div
        key={npc.id}
        onClick={() => setNpcSelecionadoId(selecionado ? null : npc.id)}
        className={`flex items-center gap-3 p-2.5 rounded-sm border cursor-pointer transition-all touch-manipulation ${
          selecionado
            ? 'border-primary bg-primary/10'
            : 'border-card-border bg-background/40 hover:border-primary/40'
        }`}
      >
        <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-cinzel font-bold text-primary shrink-0">
          {npc.nome[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-foreground text-sm leading-tight truncate">{npc.nome}</div>
          <div className="text-[9px] text-primary/80 uppercase tracking-wider">{PROFISSOES[prof].nome}</div>
        </div>
        <div className="text-[9px] text-secondary shrink-0">
          {Math.round(npc.fadiga)}% fadiga
        </div>
        {selecionado && <Check size={14} className="text-primary shrink-0" />}
      </div>
    );
  };

  // Renderiza um item da caixa de entrada baseado no tipo
  const renderCaixaItem = (item: typeof caixa[0]) => {
    const ehMorador = item.tipo === 'morador';
    const ehRetorno = item.tipo === 'retorno_morador';
    const ehRecursos = item.tipo === 'recursos';
    const npcData = item.morador as Record<string, unknown> | null | undefined;
    const npcNome = npcData?.nome as string | undefined;
    const npcProf = npcData
      ? getProfissao({
          forca: npcData.forca as number ?? 5,
          agilidade: npcData.agilidade as number ?? 5,
          inteligencia: npcData.inteligencia as number ?? 5,
          resistencia: npcData.resistencia as number ?? 5,
        })
      : 'combatente' as ProfissaoId;

    return (
      <div key={item.id} className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 rounded-sm p-3">
        <div className="text-[11px] text-secondary mb-2 flex items-center gap-1.5">
          {ehMorador && <UserCheck size={10} className="text-primary/70" />}
          {ehRetorno && <ArrowRightLeft size={10} className="text-primary/70" />}
          {ehRecursos && <Send size={10} className="text-primary/70" />}
          De <span className="text-foreground font-bold">{item.remetenteNome}</span>
        </div>

        {/* Recursos */}
        {ehRecursos && item.recursos && (
          <div className="flex gap-2 flex-wrap mb-3 text-[10px] font-bold">
            {RES_META.filter(m => (item.recursos?.[m.key] ?? 0) > 0).map(({ key, icon: Icon }) => (
              <span key={key} className="px-1.5 py-0.5 rounded-sm flex items-center gap-1 bg-background text-success border border-success/30">
                <Icon size={10} /> +{item.recursos![key]}
              </span>
            ))}
            {RES_META.every(m => (item.recursos?.[m.key] ?? 0) === 0) && (
              <span className="text-muted-foreground">Envio vazio</span>
            )}
          </div>
        )}

        {/* Morador chegando */}
        {ehMorador && npcNome && (
          <div className="mb-3 flex items-center gap-2 p-2 bg-primary/5 border border-primary/20 rounded-sm">
            <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-[10px] font-cinzel font-bold text-primary shrink-0">
              {npcNome[0]}
            </div>
            <div>
              <div className="font-bold text-foreground text-sm">{npcNome}</div>
              <div className="text-[9px] text-primary/80 uppercase">{PROFISSOES[npcProf].nome} — {item.diasEmprestimo} dias</div>
            </div>
          </div>
        )}

        {/* Retorno de morador */}
        {ehRetorno && (
          <div className={`mb-3 flex items-center gap-2 p-2 rounded-sm border ${item.morreu ? 'bg-destructive/5 border-destructive/20' : 'bg-success/5 border-success/20'}`}>
            {item.morreu
              ? <Skull size={14} className="text-destructive shrink-0" />
              : <UserCheck size={14} className="text-success shrink-0" />}
            <div>
              {npcNome && <div className="font-bold text-foreground text-sm">{npcNome}</div>}
              <div className={`text-[9px] uppercase tracking-wider ${item.morreu ? 'text-destructive' : 'text-success'}`}>
                {item.morreu ? 'Caiu em batalha' : 'Retornou em segurança'}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => handleReceber(item.id)}
          disabled={recebendoId === item.id}
          className={`w-full min-h-[44px] border text-xs tracking-[0.2em] font-cinzel font-bold rounded-sm transition-all touch-manipulation flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-40 ${
            item.morreu
              ? 'border-destructive/50 text-destructive hover:bg-destructive/10'
              : 'border-success text-success hover:bg-success hover:text-background'
          }`}
        >
          <Check size={14} /> {recebendoId === item.id ? 'RECEBENDO...' : (ehMorador ? 'ACOLHER' : 'RECEBER')}
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-8 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">ALIANÇA</h2>
          <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
        </div>
        <span className={`flex items-center gap-1 text-[10px] tracking-widest ${online ? 'text-success' : 'text-muted-foreground'}`}>
          {online ? <Wifi size={12} /> : <WifiOff size={12} />}
          {online ? 'CONECTADO' : 'OFFLINE'}
        </span>
      </header>

      {msg && (
        <div className={`text-xs rounded-sm px-3 py-2 border ${msg.tipo === 'erro'
          ? 'bg-destructive/10 text-destructive border-destructive/30'
          : 'bg-success/10 text-success border-success/30'}`}>
          {msg.texto}
        </div>
      )}

      {/* Seu código de aliança */}
      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4">SEU CÓDIGO DE ALIANÇA</h3>
        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 rounded-sm p-4">
          <p className="text-[10px] text-secondary/80 mb-3 leading-relaxed">
            Compartilhe este código com sua aliada para unir as duas cidadelas.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center font-cinzel font-bold text-2xl tracking-[0.3em] text-primary bg-background/60 border border-primary/20 rounded-sm py-3 select-all">
              {perfil?.codigoAlianca ?? '••••••'}
            </div>
            <button
              onClick={copiarCodigo}
              disabled={!perfil}
              className="min-h-[52px] px-4 border border-primary text-primary rounded-sm flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 disabled:opacity-40 touch-manipulation"
              aria-label="Copiar código"
            >
              {copiado ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          {perfil && (
            <div className="flex items-center gap-1.5 mt-3 text-[10px] text-secondary">
              <Pencil size={10} className="text-primary/60" /> Sua cidadela: <span className="text-foreground font-bold">{perfil.nome}</span>
            </div>
          )}
        </div>
      </section>

      {/* Sem aliada: parear */}
      {!aliada && (
        <section>
          <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
            <Handshake size={13} /> UNIR-SE A UMA ALIADA
          </h3>
          <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 rounded-sm p-4 space-y-3">
            <p className="text-[10px] text-secondary/80 leading-relaxed">
              Digite o código da sua aliada para formar uma aliança. Vocês poderão trocar recursos e moradores.
            </p>
            <input
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              maxLength={12}
              placeholder="CÓDIGO"
              className="w-full bg-background/60 border border-primary/20 rounded-sm py-3 px-3 text-center font-cinzel font-bold tracking-[0.3em] text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60"
            />
            <button
              onClick={handleParear}
              disabled={pareando || !codigo.trim()}
              className="w-full min-h-[48px] border text-xs tracking-[0.2em] font-cinzel font-bold rounded-sm transition-all touch-manipulation flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Handshake size={14} /> {pareando ? 'FORMANDO...' : 'FORMAR ALIANÇA'}
            </button>
          </div>
        </section>
      )}

      {/* Com aliada: resumo + envio de recursos + empréstimo de moradores */}
      {aliada && (
        <>
          {/* Resumo da aliada */}
          <section>
            <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
              <Users size={13} /> SUA ALIADA
            </h3>
            <div className="bg-gradient-to-b from-[#231A2E] to-[#161B22] border border-primary/30 rounded-sm p-4 relative overflow-hidden">
              <Handshake className="absolute -right-3 -bottom-3 w-16 h-16 text-primary/10" />
              <div className="font-cinzel font-bold text-lg text-foreground relative z-10">{aliada.nome}</div>
              <div className="flex gap-4 flex-wrap mt-3 text-[11px] relative z-10">
                <span className="flex items-center gap-1 text-secondary"><CalendarDays size={12} className="text-primary/70" /> Dia <span className="text-foreground font-bold">{aliada.resumo?.dia ?? '—'}</span></span>
                <span className="flex items-center gap-1 text-secondary"><Users size={12} className="text-primary/70" /> Pop. <span className="text-foreground font-bold">{aliada.resumo?.populacao ?? '—'}</span></span>
                <span className="flex items-center gap-1 text-secondary"><Building2 size={12} className="text-primary/70" /> Andar <span className="text-foreground font-bold">{aliada.resumo?.andarAtual ?? '—'}</span></span>
              </div>
              {aliada.resumo && (
                <div className="flex gap-2 flex-wrap mt-3 relative z-10">
                  {(Object.keys(aliada.resumo.profissoes) as ProfissaoId[]).map(p => (
                    <span key={p} className={`text-[10px] px-2 py-1 rounded-sm border ${aliada.resumo!.profissoes[p] > 0 ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-background/40 border-card-border text-muted-foreground'}`}>
                      {PROFISSOES[p].nome} <span className="font-bold">{aliada.resumo!.profissoes[p]}</span>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[9px] text-muted-foreground mt-3 relative z-10">
                Resumo sincronizado periodicamente — não é tempo real.
              </p>
            </div>
          </section>

          {/* Enviar recursos */}
          <section>
            <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
              <Send size={13} /> ENVIAR RECURSOS
            </h3>
            <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 rounded-sm p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {RES_META.map(({ key, label, icon: Icon }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] text-secondary tracking-wide flex items-center gap-1">
                      <Icon size={11} className="text-primary/70" /> {label}
                      <span className="text-muted-foreground/60 ml-auto">({Math.floor(state.recursos[key])})</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={envio[key]}
                      onChange={e => setEnvio(s => ({ ...s, [key]: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-background/60 border border-primary/20 rounded-sm py-2 px-2 text-sm text-foreground text-center focus:outline-none focus:border-primary/60"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-secondary border-t border-primary/10 pt-3">
                <span>Restante hoje: <span className={`font-bold ${restanteHoje > 0 ? 'text-primary' : 'text-destructive'}`}>{restanteHoje}</span></span>
                <span>Taxa da torre: <span className="text-warning font-bold">{perfil ? Math.round(perfil.taxaTorre * 100) : 15}%</span></span>
              </div>
              <p className="text-[9px] text-muted-foreground -mt-1">Parte se perde no caminho. Enviando: {totalEnvio()} recurso(s).</p>
              <button
                onClick={handleEnviar}
                disabled={!podeEnviar}
                className="w-full min-h-[48px] border text-xs tracking-[0.2em] font-cinzel font-bold rounded-sm transition-all touch-manipulation flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={14} /> {enviando ? 'ENVIANDO...' : 'ENVIAR À ALIADA'}
              </button>
            </div>
          </section>

          {/* Emprestar morador */}
          <section>
            <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
              <UserCheck size={13} /> EMPRESTAR MORADOR
            </h3>
            <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 rounded-sm p-4 space-y-3">
              <p className="text-[10px] text-secondary/80 leading-relaxed">
                Selecione um morador para emprestar à aliada. Ele ajuda por alguns dias e retorna automaticamente (ou não volta se cair em batalha).
              </p>

              {elegiveisParaEmprestimo.length === 0 ? (
                <div className="text-center text-[11px] text-muted-foreground py-4 border border-dashed border-card-border rounded-sm">
                  Nenhum morador disponível para empréstimo.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                  {elegiveisParaEmprestimo.map(renderNpcCard)}
                </div>
              )}

              {npcSelecionadoId && (
                <>
                  {/* Seletor de duração */}
                  <div className="space-y-1 border-t border-primary/10 pt-3">
                    <p className="text-[10px] text-secondary tracking-wide">Duração do empréstimo (dias de jogo):</p>
                    <div className="flex gap-2">
                      {OPCOES_DIAS.map(d => (
                        <button
                          key={d}
                          onClick={() => setDiasEmprestimo(d)}
                          className={`flex-1 min-h-[40px] text-xs font-cinzel font-bold border rounded-sm transition-all touch-manipulation ${
                            diasEmprestimo === d
                              ? 'border-primary bg-primary/20 text-primary'
                              : 'border-card-border text-muted-foreground hover:border-primary/40'
                          }`}
                        >
                          {d} dias
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleEmprestar}
                    disabled={emprestando}
                    className="w-full min-h-[48px] border text-xs tracking-[0.2em] font-cinzel font-bold rounded-sm transition-all touch-manipulation flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98] disabled:opacity-40"
                  >
                    <UserCheck size={14} /> {emprestando ? 'ENVIANDO...' : 'EMPRESTAR'}
                  </button>
                </>
              )}
            </div>
          </section>
        </>
      )}

      {/* Caixa de entrada */}
      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
          <Inbox size={13} /> CAIXA DE ENTRADA {caixa.length > 0 && <span className="text-primary">({caixa.length})</span>}
        </h3>
        {caixa.length === 0 ? (
          <div className="text-center text-[11px] text-muted-foreground py-6 border border-dashed border-card-border rounded-sm">
            Nenhum envio pendente.
          </div>
        ) : (
          <div className="space-y-3">
            {caixa.map(renderCaixaItem)}
          </div>
        )}
      </section>
    </div>
  );
}
