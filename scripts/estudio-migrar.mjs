#!/usr/bin/env node
/** docs: docs/07-estudio.md */

/**
 * Cria as tabelas do Estúdio a partir de `lib/estudio/schema.sql`.
 *
 *   node --env-file=.env.local scripts/estudio-migrar.mjs
 *
 * Corre-se as vezes que forem precisas: o esquema é todo `if not exists`.
 *
 * Não corre sozinho no deploy, e é de propósito — uma migração automática num
 * `next build` é a forma mais rápida de alguém apagar uma coluna sem dar por
 * isso. Quando o esquema mudar, corre-se isto à mão contra a base.
 */

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

if (!url) {
  console.error(
    "[estudio] Falta a DATABASE_URL.\n" +
      "Corre com: node --env-file=.env.local scripts/estudio-migrar.mjs",
  );
  process.exit(1);
}

const esquema = await readFile(join(raiz, "lib/estudio/schema.sql"), "utf8");
const cliente = new pg.Client({ connectionString: url });

try {
  await cliente.connect();

  /* Tudo ou nada. Se uma tabela a meio do ficheiro se recusar a nascer, não
     fica meia base criada à espera de que alguém perceba o que falta. */
  await cliente.query("begin");
  await cliente.query(esquema);
  await cliente.query("commit");

  const { rows } = await cliente.query(
    `select table_name
       from information_schema.tables
      where table_schema = 'public'
        and table_name in ('utilizadores', 'sessoes', 'clientes',
                           'projetos', 'projeto_responsaveis', 'tarefas')
      order by table_name`,
  );

  console.log("[estudio] esquema aplicado. Tabelas:");
  for (const linha of rows) console.log(`  · ${linha.table_name}`);
} catch (erro) {
  await cliente.query("rollback").catch(() => {});
  console.error("[estudio] a migração falhou:", erro.message);
  process.exitCode = 1;
} finally {
  await cliente.end();
}
