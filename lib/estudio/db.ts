/** docs: docs/07-estudio.md */
import { Pool, type QueryResultRow } from "pg";

/**
 * A ligação à base de dados do Estúdio.
 *
 * **É preguiçosa de propósito.** Nada liga a coisa nenhuma ao importar este
 * módulo — só quando alguém corre mesmo uma consulta. Isto não é higiene, é o
 * que mantém o CI verde: o workflow corre sem segredos nenhuns e faz `npm run
 * build` mais um teste de fumo às páginas. Se este ficheiro exigisse a variável
 * ao ser importado, o build partia-se no GitHub e o site deixava de compilar
 * por causa de uma página que nem sequer é pública.
 *
 * Pela mesma razão, `requerSessao()` (lib/estudio/sessao.ts) despacha quem não
 * traz cookie **antes** de chegar aqui.
 */

/* Em desenvolvimento o Next recarrega os módulos a cada alteração, e cada
   recarga criava um `Pool` novo — ao fim de meia hora de trabalho eram dezenas
   de ligações abertas contra a mesma base. Pendurar no `globalThis` sobrevive à
   recarga; em produção o módulo carrega uma vez e isto não custa nada. */
const global = globalThis as typeof globalThis & { poolEstudio?: Pool };

function stringDeLigacao(): string {
  /* A Vercel injeta `POSTGRES_URL`; em local usa-se `DATABASE_URL` no
     `.env.local`. Aceitam-se as duas para ninguém ter de traduzir nomes. */
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!url) {
    /* Erro explícito e em português, e nunca um valor por omissão que finge
       funcionar. É a mesma regra da `RESEND_API_KEY` em `app/api/contacto`. */
    throw new Error(
      "[estudio] Falta a DATABASE_URL. Copia o .env.example para .env.local e " +
        "põe lá a ligação ao Postgres. Ver docs/07-estudio.md.",
    );
  }

  return url;
}

function pool(): Pool {
  if (!global.poolEstudio) {
    global.poolEstudio = new Pool({
      connectionString: stringDeLigacao(),
      /* **Isto esteve em `1`, e era o que tornava o Estúdio lento.**

         O raciocínio original — uma ligação por instância, porque em serverless
         um pool grande multiplica-se pelo número de instâncias e esgota o
         limite da base — tinha a sua própria refutação na frase seguinte: quem
         faz o verdadeiro pooling é o `-pooler` da string de ligação. É o
         pgbouncer da Neon que protege o limite, e protege-o melhor do que nós,
         porque vê todas as instâncias e nós só vemos a nossa.

         O que o `1` fazia era pôr o `pg` a **serializar** tudo. Um
         `Promise.all` de treze consultas — que é o que o Resumo faz — tem uma
         única ligação para repartir, por isso as treze esperam à vez. O
         `Promise.all` estava escrito como paralelo e corria como um `for`.

         Medido contra a base real, as treze consultas do Resumo:

                       a frio     ligação quente
             max: 1     1612 ms        682 ms
             max: 10     454 ms        105 ms

         Dez e não treze: é um teto, não um alvo. As treze resolvem-se em duas
         idas em vez de treze — é de lá que vêm os 105 ms em vez dos 56 ms que
         um pool de treze daria — e em troca nenhuma instância abre mais do que
         dez ligações no dia em que alguém acrescentar consultas sem olhar.

         Os números são de Lisboa. Até este PR a função corria em `iad1` e a
         base em `eu-central-1`, com o Atlântico no meio a multiplicar cada uma
         destas idas por dois; quem resolve essa metade é o `vercel.json`. */
      max: 10,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
    });
  }

  return global.poolEstudio;
}

/**
 * Uma consulta. **Os valores vão sempre em `valores`, nunca interpolados no
 * texto** — é o que separa isto de uma injeção de SQL, e não há exceção
 * nenhuma que valha a pena.
 */
export async function consulta<T extends QueryResultRow>(
  texto: string,
  valores: unknown[] = [],
): Promise<T[]> {
  const resultado = await pool().query<T>(texto, valores);
  return resultado.rows;
}

/** A primeira linha, ou `null`. Para quando se procura uma coisa só. */
export async function consultaUma<T extends QueryResultRow>(
  texto: string,
  valores: unknown[] = [],
): Promise<T | null> {
  const linhas = await consulta<T>(texto, valores);
  return linhas[0] ?? null;
}
