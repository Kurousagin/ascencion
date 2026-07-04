import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import {
  useAlliance,
  type EmprestimoRegistro,
} from "../context/AllianceContext";
import {
  PROFISSOES,
  ProfissaoId,
  getProfissao,
  podeEmprestar,
} from "../lib/game-data";
import {
  Handshake,
  Copy,
  Check,
  Send,
  Inbox,
  Users,
  Wheat,
  Trees,
  Mountain,
  Zap,
  Wifi,
  WifiOff,
  Pencil,
  CalendarDays,
  Building2,
  UserPlus,
  Clock,
  Skull,
  Undo2,
  Shield,
  History,
  ArrowRightLeft,
  Link2Off,
  X,
  ChevronDown,
} from "lucide-react";

const PRAZOS_DIAS = [5, 10, 20];

type ResKey = "comida" | "madeira" | "pedra" | "ferro";
const RES_META: { key: ResKey; label: string; icon: any }[] = [
  { key: "comida", label: "Comida", icon: Wheat },
  { key: "madeira", label: "Madeira", icon: Trees },
  { key: "pedra", label: "Pedra", icon: Mountain },
  { key: "ferro", label: "Ferro", icon: Zap },
];

export function Alliance() {
  const { state, debitarRecursos, estornarRecursos } = useGame();
  const {
    perfil,
    aliadas,
    caixa,
    online,
    historico,
    parear,
    desfazer,
    enviar,
    emprestar,
    reforcar,
    receber,
    refresh,
  } = useAlliance();

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ── Estado do pareamento ──
  const [codigo, setCodigo] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [pareando, setPareando] = useState(false);

  // ── Aliada-alvo das ações (envio/empréstimo/reforço) ──
  const [alvo, setAlvo] = useState<string>("");
  const [desfazendo, setDesfazendo] = useState<string | null>(null);
  const [confirmarDesfazer, setConfirmarDesfazer] = useState<string | null>(
    null,
  );

  // ── Estado do envio de recursos ──
  const [envio, setEnvio] = useState<Record<ResKey, string>>({
    comida: "",
    madeira: "",
    pedra: "",
    ferro: "",
  });
  const [enviando, setEnviando] = useState(false);

  // ── Estado do recebimento da caixa ──
  const [recebendoId, setRecebendoId] = useState<number | null>(null);
  const [emprestimoNpcId, setEmprestimoNpcId] = useState("");
  const [emprestimoPrazo, setEmprestimoPrazo] = useState<number>(
    PRAZOS_DIAS[1],
  );
  const [emprestando, setEmprestando] = useState(false);

  // ── Estado do reforço de expedição ──
  const [reforcoNpcId, setReforcoNpcId] = useState("");
  const [reforcando, setReforcando] = useState(false);

  // ── Mensagens de feedback ──
  const [msg, setMsg] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(
    null,
  );

  // Mantém a aliada-alvo válida conforme a lista muda.
  useEffect(() => {
    if (aliadas.length === 0) {
      if (alvo) setAlvo("");
      return;
    }
    if (!aliadas.some((a) => a.deviceId === alvo)) setAlvo(aliadas[0].deviceId);
  }, [aliadas, alvo]);

  const aliadaAlvo = aliadas.find((a) => a.deviceId === alvo) ?? null;
  const nomeAlvo = aliadaAlvo?.nome ?? "—";

  const numAliadas = perfil?.numAliadas ?? aliadas.length;
  const maxAliadas = perfil?.maxAliadas ?? 3;
  const cheio = numAliadas >= maxAliadas;

  const restanteHoje = perfil
    ? Math.max(0, perfil.limiteEnvioDiario - perfil.enviadoHoje)
    : 0;

  const copiarCodigo = async () => {
    if (!perfil) return;
    try {
      await navigator.clipboard.writeText(perfil.codigoAlianca);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* clipboard indisponível */
    }
  };

  const handleParear = async () => {
    if (!codigo.trim()) return;
    setPareando(true);
    setMsg(null);
    const r = await parear(codigo);
    setPareando(false);
    if (r.ok) {
      setCodigo("");
      setMsg({ tipo: "ok", texto: "Aliança formada!" });
    } else setMsg({ tipo: "erro", texto: r.erro ?? "Falha ao parear." });
  };

  const handleDesfazer = async (deviceId: string) => {
    setDesfazendo(deviceId);
    setMsg(null);
    const r = await desfazer(deviceId);
    setDesfazendo(null);
    setConfirmarDesfazer(null);
    if (r.ok) setMsg({ tipo: "ok", texto: "Aliança desfeita." });
    else setMsg({ tipo: "erro", texto: r.erro ?? "Falha ao desfazer." });
  };

  const envioNums = (): Record<ResKey, number> => ({
    comida: Math.max(0, Math.floor(Number(envio.comida) || 0)),
    madeira: Math.max(0, Math.floor(Number(envio.madeira) || 0)),
    pedra: Math.max(0, Math.floor(Number(envio.pedra) || 0)),
    ferro: Math.max(0, Math.floor(Number(envio.ferro) || 0)),
  });
  const totalEnvio = () => {
    const n = envioNums();
    return n.comida + n.madeira + n.pedra + n.ferro;
  };
  const saldoSuficiente = () => {
    const n = envioNums();
    return (["comida", "madeira", "pedra", "ferro"] as ResKey[]).every(
      (k) => state.recursos[k] >= n[k],
    );
  };
  const podeEnviar =
    !enviando &&
    !!alvo &&
    totalEnvio() > 0 &&
    totalEnvio() <= restanteHoje &&
    saldoSuficiente();

  const handleEnviar = async () => {
    const n = envioNums();
    if (totalEnvio() <= 0 || !alvo) return;
    const reservado = debitarRecursos(n);
    if (!reservado) {
      setMsg({ tipo: "erro", texto: "Recursos insuficientes no armazém." });
      return;
    }
    setEnviando(true);
    setMsg(null);
    const r = await enviar(alvo, n);
    if (r.ok) {
      setEnvio({ comida: "", madeira: "", pedra: "", ferro: "" });
      setMsg({ tipo: "ok", texto: `Recursos enviados a ${nomeAlvo}.` });
    } else {
      estornarRecursos(n);
      setMsg({ tipo: "erro", texto: r.erro ?? "Falha ao enviar." });
    }
    setEnviando(false);
  };

  const handleReceber = async (id: number) => {
    setRecebendoId(id);
    setMsg(null);
    const r = await receber(id);
    setRecebendoId(null);
    if (!r.ok) setMsg({ tipo: "erro", texto: r.erro ?? "Falha ao receber." });
  };

  // Moradores próprios elegíveis para empréstimo (vivos, ociosos, fora de expedição).
  const elegiveis = state.npcs.filter(podeEmprestar);

  const handleEmprestar = async () => {
    if (!emprestimoNpcId || !alvo) return;
    setEmprestando(true);
    setMsg(null);
    const r = await emprestar(alvo, emprestimoNpcId, emprestimoPrazo);
    setEmprestando(false);
    if (r.ok) {
      setEmprestimoNpcId("");
      setMsg({ tipo: "ok", texto: `Morador emprestado a ${nomeAlvo}.` });
    } else {
      setMsg({ tipo: "erro", texto: r.erro ?? "Falha ao emprestar." });
    }
  };

  const handleReforcar = async () => {
    if (!reforcoNpcId || !alvo) return;
    setReforcando(true);
    setMsg(null);
    const r = await reforcar(alvo, reforcoNpcId);
    setReforcando(false);
    if (r.ok) {
      setReforcoNpcId("");
      setMsg({
        tipo: "ok",
        texto: `Reforço enviado! Ele entra na próxima expedição de ${nomeAlvo}.`,
      });
    } else {
      setMsg({ tipo: "erro", texto: r.erro ?? "Falha ao enviar reforço." });
    }
  };

  // Considera tanto a lista carregada quanto o contador do perfil.
  // Sem isso, se puxarAliadasECaixa ainda não completou mas sincronizarPerfil
  // já voltou com numAliadas > 0, as seções de ação ficam escondidas.
  const aliadasCarregando =
    aliadas.length === 0 && (perfil?.numAliadas ?? 0) > 0;

  const temAliadas = aliadas.length > 0 || (perfil?.numAliadas ?? 0) > 0;

  return (
    <div className="p-4 space-y-8 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">
            ALIANÇA
          </h2>
          <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
        </div>
        <span
          className={`flex items-center gap-1 text-[10px] tracking-widest ${online ? "text-success" : "text-muted-foreground"}`}
        >
          {online ? <Wifi size={12} /> : <WifiOff size={12} />}
          {online ? "CONECTADO" : "OFFLINE"}
        </span>
      </header>

      {msg && (
        <div
          className={`text-xs rounded-sm px-3 py-2 border ${
            msg.tipo === "erro"
              ? "bg-destructive/10 text-destructive border-destructive/30"
              : "bg-success/10 text-success border-success/30"
          }`}
        >
          {msg.texto}
        </div>
      )}

      {/* Seu código de aliança */}
      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4">
          SEU CÓDIGO DE ALIANÇA
        </h3>
        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 rounded-sm p-4">
          <p className="text-[10px] text-secondary/80 mb-3 leading-relaxed">
            Compartilhe este código com suas aliadas para unir as cidadelas.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 text-center font-cinzel font-bold text-2xl tracking-[0.3em] text-primary bg-background/60 border border-primary/20 rounded-sm py-3 select-all">
              {perfil?.codigoAlianca ?? "••••••"}
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
              <Pencil size={10} className="text-primary/60" /> Sua cidadela:{" "}
              <span className="text-foreground font-bold">{perfil.nome}</span>
            </div>
          )}
        </div>
      </section>

      {/* Unir-se a uma aliada (parear) */}
      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
          <Handshake size={13} /> UNIR-SE A UMA ALIADA
          <span className="ml-auto text-[10px] text-secondary normal-case tracking-normal">
            {numAliadas}/{maxAliadas} aliadas
          </span>
        </h3>
        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 rounded-sm p-4 space-y-3">
          {cheio ? (
            <p className="text-[11px] text-warning leading-relaxed">
              Você atingiu o limite de {maxAliadas} aliadas. Desfaça uma aliança
              para formar outra.
            </p>
          ) : (
            <>
              <p className="text-[10px] text-secondary/80 leading-relaxed">
                Digite o código de uma aliada para formar uma aliança. Vocês
                poderão trocar recursos e moradores.
              </p>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                maxLength={12}
                placeholder="CÓDIGO"
                className="w-full bg-background/60 border border-primary/20 rounded-sm py-3 px-3 text-center font-cinzel font-bold tracking-[0.3em] text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/60"
              />
              <button
                onClick={handleParear}
                disabled={pareando || !codigo.trim()}
                className="w-full min-h-[48px] border text-xs tracking-[0.2em] font-cinzel font-bold rounded-sm transition-all touch-manipulation flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Handshake size={14} />{" "}
                {pareando ? "FORMANDO..." : "FORMAR ALIANÇA"}
              </button>
            </>
          )}
        </div>
      </section>

      {/* Lista de aliadas */}
      {temAliadas && (
        <section
          className={aliadasCarregando ? "opacity-60 pointer-events-none" : ""}
        >
          <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
            <Users size={13} /> SUAS ALIADAS
          </h3>

          {aliadasCarregando && aliadas.length === 0 ? (
            <div className="text-center text-[11px] text-muted-foreground py-6 border border-dashed border-card-border rounded-sm animate-pulse">
              Sincronizando aliadas...
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {aliadas.map((aliada) => (
                  <div
                    key={aliada.deviceId}
                    className="bg-gradient-to-b from-[#231A2E] to-[#161B22] border border-primary/30 rounded-sm p-4 relative overflow-hidden"
                  >
                    <Handshake className="absolute -right-3 -bottom-3 w-16 h-16 text-primary/10" />
                    <div className="flex items-start justify-between gap-2 relative z-10">
                      <div className="font-cinzel font-bold text-lg text-foreground">
                        {aliada.nome}
                      </div>
                      {confirmarDesfazer === aliada.deviceId ? (
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleDesfazer(aliada.deviceId)}
                            disabled={desfazendo === aliada.deviceId}
                            className="min-h-[32px] px-2.5 text-[10px] font-bold rounded-sm border border-destructive text-destructive hover:bg-destructive hover:text-background transition-all active:scale-95 disabled:opacity-40 touch-manipulation"
                          >
                            {desfazendo === aliada.deviceId
                              ? "..."
                              : "CONFIRMAR"}
                          </button>
                          <button
                            onClick={() => setConfirmarDesfazer(null)}
                            disabled={desfazendo === aliada.deviceId}
                            className="min-h-[32px] w-8 flex items-center justify-center rounded-sm border border-card-border text-muted-foreground hover:text-foreground transition-all active:scale-95 touch-manipulation"
                            aria-label="Cancelar"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmarDesfazer(aliada.deviceId)}
                          className="min-h-[32px] px-2.5 flex items-center gap-1 text-[10px] font-bold rounded-sm border border-destructive/40 text-destructive/80 hover:border-destructive hover:text-destructive transition-all active:scale-95 touch-manipulation shrink-0"
                        >
                          <Link2Off size={12} /> DESFAZER
                        </button>
                      )}
                    </div>
                    <div className="flex gap-4 flex-wrap mt-3 text-[11px] relative z-10">
                      <span className="flex items-center gap-1 text-secondary">
                        <CalendarDays size={12} className="text-primary/70" />{" "}
                        Dia{" "}
                        <span className="text-foreground font-bold">
                          {aliada.resumo?.dia ?? "—"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-secondary">
                        <Users size={12} className="text-primary/70" /> Pop.{" "}
                        <span className="text-foreground font-bold">
                          {aliada.resumo?.populacao ?? "—"}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-secondary">
                        <Building2 size={12} className="text-primary/70" />{" "}
                        Andar{" "}
                        <span className="text-foreground font-bold">
                          {aliada.resumo?.andarAtual ?? "—"}
                        </span>
                      </span>
                    </div>
                    {aliada.resumo && (
                      <div className="flex gap-2 flex-wrap mt-3 relative z-10">
                        {(
                          Object.keys(aliada.resumo.profissoes) as ProfissaoId[]
                        ).map((p) => (
                          <span
                            key={p}
                            className={`text-[10px] px-2 py-1 rounded-sm border ${aliada.resumo!.profissoes[p] > 0 ? "bg-primary/10 border-primary/30 text-primary" : "bg-background/40 border-card-border text-muted-foreground"}`}
                          >
                            {PROFISSOES[p].nome}{" "}
                            <span className="font-bold">
                              {aliada.resumo!.profissoes[p]}
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                    {confirmarDesfazer === aliada.deviceId && (
                      <p className="text-[10px] text-destructive/90 mt-3 relative z-10">
                        Desfazer encerra a troca de recursos e moradores com{" "}
                        {aliada.nome}. Empréstimos já em curso ainda retornam
                        normalmente.
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground mt-3">
                Resumos sincronizados periodicamente — não é tempo real.
              </p>
            </>
          )}
        </section>
      )}

      {/* Ações com aliada: seletor de alvo + envio/reforço/empréstimo */}
      {temAliadas && !aliadasCarregando && (
        <>
          {/* Seletor de aliada-alvo */}
          <section>
            <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
              <ArrowRightLeft size={13} /> AÇÕES — ESCOLHA A ALIADA
            </h3>
            <div className="relative">
              <select
                value={alvo}
                onChange={(e) => setAlvo(e.target.value)}
                className="w-full appearance-none bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 rounded-sm py-3 pl-4 pr-10 text-sm font-bold text-foreground focus:outline-none focus:border-primary/60"
              >
                {aliadas.map((a) => (
                  <option key={a.deviceId} value={a.deviceId}>
                    {a.nome}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/70 pointer-events-none"
              />
            </div>
            <p className="text-[9px] text-muted-foreground mt-2">
              Recursos, reforços e empréstimos abaixo vão para{" "}
              <span className="text-primary font-bold">{nomeAlvo}</span>.
            </p>
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
                      <span className="text-muted-foreground/60 ml-auto">
                        ({Math.floor(state.recursos[key])})
                      </span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      value={envio[key]}
                      onChange={(e) =>
                        setEnvio((s) => ({ ...s, [key]: e.target.value }))
                      }
                      placeholder="0"
                      className="w-full bg-background/60 border border-primary/20 rounded-sm py-2 px-2 text-sm text-foreground text-center focus:outline-none focus:border-primary/60"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-secondary border-t border-primary/10 pt-3">
                <span>
                  Restante hoje:{" "}
                  <span
                    className={`font-bold ${restanteHoje > 0 ? "text-primary" : "text-destructive"}`}
                  >
                    {restanteHoje}
                  </span>
                </span>
                <span>
                  Taxa da torre:{" "}
                  <span className="text-warning font-bold">
                    {perfil ? Math.round(perfil.taxaTorre * 100) : 15}%
                  </span>
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground -mt-1">
                O limite diário é somado entre todas as aliadas. Parte se perde
                no caminho. Enviando: {totalEnvio()} recurso(s).
              </p>
              <button
                onClick={handleEnviar}
                disabled={!podeEnviar}
                className="w-full min-h-[48px] border text-xs tracking-[0.2em] font-cinzel font-bold rounded-sm transition-all touch-manipulation flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={14} />{" "}
                {enviando
                  ? "ENVIANDO..."
                  : `ENVIAR A ${nomeAlvo.toUpperCase()}`}
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
              <Shield size={13} /> ENVIAR REFORÇO
            </h3>
            <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 rounded-sm p-4 space-y-3">
              <p className="text-[10px] text-secondary/80 leading-relaxed">
                Envie um morador para reforçar a próxima expedição da aliada.
                Ele some da sua cidadela, entra no grupo dela somando poder (e
                efeitos de profissão), e retorna ao fim da expedição com o
                estado atualizado. Se cair, é perdido.
              </p>

              {elegiveis.length === 0 ? (
                <div className="text-[11px] text-muted-foreground italic py-2">
                  Nenhum morador elegível. Reforço requer morador vivo e ocioso.
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] text-secondary tracking-wide">
                      Morador de reforço
                    </label>
                    <select
                      value={reforcoNpcId}
                      onChange={(e) => setReforcoNpcId(e.target.value)}
                      className="w-full bg-background/60 border border-primary/20 rounded-sm py-2.5 px-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                    >
                      <option value="">Selecione um morador...</option>
                      {elegiveis.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.nome} — {PROFISSOES[getProfissao(n)].nome} (
                          {n.raridade})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleReforcar}
                    disabled={reforcando || !reforcoNpcId}
                    className="w-full min-h-[48px] border text-xs tracking-[0.2em] font-cinzel font-bold rounded-sm transition-all touch-manipulation flex items-center justify-center gap-2 border-blue-400 text-blue-300 hover:bg-blue-400/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Shield size={14} />{" "}
                    {reforcando ? "ENVIANDO..." : "ENVIAR REFORÇO"}
                  </button>
                </>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
              <UserPlus size={13} /> EMPRESTAR MORADOR
            </h3>
            <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 rounded-sm p-4 space-y-3">
              <p className="text-[10px] text-secondary/80 leading-relaxed">
                Empreste um morador ocioso à aliada por um prazo. Ele some da
                sua cidadela, trabalha e vai a expedições na dela, e retorna ao
                fim do prazo com o estado atualizado. Se cair numa expedição da
                aliada, é perdido.
              </p>

              {elegiveis.length === 0 ? (
                <div className="text-[11px] text-muted-foreground italic py-2">
                  Nenhum morador elegível. Só é possível emprestar quem está
                  vivo, ocioso (sem posto) e fora de expedição.
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] text-secondary tracking-wide">
                      Morador
                    </label>
                    <select
                      value={emprestimoNpcId}
                      onChange={(e) => setEmprestimoNpcId(e.target.value)}
                      className="w-full bg-background/60 border border-primary/20 rounded-sm py-2.5 px-2 text-sm text-foreground focus:outline-none focus:border-primary/60"
                    >
                      <option value="">Selecione um morador...</option>
                      {elegiveis.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.nome} — {PROFISSOES[getProfissao(n)].nome} (
                          {n.raridade})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-secondary tracking-wide flex items-center gap-1">
                      <Clock size={11} className="text-primary/70" /> Prazo
                      (dias da aliada)
                    </label>
                    <div className="flex gap-2">
                      {PRAZOS_DIAS.map((d) => (
                        <button
                          key={d}
                          onClick={() => setEmprestimoPrazo(d)}
                          className={`flex-1 min-h-[40px] text-xs font-bold rounded-sm border transition-all touch-manipulation ${
                            emprestimoPrazo === d
                              ? "bg-primary/15 border-primary text-primary"
                              : "bg-background/40 border-card-border text-secondary hover:border-primary/40"
                          }`}
                        >
                          {d} dias
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleEmprestar}
                    disabled={emprestando || !emprestimoNpcId}
                    className="w-full min-h-[48px] border text-xs tracking-[0.2em] font-cinzel font-bold rounded-sm transition-all touch-manipulation flex items-center justify-center gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <UserPlus size={14} />{" "}
                    {emprestando
                      ? "ENVIANDO..."
                      : `EMPRESTAR A ${nomeAlvo.toUpperCase()}`}
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
          <Inbox size={13} /> CAIXA DE ENTRADA{" "}
          {caixa.length > 0 && (
            <span className="text-primary">({caixa.length})</span>
          )}
        </h3>
        {caixa.length === 0 ? (
          <div className="text-center text-[11px] text-muted-foreground py-6 border border-dashed border-card-border rounded-sm">
            Nenhum envio pendente.
          </div>
        ) : (
          <div className="space-y-3">
            {caixa.map((item) => {
              const isEmprestimo = item.tipo === "emprestimo" && item.morador;
              const isReforco = item.tipo === "reforco" && item.morador;
              const isRetorno = item.tipo === "retorno" && item.morador;
              const recursos = item.recursos;
              return (
                <div
                  key={item.id}
                  className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 rounded-sm p-3"
                >
                  <div className="text-[11px] text-secondary mb-2">
                    {isEmprestimo && (
                      <span className="text-primary font-bold">
                        Empréstimo ·{" "}
                      </span>
                    )}
                    {isReforco && (
                      <span className="text-blue-300 font-bold">
                        Reforço ·{" "}
                      </span>
                    )}
                    {isRetorno && (
                      <span
                        className={`font-bold ${item.morreu ? "text-destructive" : "text-success"}`}
                      >
                        Retorno ·{" "}
                      </span>
                    )}
                    De{" "}
                    <span className="text-foreground font-bold">
                      {item.remetenteNome}
                    </span>
                  </div>

                  {isEmprestimo && item.morador && (
                    <div className="mb-3 text-[11px] bg-background/50 border border-primary/20 rounded-sm p-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <UserPlus size={12} className="text-primary" />
                        <span className="text-foreground font-bold">
                          {item.morador.nome}
                        </span>
                        <span className="text-primary text-[10px]">
                          {PROFISSOES[getProfissao(item.morador)].nome}
                        </span>
                      </div>
                      <div className="text-[10px] text-secondary flex items-center gap-1">
                        <Clock size={10} className="text-primary/70" /> Prazo:{" "}
                        {item.prazoDias ?? "—"} dias na sua cidadela
                      </div>
                    </div>
                  )}

                  {isReforco && item.morador && (
                    <div className="mb-3 text-[11px] bg-blue-500/10 border border-blue-400/30 rounded-sm p-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield size={12} className="text-blue-300" />
                        <span className="text-foreground font-bold">
                          {item.morador.nome}
                        </span>
                        <span className="text-blue-300 text-[10px]">
                          {PROFISSOES[getProfissao(item.morador)].nome}
                        </span>
                      </div>
                      <div className="text-[10px] text-secondary">
                        Participa de uma expedição e retorna automaticamente ao
                        dono.
                      </div>
                    </div>
                  )}

                  {isRetorno && item.morador && (
                    <div
                      className={`mb-3 text-[11px] bg-background/50 border rounded-sm p-2.5 ${item.morreu ? "border-destructive/30" : "border-success/30"}`}
                    >
                      <div className="flex items-center gap-2">
                        {item.morreu ? (
                          <Skull size={12} className="text-destructive" />
                        ) : (
                          <Undo2 size={12} className="text-success" />
                        )}
                        <span className="text-foreground font-bold">
                          {item.morador.nome}
                        </span>
                        <span
                          className={`text-[10px] ${item.morreu ? "text-destructive" : "text-success"}`}
                        >
                          {item.morreu
                            ? "PERDIDO EM EXPEDIÇÃO"
                            : "volta são e salvo"}
                        </span>
                      </div>
                    </div>
                  )}

                  {!isEmprestimo && !isReforco && !isRetorno && (
                    <div className="flex gap-2 flex-wrap mb-3 text-[10px] font-bold">
                      {recursos &&
                        RES_META.filter((m) => recursos[m.key] > 0).map(
                          ({ key, icon: Icon }) => (
                            <span
                              key={key}
                              className="px-1.5 py-0.5 rounded-sm flex items-center gap-1 bg-background text-success border border-success/30"
                            >
                              <Icon size={10} /> +{recursos[key]}
                            </span>
                          ),
                        )}
                      {(!recursos ||
                        RES_META.every((m) => recursos[m.key] === 0)) && (
                        <span className="text-muted-foreground">
                          Envio vazio
                        </span>
                      )}
                    </div>
                  )}

                  <button
                    onClick={() => handleReceber(item.id)}
                    disabled={recebendoId === item.id}
                    className="w-full min-h-[44px] border text-xs tracking-[0.2em] font-cinzel font-bold rounded-sm transition-all touch-manipulation flex items-center justify-center gap-2 border-success text-success hover:bg-success hover:text-background active:scale-[0.98] disabled:opacity-40"
                  >
                    <Check size={14} />{" "}
                    {recebendoId === item.id
                      ? "RECEBENDO..."
                      : isEmprestimo
                        ? "ACOLHER MORADOR"
                        : isReforco
                          ? "ACOLHER REFORÇO"
                          : isRetorno
                            ? "CONFIRMAR"
                            : "RECEBER"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Histórico de empréstimos */}
      {historico.length > 0 && (
        <section>
          <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
            <History size={13} /> MORADORES ENVIADOS
          </h3>
          <div className="space-y-2">
            {historico.map((reg: EmprestimoRegistro) => {
              const emCurso = reg.estado === "em_curso";
              const caiu = reg.estado === "caiu";
              const prof =
                PROFISSOES[reg.profissao as ProfissaoId]?.nome ?? reg.profissao;
              return (
                <div
                  key={reg.id}
                  className={`bg-gradient-to-r from-[#1C2333] to-[#161B22] border rounded-sm p-3 flex items-start gap-3 ${
                    emCurso
                      ? "border-primary/30"
                      : caiu
                        ? "border-destructive/20"
                        : "border-success/20"
                  }`}
                >
                  {/* Ícone de estado */}
                  <div
                    className={`mt-0.5 shrink-0 ${emCurso ? "text-primary" : caiu ? "text-destructive" : "text-success"}`}
                  >
                    {reg.tipo === "reforco" ? (
                      <Shield size={14} />
                    ) : emCurso ? (
                      <ArrowRightLeft size={14} />
                    ) : caiu ? (
                      <Skull size={14} />
                    ) : (
                      <Check size={14} />
                    )}
                  </div>

                  {/* Dados do morador */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-bold text-foreground text-sm truncate">
                          {reg.npcNome}
                        </span>
                        <span className="text-[9px] text-primary/70 uppercase shrink-0">
                          {prof}
                        </span>
                        {reg.tipo === "reforco" && (
                          <span className="text-[9px] bg-blue-500/10 border border-blue-400/30 text-blue-400 px-1 py-0.5 rounded-sm uppercase shrink-0">
                            reforço
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wide shrink-0 ${
                          emCurso
                            ? "text-primary"
                            : caiu
                              ? "text-destructive"
                              : "text-success"
                        }`}
                      >
                        {emCurso ? "EM CURSO" : caiu ? "CAIU" : "VOLTOU"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-secondary flex-wrap">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={9} className="text-primary/60" />
                        Dia {reg.diaEnvio}
                        {reg.diaRetorno != null && ` → ${reg.diaRetorno}`}
                        {emCurso &&
                          reg.prazoDias > 0 &&
                          ` (prazo: ${reg.prazoDias} dias)`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={9} className="text-primary/60" />{" "}
                        {reg.aliadaNome}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
