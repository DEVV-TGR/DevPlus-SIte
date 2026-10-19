"""Recorta o fundo branco das ilustrações para alfa.

Não se usa `colorkey`: medido nestas imagens, o fundo é `fdfefd` e os claros
*dentro* da figura são `fcfcfc`. Qualquer tolerância que apanhe um apanha o
outro, e a figura fica com buracos onde devia ter creme.

Um flood fill a partir dos quatro cantos não tem esse problema: só remove o
branco que está **ligado à borda**. O branco fechado dentro de um contorno
nunca é alcançado, e por isso sobrevive.
"""
import sys
from PIL import Image, ImageDraw, ImageFilter

SENTINELA = (255, 0, 255)   # magenta puro: não existe na paleta da marca
LIMIAR = 42                 # quão longe do branco ainda conta como fundo
LARGURA = 1400              # as originais vêm com ~2350px, o que é peso a mais


def recorta(entrada, saida):
    im = Image.open(entrada).convert("RGB")
    w, h = im.size

    # Preenche o fundo a partir dos quatro cantos. Quatro e não um: se a figura
    # tocar numa borda, o fundo fica dividido em regiões e um canto só deixava
    # metade por preencher.
    d = ImageDraw.Draw(im)
    for canto in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        if im.getpixel(canto) != SENTINELA:
            ImageDraw.floodfill(im, canto, SENTINELA, thresh=LIMIAR)

    px = im.load()
    alfa = Image.new("L", (w, h), 255)
    ap = alfa.load()
    for y in range(h):
        for x in range(w):
            if px[x, y] == SENTINELA:
                ap[x, y] = 0

    # Meio pixel de desfoque no canal alfa: sem isto a borda fica em escada,
    # que é exatamente o que denuncia um recorte feito à pressa.
    alfa = alfa.filter(ImageFilter.GaussianBlur(0.6))

    # O magenta ainda está nos pixels agora transparentes. Se ficasse, uma
    # borda semi-transparente puxaria magenta para dentro da figura.
    limpo = Image.new("RGB", (w, h), (255, 255, 255))
    limpo.paste(im, (0, 0))
    lp = limpo.load()
    for y in range(h):
        for x in range(w):
            if lp[x, y] == SENTINELA:
                lp[x, y] = (247, 242, 236)

    out = limpo.convert("RGBA")
    out.putalpha(alfa)

    if w > LARGURA:
        out = out.resize((LARGURA, round(h * LARGURA / w)), Image.LANCZOS)
    out.save(saida, optimize=True)

    opacos = sum(1 for y in range(0, out.size[1], 4)
                   for x in range(0, out.size[0], 4)
                   if out.getpixel((x, y))[3] > 8)
    total = len(range(0, out.size[1], 4)) * len(range(0, out.size[0], 4))
    return round(100 * opacos / total, 1)


if __name__ == "__main__":
    pct = recorta(sys.argv[1], sys.argv[2])
    print(f"{sys.argv[2]}  {pct}% da área ficou opaca")
