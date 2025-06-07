import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import GDPRWebhookHandlers from "./gdpr.js";

const PORT = parseInt(process.env.BACKEND_PORT || process.env.PORT, 10);
const STATIC_PATH =
    process.env.NODE_ENV === "production"
        ? `${process.cwd()}/frontend/dist`
        : `${process.cwd()}/frontend/`;

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

// Serve banner content via App Proxy
app.get('/banner-content', (req, res) => {
    const bannerHtml = `
    <div id="promotional-banner" style="
      background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
      color: white;
      text-align: center;
      padding: 12px;
      font-family: Arial, sans-serif;
      font-weight: bold;
      font-size: 16px;
      position: relative;
      z-index: 9999;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    ">
      🎉 Free Shipping on All Orders! 🎉
      <button onclick="document.getElementById('promotional-banner').style.display='none'" 
              style="
                background: rgba(255,255,255,0.2);
                border: none;
                color: white;
                padding: 4px 8px;
                margin-left: 15px;
                border-radius: 3px;
                cursor: pointer;
                font-size: 12px;
              ">✕</button>
    </div>
  `;

    res.setHeader('Content-Type', 'text/html');
    res.send(bannerHtml);
});

// All other GET requests
app.get("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
    return res
        .status(200)
        .set("Content-Type", "text/html")
        .send(readFileSync(join(STATIC_PATH, "index.html")));
});

app.listen(PORT);