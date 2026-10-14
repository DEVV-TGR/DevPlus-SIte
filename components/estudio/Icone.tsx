/** docs: docs/07-estudio.md */

/**
 * Os ícones do Estúdio — traço de 1.75 numa grelha de 24, sempre em
 * `currentColor`, sempre `aria-hidden`.
 *
 * Escritos à mão e não de uma biblioteca: são uma dúzia, e uma dependência para
 * uma dúzia de caminhos é mais peso no `package.json` do que neste ficheiro.
 * Quem precisar de um novo acrescenta-o aqui, no mesmo traço, e não desenha um
 * SVG solto numa página — é assim que os ícones deixam de parecer da mesma
 * família.
 *
 * Nenhum deles é o "+" da marca. O `mais` é um sinal de somar, de traço, para
 * "acrescentar"; o símbolo da DevPlus é o `Logo`, de cantos vivos, e não se
 * redesenha aqui (docs/03).
 */
const CAMINHOS = {
  resumo: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </>
  ),
  projetos: (
    <path d="M3.5 7.5a2 2 0 0 1 2-2h3.6l2 2.2h7.4a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
  ),
  clientes: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19c.6-3 2.8-4.7 5.5-4.7s4.9 1.7 5.5 4.7" />
      <path d="M15.5 5.6a3.2 3.2 0 0 1 0 5.8" />
      <path d="M17.6 14.6c1.5.7 2.6 2.2 2.9 4.4" />
    </>
  ),
  financas: (
    <>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M15.5 15h2.5" />
    </>
  ),
  seta: <path d="M7.5 16.5l9-9M9 7.5h7.5V15" />,
  voltar: <path d="M19 12H5.5M11 6.5L5.5 12l5.5 5.5" />,
  mais: <path d="M12 5v14M5 12h14" />,
  calendario: (
    <>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </>
  ),
  tarefas: (
    <>
      <path d="M4 7l1.6 1.6L8.5 5.7M4 15l1.6 1.6 2.9-2.9" />
      <path d="M11.5 7h8.5M11.5 15h8.5" />
    </>
  ),
  objetivos: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="0.6" />
    </>
  ),
  entra: <path d="M12 4.5v15M6 13.5l6 6 6-6" />,
  sai: <path d="M12 19.5v-15M6 10.5l6-6 6 6" />,
} as const;

export type NomeDoIcone = keyof typeof CAMINHOS;

export function Icone({
  nome,
  tamanho = 18,
  className,
}: {
  nome: NomeDoIcone;
  tamanho?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={tamanho}
      height={tamanho}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      {CAMINHOS[nome]}
    </svg>
  );
}
