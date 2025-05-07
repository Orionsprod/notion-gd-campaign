import { GoogleSpreadsheet } from "https://esm.sh/google-spreadsheet@3.3.0";
import { GOOGLE_SERVICE_ACCOUNT_JSON, GOOGLE_SHEET_ID } from "./utils/config.ts";

export async function getGoogleSheet(): Promise<GoogleSpreadsheet> {
  if (!GOOGLE_SERVICE_ACCOUNT_JSON || !GOOGLE_SHEET_ID) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_JSON or GOOGLE_SHEET_ID environment variable.");
  }

  const creds = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
  const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo();
  return doc;
}
