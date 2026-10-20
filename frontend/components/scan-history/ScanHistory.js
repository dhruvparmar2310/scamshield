
import { useCallback, useEffect, useState } from "react";
import {
    clearScanType,
    deleteScan,
    getScanHistory,
  } from "../../services/scanHistory";
import ScanHistoryGroup from "./ScanHistoryGroup";

export default function ScanHistory() {
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);

  const refreshHistory = useCallback(() => {
    const history = getScanHistory();

    // Always keep items as an array.
    setItems(Array.isArray(history) ? history : []);
  }, []);

  useEffect(() => {
    refreshHistory();
    setReady(true);
  }, [refreshHistory]);

  function handleDelete(id) {
    deleteScan(id);
    refreshHistory();
  }

  function handleClearType(type) {
    const remaining = clearScanType(type);
    setItems(Array.isArray(remaining) ? remaining : []);
  }

  const messageItems = items.filter(
    (item) => item.type === "message"
  );

  const urlItems = items.filter(
    (item) => item.type === "url"
  );

  if (!ready) {
    return (
      <div className="history-groups">
        <p className="scan-history-empty">Loading history...</p>
      </div>
    );
  }

  return (
    <div className="history-groups">
      <ScanHistoryGroup
        title="Message Scans"
        description="Previously analyzed messages and their findings."
        items={messageItems}
        onDelete={handleDelete}
        onClear={() => handleClearType("message")}
      />

      <ScanHistoryGroup
        title="URL Scans"
        description="Previously checked URLs and their findings."
        items={urlItems}
        onDelete={handleDelete}
        onClear={() => handleClearType("url")}
      />
    </div>
  );
}
