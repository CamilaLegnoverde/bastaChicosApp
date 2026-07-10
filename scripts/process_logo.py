#!/usr/bin/env python3
"""
Procesa la imagen del logo:
  1. Quita el fondo negro (flood-fill desde los bordes, así no borra
     zonas oscuras internas como el pelo).
  2. Recorta al contenido y lo centra en un lienzo cuadrado 1:1.
  3. Guarda el resultado en public/logo.png.

Uso:
  python3 scripts/process_logo.py <imagen-original> [tolerancia]

  tolerancia: qué tan oscuro se considera "fondo" (default 40, rango 0-255)
"""

import sys
from collections import deque
from pathlib import Path

from PIL import Image

def main() -> None:
    if len(sys.argv) < 2:
        sys.exit('Uso: process_logo.py <imagen-original> [tolerancia]')

    src_path = Path(sys.argv[1])
    tolerance = int(sys.argv[2]) if len(sys.argv) > 2 else 40
    out_path = Path(__file__).resolve().parent.parent / 'public' / 'logo.png'

    img = Image.open(src_path).convert('RGBA')
    width, height = img.size
    pixels = img.load()

    def is_dark(x: int, y: int) -> bool:
        r, g, b, _a = pixels[x, y]
        return r <= tolerance and g <= tolerance and b <= tolerance

    # Flood-fill desde todos los píxeles del borde que sean oscuros
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    for x in range(width):
        for y in (0, height - 1):
            if is_dark(x, y) and not visited[y * width + x]:
                visited[y * width + x] = 1
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if is_dark(x, y) and not visited[y * width + x]:
                visited[y * width + x] = 1
                queue.append((x, y))

    while queue:
        x, y = queue.popleft()
        r, g, b, _a = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)  # transparente
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < width and 0 <= ny < height:
                idx = ny * width + nx
                if not visited[idx] and is_dark(nx, ny):
                    visited[idx] = 1
                    queue.append((nx, ny))

    # Recortar al contenido visible y centrar en un cuadrado 1:1
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)

    side = max(img.size)
    margin = side // 12  # aire alrededor
    canvas_side = side + margin * 2
    canvas = Image.new('RGBA', (canvas_side, canvas_side), (0, 0, 0, 0))
    canvas.paste(
        img,
        ((canvas_side - img.width) // 2, (canvas_side - img.height) // 2),
        img,
    )

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path)
    print(f'✔ Logo guardado en {out_path} ({canvas_side}x{canvas_side}, 1:1)')

if __name__ == '__main__':
    main()
