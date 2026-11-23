import en, { type Dict } from "./en";
import es from "./es";
import hinglish from "./hinglish";

export type { Dict };
export type DictKey = "en" | "es" | "hinglish";

export const DICTS: Record<DictKey, Dict> = { en, es, hinglish };

export function getDict(key: DictKey): Dict {
  return DICTS[key] ?? en;
}
