// Identidade anônima atrelada ao dispositivo (localStorage), coerente com o save
// do jogo, que também é local. O servidor só usa isto para reconhecer a jogadora.

const DEVICE_KEY = 'torre_obscura_device_id';
const NOME_KEY = 'torre_obscura_nome_cidadela';
const ATIVADA_KEY = 'torre_obscura_alianca_ativada';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

// Indica se este deviceId já foi registrado (ou está prestes a ser) no
// backend de Aliança. Usado para tornar o registro "preguiçoso": só
// criamos o player no servidor quando o jogador de fato usa a feature,
// não a cada boot do app.
export function isAllianceAtivada(): boolean {
  return localStorage.getItem(ATIVADA_KEY) === '1';
}

export function marcarAllianceAtivada(): void {
  localStorage.setItem(ATIVADA_KEY, '1');
}

export function desativarAlianca(): void {
  localStorage.removeItem(ATIVADA_KEY);
}

// Gera um novo deviceId — chamado ao iniciar novo jogo.
// O código de aliança muda, desvinculando automaticamente todas as alianças
// do ciclo anterior sem precisar de chamadas ao servidor.
export function resetDeviceId(): string {
  const id = crypto.randomUUID();
  localStorage.setItem(DEVICE_KEY, id);
  return id;
}

export function getNomeLocal(): string | null {
  return localStorage.getItem(NOME_KEY);
}

export function setNomeLocal(nome: string): void {
  localStorage.setItem(NOME_KEY, nome);
}
