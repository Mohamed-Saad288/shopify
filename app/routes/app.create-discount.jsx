import { data, useActionData } from "react-router";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  try {
console.log("CREATING DISCOUNT...");
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
      }`,
      {
        variables: {
          automaticAppDiscount: {
            title: "Bag Offer",

            functionId:
              "019f3840-3b45-71bc-90b9-6452a0514297",

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
console.log("DISCOUNT RESPONSE:", JSON.stringify(result));
    return data({
      success: true,
      result,
    });

  } catch (error) {

    console.error(
      "CREATE DISCOUNT ERROR:",
      error
    );

    return data(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
};


export default function CreateDiscount() {

  const result = useActionData();

  return (
    <s-page heading="Create Bag Offer">

      <s-section>

        <form method="post">
  <s-button type="submit">
    Create Discount
  </s-button>
</form>


        {result && (
          <s-section>
            <pre>
              {JSON.stringify(result, null, 2)}
            </pre>
          </s-section>
        )}

      </s-section>

    </s-page>
  );
}
