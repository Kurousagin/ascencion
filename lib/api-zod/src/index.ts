export * from "./generated/api";
export * from "./generated/types";

// Nomes que existem nos dois módulos gerados — como schema zod (valor) em
// generated/api e como tipo em generated/types. `export *` não resolve a
// ambiguidade sozinho (TS2308); re-export explícito: valor do zod, tipo do types.
export { PedirAjudaGuerraBody, ConsultarPrimordialParams } from "./generated/api";
export type { PedirAjudaGuerraBody as PedirAjudaGuerraBodyType } from "./generated/types";
export type { ConsultarPrimordialParams as ConsultarPrimordialParamsType } from "./generated/types";
