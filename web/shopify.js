import { ApiVersion, shopifyApi } from "@shopify/shopify-api";
import { shopifyApp } from "@shopify/shopify-app-express";
import { SQLiteSessionStorage } from "@shopify/shopify-app-session-storage-sqlite";
import { restResources } from "@shopify/shopify-api/rest/admin/2023-10";

const shopify = shopifyApp({
    api: {
        apiVersion: ApiVersion.October23,
        restResources,
        billing: undefined,
    },
    auth: {
        path: "/api/auth",
        callbackPath: "/api/auth/callback",
    },
    webhooks: {
        path: "/api/webhooks",
    },
    sessionStorage: new SQLiteSessionStorage("database.sqlite"),
});

export default shopify;