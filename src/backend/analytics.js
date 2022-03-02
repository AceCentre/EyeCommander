import { v4 as uuidv4 } from "uuid";
import PostHog from "posthog-node";

const getWithDefault = (store, id, defaultVal) => {
  const val = store.get(id);

  if (val === undefined) return val;

  store.set(id, defaultVal);

  return defaultVal;
};

export const setupAnalytics = (store, app, isDebug) => {
  if (isDebug) {
    return { capture: () => {}, shutdownAnalytics: () => {} };
  }

  const distinctId = getWithDefault(store, "distinctId", uuidv4());
  const version = app.getVersion();

  const client = new PostHog(
    "phc_Nlj20BgEB3vtw36wCPHFpTTVqpmvEzfD3IrG5zw7B2h",
    { flushAt: 10, flushInterval: 30000 }
  );

  const capture = (key) => {
    // If user has opted out of analytics then we bail
    const isAnalyticsAllowed = getWithDefault(
      store,
      "isAnalyticsAllowed",
      true
    );

    if (!isAnalyticsAllowed) return;

    client.capture({
      distinctId,
      event: key,
      properties: {
        version,
      },
    });
  };

  const shutdownAnalytics = () => {
    client.shutdown();
  };

  return { capture, shutdownAnalytics };
};
