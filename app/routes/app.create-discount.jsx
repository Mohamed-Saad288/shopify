import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
    // Check if the discount already exists
    const existingResponse = await admin.graphql(`
      #graphql
      query {
        discountNodes(first: 50) {
          nodes {
            id
            discount {
              __typename
              ... on DiscountAutomaticApp {
                title
              }
            }
          }
        }
      }
    `);

    const existing = await existingResponse.json();

    const found = existing.data.discountNodes.nodes.find(
      (node) =>
        node.discount?.__typename === "DiscountAutomaticApp" &&
        node.discount.title === "Bag Offer"
    );

    if (found) {
      return json({
        success: true,
        message: "Bag Offer already exists.",
      });
    }

    // Create Automatic Discount
    const response = await admin.graphql(
      `#graphql
      mutation CreateAutomaticDiscount(
        $automaticAppDiscount: DiscountAutomaticAppInput!
      ) {
        discountAutomaticAppCreate(
          automaticAppDiscount: $automaticAppDiscount
        ) {
          automaticAppDiscount {
            discountId
            title
            status
          }

          userErrors {
            field
            message
          }
        }
      }
      `,
      {
        variables: {
          automaticAppDiscount: {
            title: "Bag Offer",

            // Function ID
            functionId: "019f3752-d638-74dc-9c90-4171e7d71342",

            startsAt: new Date().toISOString(),

            combinesWith: {
              productDiscounts: true,
              orderDiscounts: false,
              shippingDiscounts: false,
            },
          },
        },
      }
    );

    const result = await response.json();

    console.log(
      "CREATE DISCOUNT RESULT:",
      JSON.stringify(result, null, 2)
    );

    return json(result);
  } catch (e) {
    console.error(e);

    return json(
      {
        success: false,
        error: e.message,
      },
      {
        status: 500,
      }
    );
  }
};
