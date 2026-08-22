"""Monta um .ico multi-resolução a partir de PNGs já redimensionados.

O `app/favicon.ico` tem de ser mesmo um ICO — um PNG com a extensão trocada
passa no Chrome e no Firefox por sniffing, mas falha no Safari e nos atalhos
do Windows. Só stdlib.

    python3 scripts/mkico.py /tmp/i16.png /tmp/i32.png /tmp/i48.png app/favicon.ico

Os PNGs de entrada saem do `sips`; ver a receita completa no doc.

docs: docs/03-simbolo-e-logotipo.md
"""
import struct, zlib, sys


def load(path):
    """Descodifica um PNG de 8 bits (RGB ou RGBA) para linhas RGBA."""
    d = open(path, "rb").read()
    if d[:8] != b"\x89PNG\r\n\x1a\n":
        sys.exit(f"{path}: não é um PNG")
    i, idat, hdr = 8, b"", None
    while i < len(d):
        ln = struct.unpack(">I", d[i:i + 4])[0]
        typ = d[i + 4:i + 8]
        if typ == b"IHDR":
            hdr = struct.unpack(">IIBBBBB", d[i + 8:i + 21])
        elif typ == b"IDAT":
            idat += d[i + 8:i + 8 + ln]
        i += 12 + ln

    w, h, depth, ctype, _, _, interlace = hdr
    if depth != 8 or interlace or ctype not in (2, 6):
        sys.exit(f"{path}: só 8 bits, RGB ou RGBA, não entrelaçado")

    bpp = 3 if ctype == 2 else 4
    raw = zlib.decompress(idat)
    stride, pos = w * bpp, 0
    prev, rows = bytearray(stride), []

    for _ in range(h):
        f = raw[pos]
        pos += 1
        line = bytearray(raw[pos:pos + stride])
        pos += stride
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0
            b = prev[x]
            c = prev[x - bpp] if x >= bpp else 0
            if f == 1:
                line[x] = (line[x] + a) & 255
            elif f == 2:
                line[x] = (line[x] + b) & 255
            elif f == 3:
                line[x] = (line[x] + (a + b) // 2) & 255
            elif f == 4:
                p = a + b - c
                pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        rows.append(bytes(line))
        prev = line

    if bpp == 3:  # normaliza para RGBA, opaco
        rows = [bytes(v for x in range(w)
                      for v in (r[x * 3], r[x * 3 + 1], r[x * 3 + 2], 255))
                for r in rows]
    return w, h, rows


def dib(w, h, rows):
    """BITMAPINFOHEADER de 32 bits + pixels BGRA de baixo para cima + máscara AND.

    A altura no header é o dobro da real: o formato conta o XOR e o AND. A
    máscara vai a zeros — a transparência real está no canal alfa.
    """
    px = bytearray()
    for r in reversed(rows):
        for x in range(w):
            red, green, blue, alpha = r[x * 4:x * 4 + 4]
            px += bytes((blue, green, red, alpha))
    mask = bytes(((w + 31) // 32) * 4 * h)
    header = struct.pack("<IiiHHIIiiII", 40, w, h * 2, 1, 32, 0,
                         len(px) + len(mask), 0, 0, 0, 0)
    return header + bytes(px) + mask


def main(sources, out):
    imgs = []
    for path in sources:
        w, h, rows = load(path)
        if w != h:
            sys.exit(f"{path}: {w}x{h} — o ícone tem de ser quadrado")
        imgs.append((w, h, dib(w, h, rows)))

    offset, dirs, blobs = 6 + 16 * len(imgs), b"", b""
    for w, h, data in imgs:
        # 0 no byte do tamanho significa 256
        dirs += struct.pack("<BBBBHHII", w % 256, h % 256, 0, 0, 1, 32,
                            len(data), offset)
        offset += len(data)
        blobs += data

    with open(out, "wb") as f:
        f.write(struct.pack("<HHH", 0, 1, len(imgs)) + dirs + blobs)

    sizes = ", ".join(f"{w}x{h}" for w, h, _ in imgs)
    print(f"{out}: {len(imgs)} tamanhos ({sizes}), {offset} bytes")
    print("confirma com: file " + out)


if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(sys.argv[1:-1], sys.argv[-1])
