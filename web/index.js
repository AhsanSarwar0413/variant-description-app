// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import { VaraintDescriptionDB } from "./mongodbConfiguration.js";

import shopify from "./shopify.js";
import productCreator from "./product-creator.js";
import GDPRWebhookHandlers from "./gdpr.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend`;

const app = express();


// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: GDPRWebhookHandlers })
);


// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

const authenticateAPI = (req, res, next) => {
  if (req.baseUrl === '/api/get/variantids' || req.baseUrl === '/api/get/description') {
    return next();
  }
  return shopify.validateAuthenticatedSession()(req, res, next);
}

app.use("/api/*", authenticateAPI);
app.use("/fetch/*", shopify.validateAuthenticatedSession());

app.use(express.json());

app.use(shopify.cspHeaders());

app.get("/api/products/count", async (_req, res) => {
  const countData = await shopify.api.rest.Product.count({
    session: res.locals.shopify.session,
  });
  res.status(200).send(countData);
});


app.get("/api/create-script-tag", async (_req, res) => {
  let status = 200;
  let error = null;
  let alreadyAdded = false;
  try {
    const URL = `https://${_req.headers.host}/scripts/variants-script.js`;
    const addedTags = await shopify.api.rest.ScriptTag.all({
      session: res.locals.shopify.session,
    });

    if (addedTags?.data?.length > 0) {
      addedTags?.data?.forEach(async (scriptTag) => {
        if (scriptTag.src === URL) {
          alreadyAdded = true;
        } else {
          const deleteOtherTags = await shopify.api.rest.ScriptTag.delete({
            session: res.locals.shopify.session,
            id: scriptTag.id ?? 0,
          });
        }
      });
    }
    if (!alreadyAdded) {
      const script_tag = new shopify.api.rest.ScriptTag({ session: res.locals.shopify.session });
      script_tag.event = "onload";
      script_tag.src = URL;
      await script_tag.save({
        update: true,
      });
    }
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, AlreadyAddedScript: alreadyAdded, error });
});


app.get("/api/shop", async (_req, res) => {
  // Refer to docs: https://shopify.dev/docs/api/admin-rest/2023-01/resources/shop#resource-object
  const shopData = await shopify.api.rest.Shop.all({
    session: res.locals.shopify.session,
  });
  res.status(200).send(shopData);
});

app.get("/api/products/create", async (_req, res) => {
  let status = 200;
  let error = null;

  try {
    await productCreator(res.locals.shopify.session);
  } catch (e) {
    console.log(`Failed to process products/create: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});


app.post('/api/variant/add', async (_req, res) => {
  let status = 200;
  let error = null;
  const { variantData, variantId, description } = _req.body;
  try {
    await VaraintDescriptionDB.findOneAndUpdate(
      { variantId },
      { variantData, variantId, description },
      { upsert: true, new: true, runValidators: true },
    );
  } catch (e) {
    console.log(`Failed to process variant/add: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });
});

app.delete('/api/variant/delete', async (_req, res) => {
  let status = 200;
  let error = null;
  const { variantId } = _req.body;
  try {
    await VaraintDescriptionDB.findOneAndDelete({ variantId });
  } catch (e) {
    console.log(`Failed to process variant/delete: ${e.message}`);
    status = 500;
    error = e.message;
  }
  res.status(status).send({ success: status === 200, error });

});




app.get('/api/get/variants', async (_req, res) => {
  let status = 200;
  let error = null;
  try {
    const variants = await VaraintDescriptionDB.find();
    res.status(status).send(variants);
  } catch (e) {
    console.log(`Failed to process get/variants: ${e.message}`);
    status = 500;
    error = e.message;
    res.status(status).send({ success: status === 200, error });
  }
});

app.get('/api/get/variantids', async (_req, res) => {
  let status = 200;
  let error = null;
  try {
    const variantIds = await VaraintDescriptionDB.find().distinct('variantId');
    res.json({ variantIds: variantIds });
  } catch (e) {
    console.log(`Failed to process get/variantids: ${e.message}`);
    status = 500;
    error = e.message;
    res.status(status).send({ success: status === 200, error });
  }
});

app.get('/api/get/description', async (_req, res) => {
  let status = 200;
  let error = null;
  const { variant_id } = _req.query;
  try {
    const description = await VaraintDescriptionDB.findOne({ variantId: variant_id });
    res.json(description?.description);
  } catch (e) {
    console.log(`Failed to process get/description: ${e.message}`);
    status = 500;
    error = e.message;
    res.status(status).send({ success: status === 200, error });
  }
});


app.use(express.static('public'));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.use(serveStatic(STATIC_PATH, { index: false }));

app.listen(PORT);
