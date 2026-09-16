"""Leva as ilustrações do protótipo a um peso servível, sem perder o alfa.

As PNG saem do recorte com ~800KB cada, e nove delas eram 6,5MB antes de a
página pintar. WebP com alfa fica em ~10% disso e é suportado em todo o lado
que nos interessa. JPEG não serve: mataria a transparência, que é a razão de
as ilustrações assentarem no fundo da secção em vez de aterrarem numa caixa.

Uso:  python3 scripts/otimizar-ilustra.py <ficheiro.png> [largura]
"""
import sys, os
from PIL import Image

LARGURAS = {"boneco": 1100}   # o do hero é o único que aparece grande
PADRAO = 760


def otimiza(caminho):
    nome = os.path.splitext(os.path.basename(caminho))[0]
    alvo = LARGURAS.get(nome, PADRAO)
    im = Image.open(caminho).convert("RGBA")
    if im.width > alvo:
        im = im.resize((alvo, round(im.height * alvo / im.width)), Image.LANCZOS)
    saida = os.path.splitext(caminho)[0] + ".webp"
    im.save(saida, "WEBP", quality=86, method=6, alpha_quality=92)
    antes, depois = os.path.getsize(caminho), os.path.getsize(saida)
    os.remove(caminho)
    return nome, antes, depois


if __name__ == "__main__":
    tot_a = tot_d = 0
    for c in sys.argv[1:]:
        nome, a, d = otimiza(c)
        tot_a += a; tot_d += d
        print(f"  {nome:<20} {a/1024:>7.0f} KB -> {d/1024:>6.0f} KB")
    if tot_a:
        print(f"  {'TOTAL':<20} {tot_a/1024:>7.0f} KB -> {tot_d/1024:>6.0f} KB "
              f"({100 - 100*tot_d/tot_a:.1f}% menos)")
