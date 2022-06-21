const Shopify = require("shopify-api-node");

const shopify = new Shopify({
  shopName: "a-new-store1096.myshopify.com",
  accessToken: "shpua_23e026176c5087f58d53f4a6bf4325f2",
});

// shopify.product
//   .list({ limit: 5 })
//   .then((products) => console.log(products))
//   .catch((err) => console.error(err));


  console.log('$$$$4444$*****************************************************');

  shopify.order
  .list({ limit: 5 })
  .then((orders) => console.log(orders))
  .catch((err) => console.error(err))
