"""Vetoriza o logótipo Dev+ a partir de images/Dev+-logosimples.png.

Gera o `D_PATH` de lib/brand.ts e as medidas do "+", e valida o resultado
por sobreposição (IoU) contra o bitmap original. Só stdlib — corre com
`python3 scripts/vectorizar-logo.py`.

docs: docs/03-simbolo-e-logotipo.md
"""
import zlib, struct, math, sys, os

SRC = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "images", "Dev+-logosimples.png")


# ---------- descodificar PNG (stdlib) ----------
def load(path):
    d = open(path, "rb").read()
    i, idat = 8, b""
    while i < len(d):
        ln = struct.unpack(">I", d[i:i + 4])[0]
        typ = d[i + 4:i + 8]
        data = d[i + 8:i + 8 + ln]
        i += 12 + ln
        if typ == b"IHDR":
            w, h, bd, ct = struct.unpack(">IIBB", data[:10])
        elif typ == b"IDAT":
            idat += data
    raw = zlib.decompress(idat)
    bpp, stride = 4, w * 4
    out = bytearray()
    prev = bytearray(stride)
    pos = 0
    for y in range(h):
        f = raw[pos]; pos += 1
        line = bytearray(raw[pos:pos + stride]); pos += stride
        for x in range(stride):
            a = line[x - bpp] if x >= bpp else 0
            b = prev[x]
            c = prev[x - bpp] if x >= bpp else 0
            if f == 1: line[x] = (line[x] + a) & 255
            elif f == 2: line[x] = (line[x] + b) & 255
            elif f == 3: line[x] = (line[x] + ((a + b) >> 1)) & 255
            elif f == 4:
                pa, pb, pc = abs(b - c), abs(a - c), abs(a + b - 2 * c)
                pr = a if (pa <= pb and pa <= pc) else (b if pb <= pc else c)
                line[x] = (line[x] + pr) & 255
        out += line
        prev = line
    return w, h, out


W, H, PIX = load(SRC)


def px(x, y):
    o = (y * W + x) * 4
    return PIX[o], PIX[o + 1], PIX[o + 2], PIX[o + 3]


def is_white(x, y):
    r, g, b, a = px(x, y)
    return a > 128 and r > 200 and g > 200 and b > 200


def is_orange(x, y):
    r, g, b, a = px(x, y)
    return a > 128 and r > 200 and 90 < g < 190 and b < 110


# ---------- máscara do D, com a zona tapada pelo "+" reconstruída por simetria ----------
D_X0, D_X1, D_Y0, D_Y1 = 369, 1250, 580, 1434
CY = (D_Y0 + D_Y1) / 2.0          # eixo de simetria horizontal do D
OCC_Y0, OCC_Y1, OCC_X0 = 1034, 1213, 1090   # faixa tapada pela barra horizontal do "+" (com margem p/ anti-aliasing)

mask = {}


def raw_white(x, y):
    if x < 0 or y < 0 or x >= W or y >= H:
        return False
    return is_white(x, y)


def d_mask(x, y):
    """Máscara do D. Na faixa tapada pelo '+', usa a linha espelhada."""
    if OCC_Y0 <= y <= OCC_Y1 and x >= OCC_X0:
        ym = int(round(2 * CY - y))
        return raw_white(x, ym)
    return raw_white(x, y)


# validar a hipótese de simetria em linhas visíveis
err = 0
checks = 0
for y in range(D_Y0 + 5, D_Y1 - 5, 7):
    ym = int(round(2 * CY - y))
    if not (D_Y0 <= ym <= D_Y1):
        continue
    if OCC_Y0 <= y <= OCC_Y1 or OCC_Y0 <= ym <= OCC_Y1:
        continue
    for x in range(D_X0, D_X1 + 1, 3):
        checks += 1
        if raw_white(x, y) != raw_white(x, ym):
            err += 1
print(f"simetria vertical do D: {err}/{checks} pixels divergentes "
      f"({100.0 * err / max(checks,1):.2f}%)", file=sys.stderr)


# ---------- traçado de contornos (marching squares nos cantos de pixel) ----------
def trace_contours(inside, x0, y0, x1, y1):
    """Devolve lista de polígonos fechados (coordenadas de canto de pixel)."""
    def ins(x, y):
        if x < x0 or y < y0 or x > x1 or y > y1:
            return False
        return inside(x, y)

    # arestas de fronteira: para cada pixel dentro, arestas cujo vizinho está fora
    edges = {}
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            if not ins(x, y):
                continue
            if not ins(x, y - 1): edges.setdefault((x, y), []).append(((x, y), (x + 1, y)))
            if not ins(x + 1, y): edges.setdefault((x, y), []).append(((x + 1, y), (x + 1, y + 1)))
            if not ins(x, y + 1): edges.setdefault((x, y), []).append(((x + 1, y + 1), (x, y + 1)))
            if not ins(x - 1, y): edges.setdefault((x, y), []).append(((x, y + 1), (x, y)))
    # grafo dirigido: sucessor de cada vértice
    nxt = {}
    for lst in edges.values():
        for a, b in lst:
            nxt.setdefault(a, []).append(b)
    polys = []
    used = set()
    for start in list(nxt.keys()):
        for first in nxt.get(start, []):
            if (start, first) in used:
                continue
            poly = [start]
            a, b = start, first
            while True:
                used.add((a, b))
                poly.append(b)
                cands = [c for c in nxt.get(b, []) if (b, c) not in used]
                if not cands:
                    break
                if len(cands) > 1:
                    # escolher a curva mais à esquerda para separar contornos que se tocam
                    def ang(c):
                        v1 = (b[0] - a[0], b[1] - a[1])
                        v2 = (c[0] - b[0], c[1] - b[1])
                        return math.atan2(v1[0] * v2[1] - v1[1] * v2[0], v1[0] * v2[0] + v1[1] * v2[1])
                    cands.sort(key=ang)
                nb = cands[0]
                a, b = b, nb
                if b == start:
                    break
            if len(poly) > 8:
                polys.append(poly)
    return polys


# ---------- Ramer-Douglas-Peucker ----------
def rdp(pts, eps):
    if len(pts) < 3:
        return pts
    dmax, idx = 0.0, 0
    a, b = pts[0], pts[-1]
    dx, dy = b[0] - a[0], b[1] - a[1]
    den = math.hypot(dx, dy)
    for i in range(1, len(pts) - 1):
        p = pts[i]
        d = abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / den if den else math.hypot(p[0] - a[0], p[1] - a[1])
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        return rdp(pts[:idx + 1], eps)[:-1] + rdp(pts[idx:], eps)
    return [a, b]


# ---------- ajuste de cúbicas (Schneider simplificado) ----------
def fit_cubic(pts, t1, t2, err):
    """Ajusta uma ou mais cúbicas a pts com tangentes iniciais/finais dadas."""
    if len(pts) == 2:
        d = math.dist(pts[0], pts[1]) / 3.0
        return [(pts[0],
                 (pts[0][0] + t1[0] * d, pts[0][1] + t1[1] * d),
                 (pts[1][0] + t2[0] * d, pts[1][1] + t2[1] * d),
                 pts[1])]
    u = chord_params(pts)
    bez = generate_bezier(pts, u, t1, t2)
    maxerr, split = compute_error(pts, bez, u)
    if maxerr < err:
        return [bez]
    if maxerr < err * 4:
        for _ in range(12):
            u = reparam(pts, bez, u)
            bez = generate_bezier(pts, u, t1, t2)
            maxerr, split = compute_error(pts, bez, u)
            if maxerr < err:
                return [bez]
    split = max(1, min(split, len(pts) - 2))
    tc = normalize((pts[split - 1][0] - pts[split + 1][0], pts[split - 1][1] - pts[split + 1][1]))
    left = fit_cubic(pts[:split + 1], t1, tc, err)
    right = fit_cubic(pts[split:], (-tc[0], -tc[1]), t2, err)
    return left + right


def normalize(v):
    n = math.hypot(*v)
    return (v[0] / n, v[1] / n) if n else (0.0, 0.0)


def chord_params(pts):
    u = [0.0]
    for i in range(1, len(pts)):
        u.append(u[-1] + math.dist(pts[i], pts[i - 1]))
    total = u[-1] or 1.0
    return [x / total for x in u]


def bez_at(b, t):
    mt = 1 - t
    x = (mt**3 * b[0][0] + 3 * mt * mt * t * b[1][0] + 3 * mt * t * t * b[2][0] + t**3 * b[3][0])
    y = (mt**3 * b[0][1] + 3 * mt * mt * t * b[1][1] + 3 * mt * t * t * b[2][1] + t**3 * b[3][1])
    return (x, y)


def generate_bezier(pts, u, t1, t2):
    n = len(pts)
    A = []
    for i in range(n):
        t = u[i]
        mt = 1 - t
        A.append(((t1[0] * 3 * mt * mt * t, t1[1] * 3 * mt * mt * t),
                  (t2[0] * 3 * mt * t * t, t2[1] * 3 * mt * t * t)))
    c00 = c01 = c11 = x0 = x1 = 0.0
    p0, p3 = pts[0], pts[-1]
    for i in range(n):
        a0, a1 = A[i]
        c00 += a0[0] * a0[0] + a0[1] * a0[1]
        c01 += a0[0] * a1[0] + a0[1] * a1[1]
        c11 += a1[0] * a1[0] + a1[1] * a1[1]
        t = u[i]; mt = 1 - t
        base = (p0[0] * (mt**3 + 3 * mt * mt * t) + p3[0] * (3 * mt * t * t + t**3),
                p0[1] * (mt**3 + 3 * mt * mt * t) + p3[1] * (3 * mt * t * t + t**3))
        tmp = (pts[i][0] - base[0], pts[i][1] - base[1])
        x0 += a0[0] * tmp[0] + a0[1] * tmp[1]
        x1 += a1[0] * tmp[0] + a1[1] * tmp[1]
    det = c00 * c11 - c01 * c01
    if abs(det) < 1e-12:
        d = math.dist(p0, p3) / 3.0
        a, b = d, d
    else:
        a = (x0 * c11 - x1 * c01) / det
        b = (c00 * x1 - c01 * x0) / det
    seg = math.dist(p0, p3)
    if a < 1e-6 or b < 1e-6:
        a = b = seg / 3.0
    return (p0, (p0[0] + t1[0] * a, p0[1] + t1[1] * a),
            (p3[0] + t2[0] * b, p3[1] + t2[1] * b), p3)


def compute_error(pts, bez, u):
    maxd, idx = 0.0, len(pts) // 2
    for i in range(1, len(pts) - 1):
        p = bez_at(bez, u[i])
        d = (p[0] - pts[i][0])**2 + (p[1] - pts[i][1])**2
        if d > maxd:
            maxd, idx = d, i
    return math.sqrt(maxd), idx


def reparam(pts, bez, u):
    out = []
    for i, t in enumerate(u):
        p = bez_at(bez, t)
        d1 = ((3 * (1 - t)**2 * (bez[1][0] - bez[0][0]) + 6 * (1 - t) * t * (bez[2][0] - bez[1][0]) + 3 * t * t * (bez[3][0] - bez[2][0])),
              (3 * (1 - t)**2 * (bez[1][1] - bez[0][1]) + 6 * (1 - t) * t * (bez[2][1] - bez[1][1]) + 3 * t * t * (bez[3][1] - bez[2][1])))
        d2 = ((6 * (1 - t) * (bez[2][0] - 2 * bez[1][0] + bez[0][0]) + 6 * t * (bez[3][0] - 2 * bez[2][0] + bez[1][0])),
              (6 * (1 - t) * (bez[2][1] - 2 * bez[1][1] + bez[0][1]) + 6 * t * (bez[3][1] - 2 * bez[2][1] + bez[1][1])))
        num = (p[0] - pts[i][0]) * d1[0] + (p[1] - pts[i][1]) * d1[1]
        den = d1[0]**2 + d1[1]**2 + (p[0] - pts[i][0]) * d2[0] + (p[1] - pts[i][1]) * d2[1]
        out.append(t if abs(den) < 1e-12 else min(1.0, max(0.0, t - num / den)))
    return out


def corners(poly, thresh_deg=52, win=6):
    """Índices onde a direção muda bruscamente — cantos a preservar."""
    n = len(poly)
    idx = []
    for i in range(n):
        a = poly[(i - win) % n]
        b = poly[i]
        c = poly[(i + win) % n]
        v1 = normalize((b[0] - a[0], b[1] - a[1]))
        v2 = normalize((c[0] - b[0], c[1] - b[1]))
        dot = max(-1.0, min(1.0, v1[0] * v2[0] + v1[1] * v2[1]))
        if math.degrees(math.acos(dot)) > thresh_deg:
            idx.append(i)
    # agrupar cantos adjacentes
    out = []
    for i in idx:
        if not out or i - out[-1] > win:
            out.append(i)
    return out


def poly_to_path(poly, err=1.2, rdp_eps=0.6):
    poly = poly[:-1] if poly[0] == poly[-1] else poly
    cs = corners(poly)
    if not cs:
        cs = [0]
    segs = []
    for i in range(len(cs)):
        a, b = cs[i], cs[(i + 1) % len(cs)]
        seg = poly[a:b + 1] if a < b else poly[a:] + poly[:b + 1]
        segs.append(seg)
    curves = []
    for seg in segs:
        pts = rdp(seg, rdp_eps)
        if len(pts) < 2:
            continue
        t1 = normalize((pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]))
        t2 = normalize((pts[-2][0] - pts[-1][0], pts[-2][1] - pts[-1][1]))
        curves += fit_cubic(pts, t1, t2, err)
    return curves



# ---------- ajuste de curvas ----------


def tangent(poly, i, win=14, fwd=True):
    n = len(poly)
    a = poly[i]
    b = poly[(i + win) % n] if fwd else poly[(i - win) % n]
    return normalize((b[0] - a[0], b[1] - a[1]))


def find_corners(poly, thresh_deg=40, win=18):
    n = len(poly)
    scores = []
    for i in range(n):
        v1 = normalize((poly[i][0] - poly[(i - win) % n][0], poly[i][1] - poly[(i - win) % n][1]))
        v2 = normalize((poly[(i + win) % n][0] - poly[i][0], poly[(i + win) % n][1] - poly[i][1]))
        dot = max(-1.0, min(1.0, v1[0] * v2[0] + v1[1] * v2[1]))
        scores.append(math.degrees(math.acos(dot)))
    cand = [i for i in range(n) if scores[i] > thresh_deg]
    # supressão de não-máximos por janela
    out = []
    for i in cand:
        lo, hi = i - win, i + win
        loc = [scores[j % n] for j in range(lo, hi + 1)]
        if scores[i] >= max(loc) - 1e-9:
            if not out or (i - out[-1]) > win:
                out.append(i)
    return out


def fit_ring(poly, err=0.9, sample=3):
    poly = poly[:-1] if poly[0] == poly[-1] else poly
    n = len(poly)
    cs = find_corners(poly)
    if len(cs) < 2:
        cs = [0, n // 2]
    curves = []
    for k in range(len(cs)):
        a, b = cs[k], cs[(k + 1) % len(cs)]
        idx = list(range(a, b + 1)) if a < b else list(range(a, n)) + list(range(0, b + 1))
        seg = [poly[i % n] for i in idx]
        if len(seg) < 3:
            continue
        pts = seg[::sample]
        if pts[-1] != seg[-1]:
            pts.append(seg[-1])
        t1 = tangent(poly, idx[0], win=min(14, max(3, len(seg) // 4)), fwd=True)
        t2 = tangent(poly, idx[-1] % n, win=min(14, max(3, len(seg) // 4)), fwd=False)
        curves += fit_cubic(pts, t1, t2, err)
    return curves



# ---------- executar ----------


polys = trace_contours(d_mask, D_X0 - 2, D_Y0 - 2, D_X1 + 2, D_Y1 + 2)
polys.sort(key=len, reverse=True)
polys = polys[:2]
rings = [fit_ring(p) for p in polys]
print("curvas por anel:", [len(r) for r in rings], file=sys.stderr)

SCALE = 1000.0 / (D_Y1 - D_Y0 + 1)
OX, OY = D_X0, D_Y0


def fmt(v):
    s = f"{v:.1f}"
    return s[:-2] if s.endswith(".0") else s


def X(v): return (v - OX) * SCALE
def Y(v): return (v - OY) * SCALE


def is_line(b, tol=0.9):
    p0, p1, p2, p3 = b
    dx, dy = p3[0] - p0[0], p3[1] - p0[1]
    L = math.hypot(dx, dy)
    if L < 1e-9:
        return True
    for p in (p1, p2):
        if abs(dy * p[0] - dx * p[1] + p3[0] * p0[1] - p3[1] * p0[0]) / L > tol:
            return False
    return True


def to_d(curves):
    """Emite o path. Retas consecutivas só se fundem quando são colineares —
    fundir um topo horizontal com uma haste vertical daria uma diagonal."""
    out = [f"M{fmt(X(curves[0][0][0]))} {fmt(Y(curves[0][0][1]))}"]
    start = curves[0][0]   # início da reta acumulada
    pend = None            # fim da reta acumulada

    def flush():
        nonlocal pend, start
        if pend is not None:
            out.append(f"L{fmt(X(pend[0]))} {fmt(Y(pend[1]))}")
            start = pend
            pend = None

    def collinear(a, b, c, tol=0.9):
        dx, dy = c[0] - a[0], c[1] - a[1]
        L = math.hypot(dx, dy)
        if L < 1e-9:
            return True
        return abs(dy * b[0] - dx * b[1] + c[0] * a[1] - c[1] * a[0]) / L <= tol

    for b in curves:
        if is_line(b):
            if pend is not None and not collinear(start, pend, b[3]):
                flush()
            pend = b[3]
        else:
            flush()
            out.append("C%s %s %s %s %s %s" % (fmt(X(b[1][0])), fmt(Y(b[1][1])),
                                               fmt(X(b[2][0])), fmt(Y(b[2][1])),
                                               fmt(X(b[3][0])), fmt(Y(b[3][1]))))
            start = b[3]
    flush()
    out.append("Z")
    return "".join(out)


D_PATH = "".join(to_d(r) for r in rings)

print(D_PATH)
print(f"chars={len(D_PATH)}", file=sys.stderr)


def flatten(cs, steps=20):
    return [bez_at(b, i / steps) for b in cs for i in range(steps)]


flat = [flatten(r) for r in rings]


def pin(x, y):
    ins = False
    for ring in flat:
        n = len(ring)
        for i in range(n):
            x1, y1 = ring[i]
            x2, y2 = ring[(i + 1) % n]
            if (y1 > y) != (y2 > y):
                if x1 + (y - y1) * (x2 - x1) / (y2 - y1) > x:
                    ins = not ins
    return ins


inter = union = 0
for y in range(D_Y0 - 2, D_Y1 + 3, 3):
    for x in range(D_X0 - 2, D_X1 + 3, 3):
        a = d_mask(x, y)
        b = pin(x + 0.5, y + 0.5)
        if a or b: union += 1
        if a and b: inter += 1
print(f"IoU={100 * inter / union:.3f}%", file=sys.stderr)

# geometria do "+" no mesmo sistema de coordenadas (altura do D = 1000)
PX0, PX1, PY0, PY1 = 1096, 1657 + 1, 853, 1394 + 1
VX0, VX1 = 1290, 1464 + 1
HY0, HY1 = 1041, 1206 + 1
print("\n+ no viewBox do lockup:", file=sys.stderr)
for nm, v in [("x0", PX0), ("x1", PX1), ("bar_x0", VX0), ("bar_x1", VX1)]:
    print(f"  {nm}={X(v):.1f}", file=sys.stderr)
for nm, v in [("y0", PY0), ("y1", PY1), ("bar_y0", HY0), ("bar_y1", HY1)]:
    print(f"  {nm}={Y(v):.1f}", file=sys.stderr)
print(f"  largura total do lockup = {X(1658):.1f}", file=sys.stderr)
