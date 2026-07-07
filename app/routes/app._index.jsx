import { useEffect, useState } from "react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function Index() {
  const [status, setStatus] = useState("Creating automatic discount...");

  useEffect(() => {
    async function createDiscount() {
      try {
        const res = await fetch("/app/create-discount");
        const data = await res.json();

        console.log(data);

        if (data.success || data.data) {
          setStatus("✅ Bag Offer is ready.");
        } else if (data.errors || data.userErrors) {
          setStatus("❌ Failed to create discount.");
          console.log(data);
        } else {
          setStatus("Done.");
        }
      } catch (e) {
        console.error(e);
        setStatus("❌ Error creating discount.");
      }
    }

    createDiscount();
  }, []);

  return (
    <s-page heading="Bag Offer">
      <s-section>
        <s-paragraph>{status}</s-paragraph>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
