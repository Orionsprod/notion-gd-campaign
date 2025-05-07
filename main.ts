// deno-lint-ignore-file no-explicit-any
import { Client } from "https://deno.land/x/notion_sdk/src/mod.ts";
import { GoogleSpreadsheet } from "https://esm.sh/google-spreadsheet@3.3.0";

// Notion API setup
const notion = new Client({ auth: Deno.env.get("NOTION_API_KEY") });
const CAMPAIGNS_DB_ID = Deno.env.get("NOTION_CAMPAIGNS_DB_ID");
const ADSETS_DB_ID = Deno.env.get("NOTION_ADSETS_DB_ID");

// Google Sheets setup
const SHEET_ID = Deno.env.get("GOOGLE_SHEET_ID");
const GOOGLE_SERVICE_ACCOUNT_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL");
const GOOGLE_PRIVATE_KEY = Deno.env.get("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n");

// Target worksheet titles
const CAMPAIGNS_SHEET_TITLE = "ad-account/insights/unique campaigns";
const ADSETS_SHEET_TITLE = "ad-account/insights/unique adsets";

// Types
interface CampaignRow {
  campaign_name: string;
}

interface AdsetRow {
  adset_name: string;
  campaign_name: string;
}

// Helper to search for existing page by name in a DB
async function findPageByName(dbId: string, name: string): Promise<string | null> {
  const response = await notion.databases.query({
    database_id: dbId,
    filter: {
      property: "Name",
      title: {
        equals: name,
      },
    },
  });
  if (response.results.length > 0) {
    return response.results[0].id;
  }
  return null;
}

// Create a new campaign page
async function createCampaign(name: string): Promise<string> {
  const res = await notion.pages.create({
    parent: { database_id: CAMPAIGNS_DB_ID },
    properties: {
      Name: { title: [{ text: { content: name } }] },
    },
  });
  return res.id;
}

// Create a new adset page with relation to campaign
async function createAdset(name: string, campaignId: string): Promise<string> {
  const res = await notion.pages.create({
    parent: { database_id: ADSETS_DB_ID },
    properties: {
      Name: { title: [{ text: { content: name } }] },
      Campaign: { relation: [{ id: campaignId }] },
    },
  });
  return res.id;
}

// Read campaigns and adsets from Google Sheets
async function readGoogleSheets(): Promise<{ campaigns: CampaignRow[]; adsets: AdsetRow[] }> {
  const doc = new GoogleSpreadsheet(SHEET_ID);
  await doc.useServiceAccountAuth({
    client_email: GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: GOOGLE_PRIVATE_KEY,
  });
  await doc.loadInfo();

  const campaignsSheet = doc.sheetsByTitle[CAMPAIGNS_SHEET_TITLE];
  const adsetsSheet = doc.sheetsByTitle[ADSETS_SHEET_TITLE];

  const campaignsRows = await campaignsSheet.getRows();
  const adsetsRows = await adsetsSheet.getRows();

  return {
    campaigns: campaignsRows.map((r: any) => ({ campaign_name: r["campaign_name"] })),
    adsets: adsetsRows.map((r: any) => ({
      adset_name: r["adset_name"],
      campaign_name: r["campaign_name"],
    })),
  };
}

// Main handler
export default async (_req: Request): Promise<Response> => {
  const { campaigns, adsets } = await readGoogleSheets();

  const campaignMap: Record<string, string> = {};
  const adsetMap: Record<string, string> = {};

  // Process campaigns
  for (const { campaign_name } of campaigns) {
    if (!campaignMap[campaign_name]) {
      const id = await findPageByName(CAMPAIGNS_DB_ID, campaign_name) ?? await createCampaign(campaign_name);
      campaignMap[campaign_name] = id;
    }
  }

  // Process adsets and relate to campaigns
  for (const { adset_name, campaign_name } of adsets) {
    if (!adsetMap[adset_name]) {
      const campaignId = campaignMap[campaign_name];
      if (campaignId) {
        const id = await findPageByName(ADSETS_DB_ID, adset_name) ?? await createAdset(adset_name, campaignId);
        adsetMap[adset_name] = id;
      }
    }
  }

  return new Response("Sync complete", { status: 200 });
};
