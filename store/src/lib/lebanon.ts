export const GOVERNORATES = [
  { name: "Beirut", cities: ["Achrafieh", "Hamra", "Verdun", "Ras Beirut", "Mar Mikhael", "Gemmayze", "Badaro", "Mazraa", "Tariq El Jdideh", "Ain El Mreisseh"] },
  { name: "Mount Lebanon", cities: ["Jounieh", "Jbeil (Byblos)", "Baabda", "Aley", "Chouf", "Metn", "Dbayeh", "Antelias", "Jal El Dib", "Sin El Fil", "Hazmieh", "Dekwaneh", "Bourj Hammoud", "Zalka", "Broummana", "Beit Mery", "Kaslik", "Choueifat", "Khaldeh", "Damour", "Kesrouan"] },
  { name: "North", cities: ["Tripoli", "Zgharta", "Batroun", "Koura", "Bsharri", "Minieh", "Chekka", "Amioun", "Ehden"] },
  { name: "Akkar", cities: ["Halba", "Qoubaiyat", "Bebnine", "Berkayel"] },
  { name: "Bekaa", cities: ["Zahle", "Chtaura", "Bar Elias", "Rachaya", "Joub Jannine", "Anjar", "Saghbine", "Qab Elias"] },
  { name: "Baalbek-Hermel", cities: ["Baalbek", "Hermel", "Ras Baalbek", "Deir El Ahmar"] },
  { name: "South", cities: ["Saida (Sidon)", "Tyre (Sour)", "Jezzine", "Maghdoucheh", "Ghazieh"] },
  { name: "Nabatieh", cities: ["Nabatieh", "Marjayoun", "Bint Jbeil", "Hasbaya", "Kfar Remen"] },
] as const;

export const GOVERNORATE_NAMES = GOVERNORATES.map((g) => g.name) as unknown as [string, ...string[]];

/**
 * Normalise a Lebanese phone number to +961XXXXXXX(X).
 * Accepts: 03 123 456, 3123456, 71-123-456, +961 71 123456, 00961 1 234567, 961...
 * Mobile prefixes: 3, 70, 71, 76, 78, 79, 81. Landlines: 1, 4-9 (7 digits).
 */
export function normalizeLebanesePhone(raw: string): string | null {
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("961")) digits = digits.slice(3);
  if (digits.startsWith("0")) digits = digits.slice(1);
  if (/^(70|71|76|78|79|81)\d{6}$/.test(digits)) return `+961${digits}`;
  if (/^3\d{6}$/.test(digits)) return `+961${digits}`;
  if (/^[14-9]\d{6}$/.test(digits)) return `+961${digits}`;
  return null;
}

export function formatLebanesePhone(normalized: string) {
  const local = normalized.replace(/^\+961/, "");
  if (local.length === 8) return `+961 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5)}`;
  return `+961 ${local.slice(0, 1)} ${local.slice(1, 4)} ${local.slice(4)}`;
}
