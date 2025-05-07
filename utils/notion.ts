import { Client } from "https://deno.land/x/notion_sdk/src/mod.ts";
import { NOTION_API_KEY } from "./config.ts";

export const notion = new Client({ auth: NOTION_API_KEY });

export async function findPageByName(dbId: string, name: string): Promise<string | null> {
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

export async function createPage(databaseId: string, props: { Name: string }): Promise<string> {
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: { title: [{ text: { content: props.Name } }] },
    },
  });
  return response.id;
}

export async function createPageWithRelation(
  databaseId: string,
  props: { Name: string },
  relationField: string,
  relationId: string
): Promise<string> {
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: { title: [{ text: { content: props.Name } }] },
      [relationField]: { relation: [{ id: relationId }] },
    },
  });
  return response.id;
}
