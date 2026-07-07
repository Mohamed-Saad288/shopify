import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      shopifyFunctions(first: 20) {
        nodes {
          id
          apiType
          title
        }
      }
    }
  `);

  const result = await response.json();

  console.log(JSON.stringify(result, null, 2));

  return json(result);
};
