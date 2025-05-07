import { getSheetRows } from "../utils/google_sheets.ts";
import { findPageByName, createPage } from "../utils/notion.ts";
import { CAMPAIGNS_DB_ID } from "../utils/config.ts";

export async function syncCampaigns(): Promise<Record<string, string>> {
  const rows = await getSheetRows("ad-account/insights/unique campaigns");
  const campaignMap: Record<string, string> = {};

  for (const row of rows) {
    const name = row["campaign_name"];
    if (!name) continue;
    if (!campaignMap[name]) {
      const id = await findPageByName(CAMPAIGNS_DB_ID, name) ??
                 await createPage(CAMPAIGNS_DB_ID, { Name: name });
      campaignMap[name] = id;
    }
  }

  return campaignMap;
}
