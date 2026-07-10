/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Utilidades para la foto de perfil.
 *
 * La foto se guarda como blob real en la base (columna bytea de Supabase).
 * Para no inflar la base, antes de subir se reduce con un canvas a un
 * cuadrado chico (JPEG). En el cliente el blob se reconstruye como
 * data URL, listo para usar en <img src>.
 */

/** Lado máximo (px) de la foto ya reducida. */
const MAX_SIZE = 256;
/** Calidad JPEG del recorte. */
const QUALITY = 0.85;

/**
 * Lee un archivo de imagen, lo recorta a un cuadrado centrado y lo reduce
 * a MAX_SIZE. Devuelve un data URL JPEG ('data:image/jpeg;base64,...').
 */
export function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo cargar la imagen'));
      img.onload = () => {
        // Recorte cuadrado centrado
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas no disponible'));
          return;
        }
        ctx.drawImage(img, sx, sy, side, side, 0, 0, MAX_SIZE, MAX_SIZE);
        resolve(canvas.toDataURL('image/jpeg', QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** Separa un data URL en su MIME y su carga base64. */
export function dataUrlToParts(dataUrl: string): { mime: string; base64: string } {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) return { mime: 'image/jpeg', base64: '' };
  return { mime: match[1], base64: match[2] };
}

/**
 * Convierte una carga base64 al literal hexadecimal de bytea ('\\x...'),
 * que es el formato que Postgres/PostgREST aceptan para insertar bytes.
 */
export function base64ToByteaHex(base64: string): string {
  const bin = atob(base64);
  let hex = '\\x';
  for (let i = 0; i < bin.length; i++) {
    hex += bin.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Reconstruye un data URL a partir del valor bytea que devuelve PostgREST.
 * PostgREST serializa bytea como hex ('\\x...') por defecto; se contempla
 * también base64 por robustez. Devuelve undefined si no hay blob.
 */
export function byteaToDataUrl(
  value: string | null | undefined,
  mime: string | null | undefined
): string | undefined {
  if (!value) return undefined;
  const type = mime || 'image/jpeg';

  // Formato hex de Postgres: '\x' + pares hexadecimales
  if (value.startsWith('\\x') || value.startsWith('\\X')) {
    const hex = value.slice(2);
    let bin = '';
    for (let i = 0; i < hex.length; i += 2) {
      bin += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return `data:${type};base64,${btoa(bin)}`;
  }

  // Ya viene en base64 (algunos entornos)
  return `data:${type};base64,${value}`;
}
