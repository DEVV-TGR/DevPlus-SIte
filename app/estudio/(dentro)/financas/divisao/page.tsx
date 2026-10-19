/** docs: docs/07-estudio.md */
import Link from "next/link";
import { Bloco, Numero, TopoDoBloco, Vazio } from "@/components/estudio/Bloco";
import { CabecaDasFinancas } from "@/components/estudio/CabecaDasFinancas";
import {
  FormularioLevantamento,
  FormularioSocio,
} from "@/components/estudio/FormulariosDaDivisao";
import {
  apagarLevantamento,
  apagarSocio,
  criarSocio,
  registarLevantamento,
} from "@/lib/estudio/acoes";
import {
  custosDoEstudio,
  listarLevantamentos,
  listarSocios,
  projetosADividir,
} from "@/lib/estudio/dados";
import { requerSessao } from "@/lib/estudio/sessao";
import {
  contasDaDivisao,
  estaFechado,
  formatarData,
  formatarEuros,
  formatarPercentagem,
  hojeEmLisboa,
  margensDoProjeto,
  partesDoProjeto,
  type ProjetoADividir,
  type Socio,
} from "@/lib/estudio/tipos";
import { cn } from "@/lib/utils";

/**
 * De quem é o que sobra dos projetos.
 *
 * Três perguntas, por esta ordem: **quanto falta pagar a cada um** (os cartões
 * de cima), **de onde vem** (projeto a projeto), e **o que já se pagou** (os
 * levantamentos). A primeira é a que se vem cá fazer; as outras duas são o
 * porquê dela.
 *
 * **Não se chama lucro.** Isto é antes de impostos, e o docs/07 já proíbe a
 * palavra no Estúdio: é margem. **E só os projetos entregues contam para o que
 * falta pagar** — os outros aparecem à parte, a dizer que são estimativa,
 * porque o dinheiro pode já ter entrado mas o trabalho ainda pode custar mais.
 */
export default async function Divisao() {
  await requerSessao();

  const hoje = hojeEmLisboa();

  const [socios, projetos, custos, levantamentos] = await Promise.all([
    listarSocios(),
    projetosADividir(),
    custosDoEstudio(hoje),
    listarLevantamentos(),
  ]);

  const contas = contasDaDivisao(projetos, socios, custos, levantamentos);
  const fechados = projetos.filter(estaFechado);
  const emCurso = projetos.filter((p) => !estaFechado(p));
  const comLevantamentos = new Set(levantamentos.map((l) => l.socioId));

  return (
    <div className="mx-auto max-w-6xl">
      <CabecaDasFinancas atual="divisao" />

      <p className="mt-6 max-w-3xl text-sm text-muted">
        A margem de um projeto é o que o cliente pagou pelo trabalho menos o
        que se gastou nele. Alojamentos e domínios ficam de fora. A comissão de
        quem arranjou o cliente sai primeiro, e o resto divide-se em partes
        iguais, a não ser que a ficha do projeto diga outra coisa. Os custos do
        estúdio ({formatarEuros(custos)} até hoje) saem em partes iguais por
        toda a gente.
      </p>

      {socios.length === 0 ? (
        <Bloco aria-labelledby="sem-socios" className="mt-6">
          <TopoDoBloco
            id="sem-socios"
            icone="camadas"
            titulo="Quem está na divisão"
            sub="Ainda não há ninguém. Junta as pessoas que dividem a margem."
          />
          <FormularioSocio acao={criarSocio} />
        </Bloco>
      ) : (
        <>
          <section
            aria-label="Quanto falta pagar a cada um"
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {contas.map((c) => (
              <Bloco key={c.socio.id} aria-labelledby={`socio-${c.socio.id}`}>
                <h2
                  id={`socio-${c.socio.id}`}
                  className="font-display text-lg font-semibold tracking-tight"
                >
                  {c.socio.nome}
                </h2>

                <Numero
                  grande
                  rotulo={c.porPagar < 0 ? "Recebeu a mais" : "Falta pagar-lhe"}
                  valor={formatarEuros(Math.abs(c.porPagar))}
                  tom={c.porPagar > 0 ? "atencao" : undefined}
                  nota="Só dos projetos entregues"
                />

                <dl className="divide-y divide-border border-y border-border text-sm">
                  <Linha rotulo="Dos projetos entregues" valor={c.fechado} />
                  <Linha rotulo="Custos do estúdio" valor={-c.custos} />
                  <Linha rotulo="Já recebeu" valor={-c.levantado} />
                </dl>

                {emCurso.length > 0 ? (
                  <div>
                    <p className="text-xs text-primary">
                      Em desenvolvimento — estimativa
                    </p>
                    <dl className="mt-2 divide-y divide-border border-y border-border text-sm">
                      <Linha rotulo="Já entrou" valor={c.emCursoAgora} />
                      <Linha
                        rotulo="Se pagarem tudo"
                        valor={c.emCursoPrevisto}
                      />
                    </dl>
                  </div>
                ) : null}
              </Bloco>
            ))}
          </section>

          <Bloco aria-labelledby="projeto-a-projeto" className="mt-4">
            <TopoDoBloco
              id="projeto-a-projeto"
              icone="projetos"
              titulo="Projeto a projeto"
              sub="A comissão e as partes mudam-se na aba Dinheiro de cada projeto."
            />

            {projetos.length === 0 ? (
              <Vazio>
                Ainda não há projetos com dinheiro. Um projeto entra aqui mal
                tenha valor combinado ou um pagamento.
              </Vazio>
            ) : (
              <div className="space-y-8">
                {fechados.length > 0 ? (
                  <TabelaDeProjetos
                    titulo="Entregues"
                    projetos={fechados}
                    socios={socios}
                  />
                ) : null}
                {emCurso.length > 0 ? (
                  <TabelaDeProjetos
                    titulo="Em desenvolvimento — estimativa"
                    nota="O que já entrou, e por baixo quanto fica se o cliente pagar tudo o que se combinou. Pode mudar até ao projeto ser entregue."
                    projetos={emCurso}
                    socios={socios}
                    estimativa
                  />
                ) : null}
              </div>
            )}
          </Bloco>

          <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <Bloco aria-labelledby="levantamentos">
              <TopoDoBloco
                id="levantamentos"
                icone="sai"
                titulo="O que já se pagou a cada um"
                sub="Regista-se aqui cada vez que alguém recebe a sua parte."
              />

              <FormularioLevantamento
                acao={registarLevantamento}
                socios={socios}
              />

              {levantamentos.length > 0 ? (
                <ul className="divide-y divide-border border-y border-border">
                  {levantamentos.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 py-2.5">
                      <span className="w-24 shrink-0 text-sm font-medium tabular-nums">
                        {formatarEuros(l.valor)}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm">
                        {l.socioNome}
                        <span className="text-muted">
                          {" "}
                          · {formatarData(l.data)}
                          {l.notas ? ` · ${l.notas}` : ""}
                        </span>
                      </span>
                      <form action={apagarLevantamento}>
                        <input type="hidden" name="id" value={l.id} />
                        <button
                          type="submit"
                          aria-label={`Apagar o pagamento de ${formatarEuros(l.valor)} a ${l.socioNome}`}
                          className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                        >
                          Apagar
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              ) : null}
            </Bloco>

            <Bloco aria-labelledby="socios">
              <TopoDoBloco
                id="socios"
                icone="camadas"
                titulo="Quem está na divisão"
                sub="Pela ordem em que entraram. É a ordem das colunas."
              />

              <ul className="divide-y divide-border border-y border-border">
                {socios.map((s) => (
                  <li key={s.id} className="flex items-center gap-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {s.nome}
                    </span>
                    {/* Só quem não tem nada pago se apaga: o esquema recusa o
                        resto, e um botão que falha calado é pior do que não
                        haver botão. */}
                    {comLevantamentos.has(s.id) ? null : (
                      <form action={apagarSocio}>
                        <input type="hidden" name="id" value={s.id} />
                        <button
                          type="submit"
                          aria-label={`Tirar ${s.nome} da divisão`}
                          className="rounded-lg px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-2 hover:text-danger"
                        >
                          Tirar
                        </button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>

              <FormularioSocio acao={criarSocio} />
            </Bloco>
          </div>
        </>
      )}
    </div>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2">
      <dt className="text-muted">{rotulo}</dt>
      <dd className="font-medium tabular-nums">{formatarEuros(valor)}</dd>
    </div>
  );
}

/**
 * Uma tabela de projetos, com uma coluna por sócio.
 *
 * Tabela e não cartões: o que se quer é comparar a mesma coluna de cima a
 * baixo — quanto é que o Gonçalo tem de cada projeto. No telemóvel desliza para
 * o lado, em vez de empilhar e perder as colunas.
 */
function TabelaDeProjetos({
  titulo,
  nota,
  projetos,
  socios,
  estimativa = false,
}: {
  titulo: string;
  nota?: string;
  projetos: ProjetoADividir[];
  socios: Socio[];
  estimativa?: boolean;
}) {
  const linhas = projetos.map((p) => ({
    p,
    margens: margensDoProjeto(p),
    ...partesDoProjeto(p, socios),
  }));

  const totalAgora = linhas.reduce((a, l) => a + l.margens.agora, 0);
  const totalPrevisto = linhas.reduce((a, l) => a + l.margens.prevista, 0);
  const totaisAgora = socios.map((_, i) =>
    linhas.reduce((a, l) => a + l.agora[i], 0),
  );
  const totaisPrevistos = socios.map((_, i) =>
    linhas.reduce((a, l) => a + l.prevista[i], 0),
  );

  return (
    <div>
      <h3
        className={cn(
          "text-xs uppercase tracking-[0.18em]",
          estimativa ? "text-primary" : "text-muted",
        )}
      >
        {titulo}
      </h3>
      {nota ? <p className="mt-1 text-xs text-muted">{nota}</p> : null}

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted">
              <th scope="col" className="py-2 pr-3 font-normal">
                Projeto
              </th>
              <th scope="col" className="py-2 pr-3 text-right font-normal">
                Margem
              </th>
              {socios.map((s) => (
                <th
                  key={s.id}
                  scope="col"
                  className="py-2 pl-3 text-right font-normal"
                >
                  {s.nome}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {linhas.map(({ p, margens, agora, prevista }) => {
              const comissionista = p.comissao
                ? socios.find((s) => s.id === p.comissao!.socioId)
                : undefined;
              return (
                <tr key={p.id} className="align-top">
                  <th scope="row" className="py-2.5 pr-3 text-left font-normal">
                    <Link
                      href={`/estudio/projetos/${p.id}?aba=dinheiro`}
                      className="underline-offset-4 hover:underline"
                    >
                      {p.nome}
                    </Link>
                    <span className="block text-xs text-muted">
                      {formatarEuros(p.recebido)} pagos
                      {p.gastos > 0 ? ` · ${formatarEuros(p.gastos)} de gastos` : ""}
                      {comissionista && p.comissao
                        ? ` · comissão de ${formatarPercentagem(p.comissao.pct)} para ${comissionista.nome}`
                        : ""}
                      {p.partes ? " · partes à medida" : ""}
                    </span>
                  </th>
                  <Celula agora={margens.agora} prevista={estimativa ? margens.prevista : null} />
                  {socios.map((s, i) => (
                    <Celula
                      key={s.id}
                      agora={agora[i]}
                      prevista={estimativa ? prevista[i] : null}
                      fraca
                    />
                  ))}
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border-strong">
              <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                Total
              </th>
              <Celula agora={totalAgora} prevista={estimativa ? totalPrevisto : null} />
              {socios.map((s, i) => (
                <Celula
                  key={s.id}
                  agora={totaisAgora[i]}
                  prevista={estimativa ? totaisPrevistos[i] : null}
                />
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function Celula({
  agora,
  prevista,
  fraca = false,
}: {
  agora: number;
  prevista: number | null;
  fraca?: boolean;
}) {
  return (
    <td
      className={cn(
        "py-2.5 pl-3 text-right tabular-nums whitespace-nowrap",
        fraca ? "" : "font-medium",
      )}
    >
      {formatarEuros(agora)}
      {prevista !== null && prevista !== agora ? (
        <span className="block text-xs text-muted">
          até {formatarEuros(prevista)}
        </span>
      ) : null}
    </td>
  );
}
