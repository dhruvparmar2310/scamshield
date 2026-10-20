export default function ScanHistoryGroup({
    title,
    description,
    items,
    onDelete,
    onClear,
  }) {
    return (
      <section className="history-group">
        <div className="history-group-heading">
          <div>
            <h3>{title}</h3>
            <p>{description}</p>
          </div>
  
          <span className="history-group-count">
            {items.length} {items.length === 1 ? "scan" : "scans"}
          </span>
        </div>
  
        {items.length === 0 ? (
          <div className="scan-history-empty">
            <h4>No scans in this category yet</h4>
            <p>Your saved scan summaries will appear here.</p>
          </div>
        ) : (
          <>
            <div className="history-toolbar">
              <p>Most recent scans appear first.</p>
              <button type="button" className="scan-history-clear" onClick={onClear}>
                Clear {title.toLowerCase()}
              </button>
            </div>
  
            <div className="scan-history-list">
              {items.map((item) => (
                <article className="scan-history-item" key={item.id}>
                  <div className="scan-history-item-top">
                    <span className="scan-history-type">
                      {item.type === "url" ? "URL CHECK" : "MESSAGE SCAN"}
                    </span>
  
                    <span className="scan-history-verdict">
                      {item.verdict === "potentially_suspicious"
                        ? "Potentially suspicious"
                        : item.verdict === "needs_review"
                          ? "Needs a closer look"
                          : item.verdict === "no_obvious_indicators"
                            ? "No obvious warning signs"
                            : "Analysis complete"}
                    </span>
                  </div>
  
                  <p className="scan-history-preview">{item.preview}</p>
  
                  <div className="scan-history-meta">
                    <span>
                      Risk score: <strong>{item.riskScore}/100</strong>
                    </span>
  
                    <span>
                      {item.findings?.length || 0} findings
                    </span>
  
                    <time dateTime={item.createdAt}>
                      {new Date(item.createdAt).toLocaleString()}
                    </time>
                  </div>
  
                  {item.findings?.length > 0 && (
                    <details className="scan-history-details">
                      <summary>Review findings</summary>
  
                      <div className="scan-history-findings">
                        {item.findings.map((finding, index) => (
                          <div
                            className="scan-history-finding"
                            key={`${item.id}-${finding.type}-${index}`}
                          >
                            <strong>
                              {finding.type.replace(/_/g, " ")}
                            </strong>
  
                            <p>{finding.message}</p>
  
                            {finding.url && <code>{finding.url}</code>}
  
                            {finding.action && (
                              <p>
                                <strong>Recommended action: </strong>
                                {finding.action}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
  
                  <div className="scan-history-item-actions">
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      aria-label={`Delete ${item.type} scan`}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    );
  }