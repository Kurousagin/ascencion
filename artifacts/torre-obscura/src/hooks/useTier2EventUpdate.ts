import { useEffect } from "react";
import { useGame } from "../context/GameContext";
import { getDeviceId } from "../lib/alliance-identity";
import { isPushEnabled } from "../lib/push-notifications";
import { updateNextEvent } from "../lib/push-notifications";

const CONSUMPTION_PER_INHABITANT = 1.2; // Same formula as processDay

export function useTier2EventUpdate(): void {
  const { state } = useGame();

  useEffect(() => {
    if (!isPushEnabled()) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== "hidden") return;

      const deviceId = getDeviceId();
      let nextEventAt: Date | null = null;
      let nextEventText: string | null = null;

      // Priority order for events

      // 1. Pending invasion (guerraPendente)
      if (state.guerraPendente) {
        const daysUntilInvasion = state.guerraPendente.prazoResposta;
        const msPerDay = (24 * 60 * 60 * 1000) / state.velocidade;
        nextEventAt = new Date(Date.now() + daysUntilInvasion * msPerDay);
        nextEventText = `Invasão de ${state.guerraPendente.rival.nome} em até ${daysUntilInvasion} dia(s) — prepare a defesa!`;
      }
      // 2. Active war (guerra)
      else if (state.guerra) {
        nextEventAt = new Date(Date.now() + 6 * 60 * 60 * 1000); // Few hours
        nextEventText = `A guerra contra ${state.guerra.rival.nome} continua — decisões pendentes.`;
      }
      // 3. Running out of food
      else {
        const vivos = state.npcs.filter((n) => n.vivo).length;
        const consumoTotal = vivos * CONSUMPTION_PER_INHABITANT;
        const diasRestantes = Math.floor(state.recursos.comida / consumoTotal);

        if (diasRestantes > 0 && diasRestantes <= 3) {
          const msPerDay = (24 * 60 * 60 * 1000) / state.velocidade;
          nextEventAt = new Date(
            Date.now() + Math.max(1, diasRestantes) * msPerDay
          );
          nextEventText = `O estoque de comida se esgota em ${diasRestantes} dia(s).`;
        }
      }

      // Send to server
      try {
        await updateNextEvent(deviceId, nextEventAt, nextEventText);
      } catch (error) {
        console.warn("Failed to update next event:", error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [state]);
}
