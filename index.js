const express = require("express");
const { Shopify } = require("@shopify/shopify-api");
require("dotenv").config();
const fs = require("fs");

const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET, HOST, SHOPIFY_API_SCOPES } =
  process.env;

const host = "127.0.0.1";
const PORT = 4000;

const shops = {};

Shopify.Context.initialize({
  API_KEY: SHOPIFY_API_KEY,
  API_SECRET_KEY: SHOPIFY_API_SECRET,
  SCOPES: SHOPIFY_API_SCOPES,
  HOST_NAME: HOST,
  IS_EMBEDDED_APP: true,
});

const app = express();

app.get("/", (req, res) => {
  if (shops[req.query.shop] !== undefined) {
    res.status(200).send("LIVE..");
  } else {
    console.log("i am here..");
    res.redirect(`/auth?shop=${req.query.shop}`);
  }
});

app.get("/auth", async (req, res) => {
  console.log("this is hit");
  const shop = req.query.shop;
  console.log("this is my shop", shop);
  const authRoute = await Shopify.Auth.beginAuth(
    req,
    res,
    shop,
    "/auth/callback",
    false
  );

  res.redirect(authRoute);
});

app.get("/auth/callback", async (req, res) => {
  const shopSession = await Shopify.Auth.validateAuthCallback(
    req,
    res,
    req.query
  );

  console.log("shopSession", shopSession);

  shops[shopSession.shop] = shopSession;
  //   fs.writeFile("./shopSession.json", JSON.stringify(shops), (err) => {
  //     if (err) {
  //       console.log("Something went wrong..", err);
  //     } else {
  //       console.log("Write operation successful");
  //     }
  //   });
  res.redirect(`https://${shopSession.shop}/admin/apps/0auth-flow`);
});

app.listen(PORT, () => console.log(`listening on : http://${host}:${PORT}`));
