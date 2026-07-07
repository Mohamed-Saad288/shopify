import { extension, BlockStack, Text } from "@shopify/ui-extensions/admin";

export default extension(
  "admin.discount-details.function-settings.render",
  (root) => {
    const stack = root.createComponent(BlockStack);

    stack.appendChild(
      root.createComponent(Text, {
        appearance: "headingMd",
      }, "Bag Offer")
    );

    stack.appendChild(
      root.createComponent(
        Text,
        {},
        "No configuration is required."
      )
    );

    stack.appendChild(
      root.createComponent(
        Text,
        {},
        "Click Save discount to activate this automatic discount."
      )
    );

    root.appendChild(stack);
  }
);
