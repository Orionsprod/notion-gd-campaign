import { syncCampaigns } from "./sync/campaigns.ts";
import { syncAdsets } from "./sync/adsets.ts";

export default async (_req: Request): Promise<Response> => {
  const campaignMap = await syncCampaigns();
  await syncAdsets(campaignMap);
  return new Response("Campaign & Adset sync complete", { status: 200 });
};
