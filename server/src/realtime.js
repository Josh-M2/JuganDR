import { createRealtime, rawSql } from "@neon/realtime/server";

export function makeRealtime(databaseUrl, secret) {
  const db = new URL(databaseUrl).pathname.slice(1);
  return createRealtime({ db, secret });
}

// These capabilities contain only status metadata. The public query is restricted
// to one verified tracking code; the dashboard query is sealed behind staff auth.
export async function sealTrackingQuery(realtime, code) {
  return realtime.seal({
    query: rawSql(
      "SELECT id, status, updated_at FROM requests WHERE tracking_code = $1",
      [code]
    ),
  });
}

export async function sealDashboardQuery(realtime) {
  return realtime.seal({
    query: rawSql("SELECT id, status, updated_at FROM requests ORDER BY requested_at DESC"),
  });
}
