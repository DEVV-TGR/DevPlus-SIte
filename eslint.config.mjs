import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Scripts das skills dos agentes: código de terceiros, que não é nosso para
    // corrigir. Sem isto o lint devolve 135 avisos que não são do site e que
    // escondem os que são — e o CI passava a correr sobre eles a cada push.
    ".claude/**",
    // Protótipos da skill scroll-craft: o motor é de terceiros e o build é
    // uma especificação visual, não código do site. Mesma razão do `.claude`.
    "scrollcraft/**",
  ]),
]);

export default eslintConfig;
