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
      /* Uma ligação por instância. Em serverless cada invocação é o seu próprio
         processo: um pool grande aqui multiplica-se pelo número de instâncias e
         esgota o limite da base sem ninguém perceber porquê. Quem faz o
         verdadeiro pooling é o `-pooler` da string de ligação. */
      max: 1,
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
