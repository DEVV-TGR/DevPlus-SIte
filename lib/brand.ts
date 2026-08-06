/** docs: docs/03-simbolo-e-logotipo.md — a geometria do logótipo é especificada aí. */

/**
 * O "+" da DevPlus, em viewBox 0 0 100 100.
 *
 * Cruz de braços iguais, barra 31 (proporção barra/vão = 0.31) e **cantos
 * vivos** — é o "+" do logótipo `images/Dev+-logosimples.png`, medido a partir
 * dele: barras de 175 e 166 px numa caixa de 562×542, ou seja 0.311 e 0.306.
 * Aqui ficam os dois iguais a 0.31 para o símbolo ser quadrado e poder rodar.
 *
 * Este `d` é copiado à mão para `app/icon.svg`, que é estático e não pode
 * importar. Ao alterá-lo, altera lá também.
 */
export const PLUS_PATH =
  "M34.5 0H65.5V34.5H100V65.5H65.5V100H34.5V65.5H0V34.5H34.5Z";

/**
 * O "D" do logótipo, em coordenadas onde a altura do "D" é 1000.
 *
 * Vetorizado a partir de `images/Dev+-logosimples.png` por
 * `scripts/vectorizar-logo.py` (99.9% de sobreposição com o original). O "D"
 * está **completo** — a parte que o "+" tapa foi reconstruída por simetria, e
 * é por isso que o "+" pode rodar por cima sem abrir buracos.
 *
 * Precisa de `fill-rule="evenodd"`: o segundo contorno é a contra-forma.
 */
export const D_PATH =
  "M0 0L466.7 0C486.8 0 515.8 -1.4 534.5 2.3C542.1 3.9 550.3 2 557.9 3.5L601.2 9.4L656.1 21.1L660.8 23.4C677.7 26.8 694 34.2 709.9 37.4C714.1 38.3 717.5 42.5 721.6 43.3L742.7 50.3C750.3 51.8 771.8 64.8 780.1 69C813.9 85.9 854.2 112.7 879.5 138L884.2 140.4L912.3 168.4L914.6 173.1L920.5 177.8L922.8 182.5L939.2 201.2L942.7 208.2C948.5 214 952 222.2 957.9 228.1C961.8 232 962.9 238.9 967.3 243.3C971.2 247.2 981.5 271.8 984.8 278.4C1002.8 314.4 1013.4 351 1021.1 389.5L1025.7 409.4L1026.9 425.7C1034.3 462.8 1034.3 537.2 1026.9 574.3L1025.7 590.6L1017.5 631.6L1009.4 662C1008 668.8 1002.5 675 1001.2 681.9C999.4 690.9 972 753.1 966.1 759.1C957.8 767.3 951.9 782.6 942.7 791.8L939.2 798.8L922.8 817.5L920.5 822.2L884.2 859.6L879.5 862C868.4 873.2 856.1 880.7 845.6 891.2C842.9 894 831.7 899.3 826.9 904.1C821.5 909.5 802 916.1 797.7 920.5C784.5 933.7 706.7 964.6 687.7 968.4L680.7 971.9L640.9 981.3L636.3 983.6L576.6 994.2C566.7 996.1 553.8 994.5 543.9 996.5C532.6 998.8 517.2 996.9 507.6 998.8C491.5 1002.1 472.8 1000 456.1 1000L0 1000L0 0ZM283 225.7L283 774.3L430.4 774.3C453.9 774.3 479.2 776.4 501.8 771.9L512.3 771.9L545 766.1L549.7 763.7L567.3 760.2C573.5 759 584.5 752.6 593 750.9C606.6 748.2 648 719.2 657.3 709.9L662 707.6L686.5 683L688.9 678.4C696.9 670.4 701.4 660 708.8 652.6C714.5 646.9 728.2 611.5 729.8 603.5L738 580.1C743.1 554.6 750.1 502.7 745 477.2L745 463.2L736.8 415.2L727.5 386C726.5 381.2 702.4 336.4 699.4 333.3L687.7 320.5L685.4 315.8L679.5 311.1L677.2 306.4L672.5 304.1L660.8 291.2L656.1 288.9L643.3 277.2L636.3 273.7C631 268.4 622.8 266.1 617.5 260.8C612.8 256.1 601.4 252.7 595.3 251.5C586.8 249.8 579.3 242.6 570.8 240.9L546.2 233.9L527.5 231.6C489.8 224 450 225.7 410.5 225.7L283 225.7Z";

/**
 * O lockup: o "D" com o "+" por cima.
 *
 * `plusPath` é o mesmo "+" do `PLUS_PATH`, mas já nas coordenadas do lockup e
 * com as medidas exatas do PNG (657.3×633.9, barras 204.7 e 194.1) em vez da
 * proporção arredondada de 0.31. Vem escrito assim, e não como um `transform`,
 * porque o Satori (cartão social) não desenha `<g transform>` de forma fiável.
 */
export const LOCKUP = {
  viewBox: "0 0 1507.6 1000",
  width: 1507.6,
  height: 1000,
  /** aspect-ratio do lockup, para quem precise de reservar espaço */
  ratio: 1.5076,
  plusPath:
    "M1077.2 319.3H1281.9V539.2H1507.6V733.3H1281.9V953.2H1077.2V733.3H850.3V539.2H1077.2Z",
} as const;

/**
 * Equivalentes hex dos tokens OKLCH, para os dois sítios que não conseguem ler
 * CSS custom properties: `app/opengraph-image.tsx` (Satori) e `app/icon.svg`.
 * Se mudares um token em `app/globals.css`, atualiza aqui — ver docs/02.
 */
export const BRAND_HEX = {
  primary: "#F2762B", // ≈ --primary  oklch(0.72 0.188 50)
  bg: "#1a1613", // ≈ --bg       oklch(0.15 0.011 56)
  ink: "#f7f2ec", // ≈ --ink      oklch(0.97 0.006 80)
  muted: "#c8bdb0", // ≈ --muted    oklch(0.77 0.012 80)
} as const;
