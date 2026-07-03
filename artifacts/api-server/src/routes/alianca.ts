import { Router, type IRouter } from "express";
import { and, eq, inArray } from "drizzle-orm";
import {
  db,
  playersTable,
  alliancesTable,
  exchangesTable,
  type ResumoCidadela,
  type ConteudoRecursos,
  type MoradorPayload,
} from "@workspace/db";
import {
  RegistrarPerfilBody,
  RegistrarPerfilResponse,
  ObterAliadaParams,
  ObterAliadaResponse,
  ParearAliancaBody,
  ParearAliancaResponse,
  EnviarRecursosBody,
  EnviarRecursosResponse,
  ListarCaixaParams,
  ListarCaixaResponse,
  ReceberItemBody,
  ReceberItemResponse,
  EmprestarMoradorBody,
  EmprestarMoradorResponse,
  ReforcarMoradorBody,
  ReforcarMoradorResponse,
  DevolverMoradorBody,
  DevolverMoradorResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// ─── Balanceamento ────────────────────────────────────────────────────────────
const LIMITE_ENVIO_DIARIO = 300;
const TAXA_TORRE = 0.15;

// Empréstimo de moradores: prazo permitido e teto de empréstimos simultâneos
// (contados como itens de ida ainda pendentes ou já em uso na aliada).
const PRAZO_MIN_DIAS = 3;
const PRAZO_MAX_DIAS = 60;
const LIMITE_EMPRESTIMOS = 2;

// Reforço de expedição: teto de reforços simultâneos ainda não devolvidos
// (aguardando recebimento ou já em uso na aliada).
const LIMITE_REFORCOS = 2;

// Código de aliança: 6 caracteres, sem caracteres ambíguos (0/O, 1/I, etc.).
const ALFABETO_CODIGO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function gerarCodigo(): string {
  let s = "";
  for (let i = 0; i < 6; i++) {
    s += ALFABETO_CODIGO[Math.floor(Math.random() * ALFABETO_CODIGO.length)];
  }
  return s;
}

const NOMES_PADRAO = [
  "Cidadela Silente",
  "Bastião Cinéreo",
  "Refúgio Velado",
  "Torre Esquecida",
  "Enclave Sombrio",
  "Fortaleza Errante",
];

function nomePadrao(): string {
  return NOMES_PADRAO[Math.floor(Math.random() * NOMES_PADRAO.length)];
}

function hojeStr(): string {
  return new Date().toISOString().slice(0, 10);
}

async function gerarCodigoUnico(): Promise<string> {
  for (let tentativa = 0; tentativa < 12; tentativa++) {
    const codigo = gerarCodigo();
    const [existe] = await db
      .select({ id: playersTable.id })
      .from(playersTable)
      .where(eq(playersTable.codigoAlianca, codigo))
      .limit(1);
    if (!existe) return codigo;
  }
  return gerarCodigo() + gerarCodigo();
}

async function temAliada(playerId: number): Promise<boolean> {
  const [link] = await db
    .select({ id: alliancesTable.id })
    .from(alliancesTable)
    .where(eq(alliancesTable.playerId, playerId))
    .limit(1);
  return !!link;
}

// Mapeia um registro de troca para o formato da caixa de entrada.
function mapExchange(it: typeof exchangesTable.$inferSelect) {
  return {
    id: it.id,
    tipo: it.tipo,
    remetenteNome: it.remetenteNome,
    recursos: it.conteudo ?? null,
    morador: it.morador ?? null,
    prazoDias: it.prazoDias ?? null,
    morreu: it.morreu,
    status: it.status,
    criadoEm: it.createdAt,
  };
}

// ─── POST /alianca/perfil ─────────────────────────────────────────────────────
router.post("/alianca/perfil", async (req, res): Promise<void> => {
  const parsed = RegistrarPerfilBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { deviceId, nome, resumo } = parsed.data;

  const [existente] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.deviceId, deviceId))
    .limit(1);

  let player = existente;
  if (!player) {
    const codigo = await gerarCodigoUnico();
    const [criado] = await db
      .insert(playersTable)
      .values({
        deviceId,
        nome: nome?.trim() || nomePadrao(),
        codigoAlianca: codigo,
        resumo: (resumo as ResumoCidadela | undefined) ?? null,
      })
      .returning();
    player = criado;
    req.log.info({ deviceId }, "Nova jogadora registrada");
  } else {
    const patch: Partial<typeof playersTable.$inferInsert> = {};
    if (nome != null && nome.trim() !== "") patch.nome = nome.trim();
    if (resumo != null) patch.resumo = resumo as ResumoCidadela;
    if (Object.keys(patch).length > 0) {
      const [atualizado] = await db
        .update(playersTable)
        .set(patch)
        .where(eq(playersTable.id, player.id))
        .returning();
      player = atualizado;
    }
  }

  const data = RegistrarPerfilResponse.parse({
    deviceId: player.deviceId,
    nome: player.nome,
    codigoAlianca: player.codigoAlianca,
    temAliada: await temAliada(player.id),
    limiteEnvioDiario: LIMITE_ENVIO_DIARIO,
    enviadoHoje: player.dataEnvio === hojeStr() ? player.enviadoHoje : 0,
    taxaTorre: TAXA_TORRE,
  });
  res.json(data);
});

// ─── GET /alianca/:deviceId/aliada ─────────────────────────────────────────────
router.get("/alianca/:deviceId/aliada", async (req, res): Promise<void> => {
  const parsed = ObterAliadaParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.deviceId, parsed.data.deviceId))
    .limit(1);
  if (!player) {
    res.status(404).json({ error: "Perfil não encontrado" });
    return;
  }
  const [link] = await db
    .select()
    .from(alliancesTable)
    .where(eq(alliancesTable.playerId, player.id))
    .limit(1);
  if (!link) {
    res.status(404).json({ error: "Sem aliada" });
    return;
  }
  const [aliada] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.id, link.allyId))
    .limit(1);
  if (!aliada) {
    res.status(404).json({ error: "Sem aliada" });
    return;
  }
  const data = ObterAliadaResponse.parse({
    deviceId: aliada.deviceId,
    nome: aliada.nome,
    codigoAlianca: aliada.codigoAlianca,
    resumo: aliada.resumo ?? null,
    atualizadoEm: aliada.updatedAt,
  });
  res.json(data);
});

// ─── POST /alianca/parear ──────────────────────────────────────────────────────
router.post("/alianca/parear", async (req, res): Promise<void> => {
  const parsed = ParearAliancaBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const deviceId = parsed.data.deviceId;
  const codigo = parsed.data.codigo.trim().toUpperCase();

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.deviceId, deviceId))
    .limit(1);
  if (!player) {
    res.status(404).json({ error: "Perfil não encontrado. Reabra o jogo." });
    return;
  }
  const [alvo] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.codigoAlianca, codigo))
    .limit(1);
  if (!alvo) {
    res.status(404).json({ error: "Código de aliança não encontrado." });
    return;
  }
  if (alvo.id === player.id) {
    res.status(400).json({ error: "Você não pode se aliar a si mesma." });
    return;
  }
  if ((await temAliada(player.id)) || (await temAliada(alvo.id))) {
    res.status(409).json({ error: "Uma das jogadoras já possui uma aliança." });
    return;
  }

  await db.transaction(async (tx) => {
    await tx.insert(alliancesTable).values([
      { playerId: player.id, allyId: alvo.id },
      { playerId: alvo.id, allyId: player.id },
    ]);
  });
  req.log.info({ a: player.id, b: alvo.id }, "Aliança formada");

  const data = ParearAliancaResponse.parse({
    deviceId: alvo.deviceId,
    nome: alvo.nome,
    codigoAlianca: alvo.codigoAlianca,
    resumo: alvo.resumo ?? null,
    atualizadoEm: alvo.updatedAt,
  });
  res.json(data);
});

// ─── POST /alianca/enviar ──────────────────────────────────────────────────────
router.post("/alianca/enviar", async (req, res): Promise<void> => {
  const parsed = EnviarRecursosBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { deviceId, recursos } = parsed.data;

  const envio: ConteudoRecursos = {
    comida: Math.max(0, Math.floor(recursos.comida)),
    madeira: Math.max(0, Math.floor(recursos.madeira)),
    pedra: Math.max(0, Math.floor(recursos.pedra)),
    ferro: Math.max(0, Math.floor(recursos.ferro)),
  };
  const total = envio.comida + envio.madeira + envio.pedra + envio.ferro;
  if (total <= 0) {
    res.status(400).json({ error: "Informe ao menos um recurso para enviar." });
    return;
  }

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.deviceId, deviceId))
    .limit(1);
  if (!player) {
    res.status(404).json({ error: "Perfil não encontrado." });
    return;
  }
  const [link] = await db
    .select()
    .from(alliancesTable)
    .where(eq(alliancesTable.playerId, player.id))
    .limit(1);
  if (!link) {
    res.status(404).json({ error: "Você ainda não tem uma aliada." });
    return;
  }

  const hoje = hojeStr();
  const jaEnviado = player.dataEnvio === hoje ? player.enviadoHoje : 0;
  const restante = LIMITE_ENVIO_DIARIO - jaEnviado;
  if (total > restante) {
    res.status(400).json({
      error: `Limite diário excedido. Você ainda pode enviar ${Math.max(0, restante)} recurso(s) hoje.`,
    });
    return;
  }

  const recebido: ConteudoRecursos = {
    comida: Math.floor(envio.comida * (1 - TAXA_TORRE)),
    madeira: Math.floor(envio.madeira * (1 - TAXA_TORRE)),
    pedra: Math.floor(envio.pedra * (1 - TAXA_TORRE)),
    ferro: Math.floor(envio.ferro * (1 - TAXA_TORRE)),
  };

  await db.transaction(async (tx) => {
    await tx.insert(exchangesTable).values({
      tipo: "recursos",
      fromPlayerId: player.id,
      toPlayerId: link.allyId,
      remetenteNome: player.nome,
      conteudo: recebido,
    });
    await tx
      .update(playersTable)
      .set({ enviadoHoje: jaEnviado + total, dataEnvio: hoje })
      .where(eq(playersTable.id, player.id));
  });

  const data = EnviarRecursosResponse.parse({
    enviado: envio,
    recebidoPelaAliada: recebido,
    taxaTorre: TAXA_TORRE,
    restanteHoje: Math.max(0, restante - total),
  });
  res.json(data);
});

// ─── GET /alianca/:deviceId/caixa ──────────────────────────────────────────────
router.get("/alianca/:deviceId/caixa", async (req, res): Promise<void> => {
  const parsed = ListarCaixaParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.deviceId, parsed.data.deviceId))
    .limit(1);
  if (!player) {
    res.json(ListarCaixaResponse.parse([]));
    return;
  }
  const itens = await db
    .select()
    .from(exchangesTable)
    .where(
      and(
        eq(exchangesTable.toPlayerId, player.id),
        eq(exchangesTable.status, "pendente"),
      ),
    );

  const data = ListarCaixaResponse.parse(itens.map(mapExchange));
  res.json(data);
});

// ─── POST /alianca/receber ─────────────────────────────────────────────────────
router.post("/alianca/receber", async (req, res): Promise<void> => {
  const parsed = ReceberItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { deviceId, exchangeId } = parsed.data;

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.deviceId, deviceId))
    .limit(1);
  if (!player) {
    res.status(404).json({ error: "Perfil não encontrado." });
    return;
  }

  const [item] = await db
    .update(exchangesTable)
    .set({ status: "recebido", receivedAt: new Date() })
    .where(
      and(
        eq(exchangesTable.id, exchangeId),
        eq(exchangesTable.toPlayerId, player.id),
        eq(exchangesTable.status, "pendente"),
      ),
    )
    .returning();

  if (!item) {
    res.status(404).json({ error: "Item não encontrado ou já recebido." });
    return;
  }

  const mapped = mapExchange(item);
  const data = ReceberItemResponse.parse({
    id: mapped.id,
    tipo: mapped.tipo,
    remetenteNome: mapped.remetenteNome,
    recursos: mapped.recursos,
    morador: mapped.morador,
    prazoDias: mapped.prazoDias,
    morreu: mapped.morreu,
  });
  res.json(data);
});

// ─── POST /alianca/emprestar — emprestar um morador à aliada por um prazo ───────
router.post("/alianca/emprestar", async (req, res): Promise<void> => {
  const parsed = EmprestarMoradorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { deviceId, morador, prazoDias } = parsed.data;

  const prazo = Math.floor(prazoDias);
  if (prazo < PRAZO_MIN_DIAS || prazo > PRAZO_MAX_DIAS) {
    res.status(400).json({
      error: `O prazo deve ficar entre ${PRAZO_MIN_DIAS} e ${PRAZO_MAX_DIAS} dias.`,
    });
    return;
  }

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.deviceId, deviceId))
    .limit(1);
  if (!player) {
    res.status(404).json({ error: "Perfil não encontrado." });
    return;
  }
  const [link] = await db
    .select()
    .from(alliancesTable)
    .where(eq(alliancesTable.playerId, player.id))
    .limit(1);
  if (!link) {
    res.status(404).json({ error: "Você ainda não tem uma aliada." });
    return;
  }

  // Teto de empréstimos simultâneos: contam os itens de ida ainda não devolvidos
  // (aguardando recebimento ou já em uso na aliada).
  const ativos = await db
    .select({ id: exchangesTable.id })
    .from(exchangesTable)
    .where(
      and(
        eq(exchangesTable.fromPlayerId, player.id),
        eq(exchangesTable.tipo, "emprestimo"),
        inArray(exchangesTable.status, ["pendente", "recebido"]),
      ),
    );
  if (ativos.length >= LIMITE_EMPRESTIMOS) {
    res.status(400).json({
      error: `Você já tem ${ativos.length} morador(es) emprestado(s) (limite ${LIMITE_EMPRESTIMOS}).`,
    });
    return;
  }

  const [criado] = await db
    .insert(exchangesTable)
    .values({
      tipo: "emprestimo",
      fromPlayerId: player.id,
      toPlayerId: link.allyId,
      remetenteNome: player.nome,
      morador: morador as MoradorPayload,
      prazoDias: prazo,
    })
    .returning();

  req.log.info({ from: player.id, to: link.allyId, prazo }, "Morador emprestado");

  const data = EmprestarMoradorResponse.parse({
    id: criado.id,
    prazoDias: prazo,
    emprestimosAtivos: ativos.length + 1,
    limiteEmprestimos: LIMITE_EMPRESTIMOS,
  });
  res.json(data);
});

// ─── POST /alianca/reforcar — enviar um morador de reforço à aliada ─────────────
// Espelha /alianca/emprestar, mas sem prazo em dias: o reforço participa de UMA
// expedição da aliada e depois retorna. A troca é criada com tipo "reforco".
router.post("/alianca/reforcar", async (req, res): Promise<void> => {
  const parsed = ReforcarMoradorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { deviceId, morador } = parsed.data;

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.deviceId, deviceId))
    .limit(1);
  if (!player) {
    res.status(404).json({ error: "Perfil não encontrado." });
    return;
  }
  const [link] = await db
    .select()
    .from(alliancesTable)
    .where(eq(alliancesTable.playerId, player.id))
    .limit(1);
  if (!link) {
    res.status(404).json({ error: "Você ainda não tem uma aliada." });
    return;
  }

  // Teto de reforços simultâneos: contam os itens de ida ainda não devolvidos
  // (aguardando recebimento ou já em uso na aliada).
  const ativos = await db
    .select({ id: exchangesTable.id })
    .from(exchangesTable)
    .where(
      and(
        eq(exchangesTable.fromPlayerId, player.id),
        eq(exchangesTable.tipo, "reforco"),
        inArray(exchangesTable.status, ["pendente", "recebido"]),
      ),
    );
  if (ativos.length >= LIMITE_REFORCOS) {
    res.status(400).json({
      error: `Você já tem ${ativos.length} reforço(s) em campo (limite ${LIMITE_REFORCOS}).`,
    });
    return;
  }

  const [criado] = await db
    .insert(exchangesTable)
    .values({
      tipo: "reforco",
      fromPlayerId: player.id,
      toPlayerId: link.allyId,
      remetenteNome: player.nome,
      morador: morador as MoradorPayload,
    })
    .returning();

  req.log.info({ from: player.id, to: link.allyId }, "Reforço enviado");

  const data = ReforcarMoradorResponse.parse({
    id: criado.id,
    reforcosAtivos: ativos.length + 1,
    limiteReforcos: LIMITE_REFORCOS,
  });
  res.json(data);
});

// ─── POST /alianca/devolver — devolver morador emprestado ao dono ───────────────
router.post("/alianca/devolver", async (req, res): Promise<void> => {
  const parsed = DevolverMoradorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { deviceId, origemExchangeId, morador, morreu } = parsed.data;

  const [player] = await db
    .select()
    .from(playersTable)
    .where(eq(playersTable.deviceId, deviceId))
    .limit(1);
  if (!player) {
    res.status(404).json({ error: "Perfil não encontrado." });
    return;
  }

  // Idempotência: só devolve se o empréstimo de origem ainda estiver "recebido"
  // e destinado a esta jogadora. A transição para "devolvido" é a fonte de verdade
  // que impede devolução duplicada por reenvio do cliente.
  const resultado = await db.transaction(async (tx) => {
    const [origem] = await tx
      .update(exchangesTable)
      .set({ status: "devolvido" })
      .where(
        and(
          eq(exchangesTable.id, origemExchangeId),
          eq(exchangesTable.toPlayerId, player.id),
          inArray(exchangesTable.tipo, ["emprestimo", "reforco"]),
          eq(exchangesTable.status, "recebido"),
        ),
      )
      .returning();

    if (!origem) return { duplicado: true as const };

    await tx.insert(exchangesTable).values({
      tipo: "retorno",
      fromPlayerId: player.id,
      toPlayerId: origem.fromPlayerId,
      remetenteNome: player.nome,
      morador: morador as MoradorPayload,
      morreu,
      origemExchangeId: origem.id,
    });
    return { duplicado: false as const };
  });

  req.log.info({ from: player.id, duplicado: resultado.duplicado, morreu }, "Morador devolvido");

  const data = DevolverMoradorResponse.parse({
    ok: true,
    duplicado: resultado.duplicado,
  });
  res.json(data);
});

export default router;
