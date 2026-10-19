/** docs: docs/07-estudio.md */

/**
 * "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) … Safari/604.1" →
 * "iPhone · Safari".
 *
 * É o que a aba Sessões mostra, e é o que se guarda: chega para reconhecer o
 * próprio telemóvel e para estranhar um que não se conhece. Trazido do painel
 * do Café Preguiça (`src/lib/painel/entradas.ts`), onde já provou.
 *
 * A ordem dos testes importa: o Chrome diz que é Safari, o Edge diz que é
 * Chrome, e o iPad em modo computador diz que é um Mac. Não se tenta acertar no
 * iPad disfarçado — sem JavaScript do lado do browser não há como, e "Mac ·
 * Safari" num iPad não engana ninguém que o tenha na mão.
 *
 * Não importa nada, e pode ser usado de qualquer lado.
 */
export function aparelhoDe(agente: string | null | undefined): string {
  const ua = agente ?? "";
  if (!ua) return "aparelho desconhecido";

  const sistema = /iPhone/.test(ua)
    ? "iPhone"
    : /iPad/.test(ua)
      ? "iPad"
      : /Android/.test(ua)
        ? "Android"
        : /Macintosh|Mac OS X/.test(ua)
          ? "Mac"
          : /Windows/.test(ua)
            ? "Windows"
            : /Linux|CrOS/.test(ua)
              ? "Linux"
              : null;

  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /SamsungBrowser\//.test(ua)
      ? "Samsung Internet"
      : /OPR\/|Opera/.test(ua)
        ? "Opera"
        : /Firefox\/|FxiOS\//.test(ua)
          ? "Firefox"
          : /Chrome\/|CriOS\//.test(ua)
            ? "Chrome"
            : /Safari\//.test(ua)
              ? "Safari"
              : null;

  return [sistema, browser].filter(Boolean).join(" · ") || "aparelho desconhecido";
}
