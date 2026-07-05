import { boolean, integer, jsonb, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { playersTable } from "./players";

// ─── Tipos de conteúdo para cada tipo de troca ────────────────────────────────

// Tipo "recursos": envio de comida/madeira/pedra/ferro (já com taxa descontada).
export interface ConteudoRecursos {
  comida: number;
  madeira: number;
  pedra: number;
  ferro: number;
}

// Tipo "pedido_socorro": notificação de guerra e solicitação de ajuda.
export interface ConteudoPedidoAjuda {
  deviceIdSolicitante: string;
  rivalNome: string;
  diasRestantes: number;
}

// Snapshot completo de um morador transportado num empréstimo (ida) ou no
// retorno (volta). Carrega atributos, profissão derivada, habilidade e estado
// atual, para que a cidadela receptora possa usá-lo e devolvê-lo atualizado.
export interface MoradorPayload {
  id: string;
  nome: string;
  forca: number;
  agilidade: number;
  inteligencia: number;
  resistencia: number;
  sanidade: number;
  lealdade: number;
  fadiga: number;
  vivo: boolean;
  obscuro: boolean;
  emExpedicao: boolean;
  raridade: string;
  habilidade: string;
  posto: string | null;
}

// Caixa de trocas: itens enviados de uma jogadora para a aliada, aguardando
// serem recebidos (status pendente -> recebido).
//
// tipo:
//   'recursos'   — envio de recursos (fase 1).
//   'emprestimo' — empréstimo de um morador por um prazo (fase 2, ida).
//   'retorno'    — devolução de um morador emprestado ao dono (fase 2, volta),
//                  possivelmente marcado como morto.
export const exchangesTable = pgTable("exchanges", {
  id: serial("id").primaryKey(),
  tipo: text("tipo").notNull().default("recursos"),
  fromPlayerId: integer("from_player_id")
    .notNull()
    .references(() => playersTable.id),
  toPlayerId: integer("to_player_id")
    .notNull()
    .references(() => playersTable.id),
  // Nome do remetente denormalizado para exibição na caixa de entrada.
  remetenteNome: text("remetente_nome").notNull(),
  // Conteúdo: recursos (tipo='recursos') ou pedido de ajuda (tipo='pedido_socorro'); null para outros tipos.
  conteudo: jsonb("conteudo").$type<ConteudoRecursos | ConteudoPedidoAjuda>(),
  // Morador transportado (apenas para 'emprestimo'/'retorno').
  morador: jsonb("morador").$type<MoradorPayload>(),
  // Prazo do empréstimo em dias de jogo da cidadela receptora.
  prazoDias: integer("prazo_dias"),
  // No retorno: indica se o morador morreu enquanto estava emprestado.
  morreu: boolean("morreu").notNull().default(false),
  // Empréstimo que originou este retorno (fonte de verdade contra duplicação).
  origemExchangeId: integer("origem_exchange_id"),
  status: text("status").notNull().default("pendente"), // 'pendente' | 'recebido' | 'devolvido'
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  receivedAt: timestamp("received_at", { withTimezone: true }),
});

export type Exchange = typeof exchangesTable.$inferSelect;
export type InsertExchange = typeof exchangesTable.$inferInsert;
