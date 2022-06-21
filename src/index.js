const http = require("http");
const url = require("url");
const querystring = require("querystring");
const { Shopify, ApiVersion } = require("@shopify/shopify-api");
require("dotenv").config();
const { API_KEY, API_SECRET_KEY, SCOPES, SHOP, HOST } = process.env;


Shopify.Context.initialize({
  API_KEY,
  API_SECRET_KEY,
  SCOPES: [SCOPES],
  HOST_NAME: HOST.replace(/https?:\/\//, ""),
  HOST_SCHEME: HOST.split("://")[0],
  IS_EMBEDDED_APP: true,
  API_VERSION: ApiVersion.April22, // all supported versions are available, as well as "unstable" and "unversioned"
});

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.

const ACTIVE_SHOPIFY_SHOPS = {};

async function onRequest(req, res) {
  const { headers, url: req_url } = req;
  const pathname = url.parse(req_url).pathname;
  const qs = String(url.parse(req_url).query);
  const query = querystring.parse(qs);

  switch (pathname) {
    case "/login":
      // process login action
      try {
        const authRoute = await Shopify.Auth.beginAuth(
          req,
          res,
          SHOP,
          "/auth/callback",
          false
        );

        res.writeHead(302, { Location: authRoute });
        res.end();
      } catch (e) {
        console.log(e);

        res.writeHead(500);
        if (e instanceof Shopify.Errors.ShopifyError) {
          res.end(e.message);
        } else {
          res.end(`Failed to complete OAuth process: ${e.message}`);
        }
      }
      break;
    // end of if (pathName === '/login')
    case "/auth/callback":
      try {
        const session = await Shopify.Auth.validateAuthCallback(
          req,
          res,
          query
        );
        ACTIVE_SHOPIFY_SHOPS[SHOP] = session.scope;

        console.log(session.accessToken);
        // all good, redirect to '/'
        const searchParams = new URLSearchParams(req.url);
        const host = searchParams.get("host");
        const shop = searchParams.get("shop");
        res.writeHead(302, { Location: `/?host=${host}&shop=${shop}` });
        res.end();
      } catch (e) {
        console.log(e);
        res.writeHead(500);
        if (e instanceof Shopify.Errors.ShopifyError) {
          res.end(e.message);
        } else {
          res.end(`Failed to complete OAuth process: ${e.message}`);
        }
      }
      break;
    // end of if (pathName === '/auth/callback'')
    default:
      // This shop hasn't been seen yet, go through OAuth to create a session
      if (ACTIVE_SHOPIFY_SHOPS[SHOP] === undefined) {
        console.log("I am here");
        // not logged in, redirect to login
        res.writeHead(302, { Location: `/login` });
        res.end();
      } else {
        res.write("Hello world!");
        // Load your app skeleton page with App Bridge, and do something amazing!
      }
      return;
  }
}

http
  .createServer(onRequest)
  .listen(3000, () => console.log("server is listening on POST: 3000"));
