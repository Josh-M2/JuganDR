import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRealtimeClient, SealedLiveQuery } from "@neon/realtime";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import { api } from "./api";

interface LiveRow {
  id: string;
  status: string;
  updated_at: Date;
}

interface LiveCapability {
  sealedQuery: SealedLiveQuery<LiveRow>;
  url: string;
}

const clients = new Map<string, ReturnType<typeof createRealtimeClient>>();
function getClient(url: string) {
  let client = clients.get(url);
  if (!client) {
    client = createRealtimeClient({ url });
    clients.set(url, client);
  }
  return client;
}

function Subscription({
  capability,
  endpoint,
  onChange,
}: {
  capability: LiveCapability;
  endpoint: string;
  onChange: () => void;
}) {
  const callback = useRef(onChange);
  callback.current = onChange;
  const refreshQuery = useCallback(
    async () => (await api<LiveCapability>(endpoint)).sealedQuery,
    [endpoint]
  );
  const { data, status, error } = useLiveQuery(capability.sealedQuery, { refreshQuery });
  useEffect(() => {
    if (data) callback.current();
  }, [data]);
  if (status === "error")
    return <p className="muted" role="status">Live updates disconnected: {error?.message}</p>;
  if (status === "stale")
    return <p className="muted" role="status">Reconnecting live updates…</p>;
  return null;
}

export default function LiveUpdates({
  endpoint,
  onChange,
}: {
  endpoint: string;
  onChange: () => void;
}) {
  const [capability, setCapability] = useState<LiveCapability | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setCapability(null);
    setError("");
    api<LiveCapability>(endpoint)
      .then((value) => { if (active) setCapability(value); })
      .catch((issue) => { if (active) setError((issue as Error).message); });
    return () => { active = false; };
  }, [endpoint]);
  if (error) return <p className="muted" role="status">{error} Reload to check for changes.</p>;
  if (!capability) return null;
  return (
    <RealtimeProvider client={getClient(capability.url)}>
      <Subscription capability={capability} endpoint={endpoint} onChange={onChange} />
    </RealtimeProvider>
  );
}
