/** docs: docs/07-estudio.md */
import { Bloco, TopoDoBloco, Selo, Vazio } from "@/components/estudio/Bloco";
import { TerminarSessao } from "@/components/estudio/TerminarSessao";
import { TituloDaPagina } from "@/components/estudio/TituloDaPagina";
import {
  listarHistoricoDaPorta,
  listarUtilizadores,
  sessoesAbertas,
} from "@/lib/estudio/dados";
import { idDaSessaoAtual, requerSessao } from "@/lib/estudio/sessao";
import {
  chaveDoDia,
  formatarDiaCurto,
  formatarHora,
  FRASE_DA_ENTRADA,
  iniciais,
  nomeDoDia,
  type EntradaNaPorta,
} from "@/lib/estudio/tipos";
import { cn } from "@/lib/utils";

/**
 * Quem entrou no Estúdio, quando e de que aparelho — e os aparelhos que podem
 * entrar agora, cada um com o botão de terminar a sessão.
 *
 * O desenho é o da aba Sessões do painel do Café Preguiça, pedido pelo Tomás
 * (2026-10-14). Quem escreve o histórico é `lib/estudio/entradas.ts`; o que se
 * guarda, e o que não se guarda, está escrito lá.
 */

/* O histórico e a hora a que foi lido, que é o "agora" do "Hoje" e do "Ontem".
   Fora do componente, que não deve ler o relógio. */
async function lerSessoes() {
  const [entradas, abertas, pessoas, deste] = await Promise.all([
    listarHistoricoDaPorta(),
    sessoesAbertas(),
    listarUtilizadores(),
    idDaSessaoAtual(),
  ]);
  return { entradas, abertas, pessoas, deste, agora: Date.now() };
}

function porDia(entradas: EntradaNaPorta[], agora: number) {
  const grupos: { chave: string; dia: string; entradas: EntradaNaPorta[] }[] = [];
  for (const e of entradas) {
    const chave = chaveDoDia(e.quando);
    const ultimo = grupos.at(-1);
    if (ultimo?.chave === chave) ultimo.entradas.push(e);
    else grupos.push({ chave, dia: nomeDoDia(e.quando, agora), entradas: [e] });
  }
  return grupos;
}

export default async function Sessoes() {
  const utilizador = await requerSessao();
  const { entradas, abertas, pessoas, deste, agora } = await lerSessoes();

  /* A última vez que cada pessoa entrou. Só as entradas contam — um "saiu" não
     é a última vez que se esteve cá. */
  const ultimas = pessoas.map((p) => ({
    pessoa: p,
    ultima: entradas.find(
      (e) => e.githubLogin === p.githubLogin && e.como === "entrou",
    ),
  }));

  return (
    <div className="space-y-6">
      <TituloDaPagina
        sobretitulo="Quem entrou"
        titulo="Sessões"
        frase="Quem entrou no Estúdio, a que horas e de que aparelho. O aparelho é o que o próprio browser diz que é; se aparecer um que não reconheces, termina-lhe a sessão e avisa os outros."
      />

      {/* Os aparelhos que entram agora sem passar pelo GitHub — o que se
          procura quando se perdeu o telemóvel ou se entrou num computador
          emprestado. */}
      <Bloco aria-labelledby="aparelhos">
        <TopoDoBloco
          id="aparelhos"
          icone="sessoes"
          titulo="Aparelhos com sessão aberta"
          sub="Cada um entra sem pedir nada durante 30 dias. Terminar a sessão põe-no fora já."
        />
        {abertas.length === 0 ? (
          <Vazio>Nenhum aparelho tem a sessão aberta.</Vazio>
        ) : (
          <ul className="divide-y divide-border border-y border-border">
            {abertas.map((s) => {
              const este = s.id === deste;
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3.5"
                >
                  <span
                    aria-hidden
                    className="grid size-9 flex-none place-items-center rounded-full border border-border-strong bg-surface-2 text-xs font-medium"
                  >
                    {iniciais(s.nome)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-sm font-medium">
                      {s.nome}
                      {s.utilizadorId === utilizador.id ? (
                        <span className="font-normal text-muted">(tu)</span>
                      ) : null}
                      {este ? <Selo>este aparelho</Selo> : null}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {/* As sessões abertas antes de 2026-10-14 não têm o
                          aparelho anotado — a coluna nasceu nesse dia. */}
                      {s.aparelho ?? "aparelho não anotado"} · entrou{" "}
                      {nomeDoDia(s.criadaEm, agora).toLowerCase()} às{" "}
                      {formatarHora(s.criadaEm)} · até {formatarDiaCurto(s.expiraEm)}
                    </span>
                  </span>
                  <TerminarSessao sessaoId={s.id} este={este} />
                </li>
              );
            })}
          </ul>
        )}
      </Bloco>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Bloco aria-labelledby="ultima-de-cada-um">
          <TopoDoBloco
            id="ultima-de-cada-um"
            icone="clientes"
            titulo="Última entrada de cada um"
          />
          <ul className="divide-y divide-border border-y border-border">
            {ultimas.map(({ pessoa, ultima }) => (
              <li key={pessoa.id} className="flex items-center gap-3 py-3">
                <span
                  aria-hidden
                  className="grid size-8 flex-none place-items-center rounded-full border border-border-strong bg-surface-2 text-[0.6875rem] font-medium"
                >
                  {iniciais(pessoa.nome)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {pessoa.nome}
                    {pessoa.id === utilizador.id ? (
                      <span className="font-normal text-muted"> (tu)</span>
                    ) : null}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {ultima
                      ? `${nomeDoDia(ultima.quando, agora)}, ${formatarHora(ultima.quando)}${ultima.aparelho ? ` · ${ultima.aparelho}` : ""}`
                      : "ainda sem entradas anotadas"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Bloco>

        <Bloco aria-labelledby="historico">
          <TopoDoBloco
            id="historico"
            icone="relogio"
            titulo="Tudo o que aconteceu"
            sub="As entradas, as saídas, as sessões terminadas e quem tentou entrar sem estar na lista."
          />
          {entradas.length === 0 ? (
            <Vazio>
              Ainda não há nada anotado. O histórico começou a 14 de outubro de
              2026; a partir daí, cada entrada e saída aparece aqui.
            </Vazio>
          ) : (
            <div className="space-y-5">
              {porDia(entradas, agora).map(({ chave, dia, entradas: doDia }) => (
                <div key={chave}>
                  <h3 className="text-xs uppercase tracking-[0.18em] text-muted">
                    {dia}
                  </h3>
                  <ul className="mt-2 divide-y divide-border border-y border-border">
                    {doDia.map((e) => (
                      <li
                        key={e.id}
                        className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 py-2.5 text-sm"
                      >
                        <span className="w-11 flex-none font-medium tabular-nums">
                          {formatarHora(e.quando)}
                        </span>
                        <span
                          className={cn(
                            "min-w-0 flex-1",
                            e.como === "recusada" && "text-danger",
                          )}
                        >
                          {e.nome ?? `@${e.githubLogin}`}{" "}
                          <span
                            className={cn(
                              e.como === "recusada" ? "text-danger" : "text-muted",
                            )}
                          >
                            {FRASE_DA_ENTRADA[e.como]}
                          </span>
                        </span>
                        {e.aparelho ? (
                          <span className="text-xs text-muted">{e.aparelho}</span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </Bloco>
      </div>
    </div>
  );
}
