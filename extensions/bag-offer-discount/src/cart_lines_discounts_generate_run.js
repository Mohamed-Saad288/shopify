import {
  DiscountClass,
  ProductDiscountSelectionStrategy,
} from "../generated/api";

const DISCOUNT_PERCENTAGE = 15;

const GIFT_VARIANT_ID =
  "gid://shopify/ProductVariant/45733056741620";

const ELIGIBLE_PRODUCTS = [
  "gid://shopify/Product/8815981691124",
  "gid://shopify/Product/9110918627572",
  "gid://shopify/Product/8815982051572",
  "gid://shopify/Product/8815981854964",
  "gid://shopify/Product/9002111303924",
  "gid://shopify/Product/8917489418484",
  "gid://shopify/Product/7966912053492",
  "gid://shopify/Product/8815981592820",
  "gid://shopify/Product/8815981560052",
  "gid://shopify/Product/8194073428212",
  "gid://shopify/Product/8815981527284",
];

export function cartLinesDiscountsGenerateRun(input) {

  // لازم يكون Product Discount
  if (!input.discount.discountClasses.includes(DiscountClass.Product)) {
    return { operations: [] };
  }

  // لو الكيس الصغير موجود فى الكارت مفيش عرض
  const hasGiftBag = input.cart.lines.some((line) => {
    return (
      line.merchandise.__typename === "ProductVariant" &&
      line.merchandise.id === GIFT_VARIANT_ID
    );
  });

  if (hasGiftBag) {
    return { operations: [] };
  }

  // المنتجات المؤهلة فقط
  const eligibleLines = input.cart.lines.filter((line) => {
    if (line.merchandise.__typename !== "ProductVariant") {
      return false;
    }

    return ELIGIBLE_PRODUCTS.includes(line.merchandise.product.id);
  });

  if (eligibleLines.length === 0) {
    return { operations: [] };
  }

  // نفك كل Quantity إلى Units
  const units = [];

  eligibleLines.forEach((line) => {

    const unitPrice = Number(line.cost.amountPerQuantity.amount);

    for (let i = 0; i < line.quantity; i++) {
      units.push({
        lineId: line.id,
        unitPrice,
      });
    }

  });

  // أقل من قطعتين = مفيش خصم
  if (units.length < 2) {
    return { operations: [] };
  }

  // ترتيب من الأغلى للأرخص
  units.sort((a, b) => b.unitPrice - a.unitPrice);

  // لو العدد فردى نشيل أغلى قطعة
  if (units.length % 2 === 1) {
    units.shift();
  }

  // نجمع عدد القطع اللى هيتطبق عليها الخصم لكل Line
  const lineDiscounts = {};

  units.forEach((unit) => {

    if (!lineDiscounts[unit.lineId]) {
      lineDiscounts[unit.lineId] = 0;
    }

    lineDiscounts[unit.lineId]++;

  });

  const candidates = Object.entries(lineDiscounts).map(
    ([lineId, quantity]) => ({
      targets: [
        {
          cartLine: {
            id: lineId,
            quantity,
          },
        },
      ],
      value: {
        percentage: {
          value: DISCOUNT_PERCENTAGE,
        },
      },
      message: "15% Bag Offer",
    })
  );

  return {
    operations: [
      {
        productDiscountsAdd: {
          candidates,
          selectionStrategy:
          ProductDiscountSelectionStrategy.All,
        },
      },
    ],
  };
}
