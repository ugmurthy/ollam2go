import { useLoaderData, type ClientLoaderFunctionArgs, useSearchParams } from "@remix-run/react";
import { getModelNames, getModels } from "~/llmapi/llama";

export async function clientLoader() {
  const models = await getModels();
  return models;
}
// Note: you do not have to set this explicitly - it is implied if there is no `loader`
clientLoader.hydrate = true;

export default function Component() {
  const models = useLoaderData(); // (2) - client data
  if (!models) return null;
  const modelnames = getModelNames()
  return (<>
    <pre>{JSON.stringify(modelnames,null,3)}</pre>
  </>)
}
