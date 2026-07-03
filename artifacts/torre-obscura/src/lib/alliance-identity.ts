// Identidade anônima atrelada ao dispositivo (localStorage), coerente com o save
// do jogo, que também é local. O servidor só usa isto para reconhecer a jogadora.

const DEVICE_KEY = 'torre_obscura_device_id';
const NOME_KEY = 'torre_obscura_nome_cidadela';

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getNomeLocal(): string | null {
  return localStorage.getItem(NOME_KEY);
}

export function setNomeLocal(nome: string): void {
  localStorage.setItem(NOME_KEY, nome);
}
