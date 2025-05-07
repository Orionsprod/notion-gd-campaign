import { getSheetRows } from "../utils/google_sheets.ts";
import { findPageByName, createPageWithRelation } from "../utils/notion.ts";
import { ADSETS_DB_ID } from "../utils/config.ts";

export async function syncAdsets(campaignMap: Record<string, string>): Promise<Record<string, string>> {
  const rows = await getSheetRows("ad-account/insights/unique adsets");
  const adsetMap: Record<string, string> = {};

  for (const row of rows) {
    const name = row["adset_name"];
    const campaignName = row["campaign_name"];
    if (!name || !campaignName) continue;

    if (!adsetMap[name]) {
      const campaignId = campaignMap[campaignName];
      if (campaignId) {
        const id = await findPageByName(ADSETS_DB_ID, name) ??
                   await createPageWithRelation(ADSETS_DB_ID, { Name: name }, "Campaign", campaignId);
        adsetMap[name] = id;
      }
    }
  }

  return adsetMap;
}
