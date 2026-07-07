import { useLoaderData, data } from "react-router";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    query {
      discountNodes(first: 10) {
        nodes {
          id
          discount {
            __typename
            ... on DiscountAutomaticApp {
              title
              status
              startsAt
            }
          }
        }
      }
    }
  `);

  const result = await response.json();

  return data({
    discounts: result.data.discountNodes.nodes,
  });
};

export default function Index() {
  const { discounts } = useLoaderData();

  return (
    <s-page heading="Bag Offer">
      <s-section>
        <s-table>
          <s-table-header-row>
            <s-table-header>Title</s-table-header>
            <s-table-header>Status</s-table-header>
            <s-table-header>Starts At</s-table-header>
          </s-table-header-row>

          {discounts.map((item) => {
            const discount = item.discount;
            if (!discount) return null;

            return (
              <s-table-row key={item.id}>
                <s-table-cell>{discount.title}</s-table-cell>
                <s-table-cell>{discount.status}</s-table-cell>
                <s-table-cell>{discount.startsAt}</s-table-cell>
              </s-table-row>
            );
          })}
        </s-table>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
