import { getGoogleSheet } from "../google_auth.ts";

export async function getSheetRows(sheetTitle: string): Promise<any[]> {
  const doc = await getGoogleSheet();
  const sheet = doc.sheetsByTitle[sheetTitle];
  if (!sheet) throw new Error(`Sheet titled '${sheetTitle}' not found.`);
  const rows = await sheet.getRows();
  return rows.map((r: any) => r.toObject());
}
