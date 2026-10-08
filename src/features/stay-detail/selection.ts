/** The rooms a guest has picked, kept in the URL as `sel=roomId:count,roomId:count` so it survives refresh, sharing and the sign-in step. */
export type Selection = Record<string, number>;

export function parseSelection(raw: string | string[] | undefined): Selection {
  const text = Array.isArray(raw) ? raw[0] : raw;
  const out: Selection = {};
  for (const part of (text ?? "").split(",")) {
    const [id, n] = part.split(":");
    const count = Number(n);
    if (id && Number.isInteger(count) && count > 0 && count <= 20) out[id] = count;
  }
  return out;
}

export function serializeSelection(sel: Selection): string {
  return Object.entries(sel).filter(([, n]) => n > 0).map(([id, n]) => `${id}:${n}`).join(",");
}
