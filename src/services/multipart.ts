import { File } from "expo-file-system";

type Archivo = { campo: string; uri: string };

// Arma a mano el cuerpo multipart/form-data. El FormData de React Native
// no es compatible con expo/fetch, así que los bytes se escriben directo.
export async function buildMultipart(
  campos: Record<string, string>,
  archivo?: Archivo | null,
) {
  const boundary = `----TiendaRopa${Math.random().toString(36).slice(2)}`;
  const enc = new TextEncoder();
  const partes: Uint8Array[] = [];

  for (const [nombre, valor] of Object.entries(campos)) {
    partes.push(
      enc.encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="${nombre}"\r\n\r\n${valor}\r\n`,
      ),
    );
  }

  if (archivo) {
    const bytes = await new File(archivo.uri).bytes();
    const esPng = archivo.uri.toLowerCase().endsWith(".png");
    const tipo = esPng ? "image/png" : "image/jpeg";
    const nombre = esPng ? "foto.png" : "foto.jpg";
    partes.push(
      enc.encode(
        `--${boundary}\r\nContent-Disposition: form-data; name="${archivo.campo}"; filename="${nombre}"\r\nContent-Type: ${tipo}\r\n\r\n`,
      ),
      bytes,
      enc.encode("\r\n"),
    );
  }

  partes.push(enc.encode(`--${boundary}--\r\n`));

  const total = partes.reduce((n, p) => n + p.length, 0);
  const body = new Uint8Array(total);
  let pos = 0;
  for (const p of partes) {
    body.set(p, pos);
    pos += p.length;
  }

  return { body, contentType: `multipart/form-data; boundary=${boundary}` };
}
