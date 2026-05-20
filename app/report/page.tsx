import { loadSampleReport } from "@/lib/report/loadReport";

export default function ReportPage() {
  const report = loadSampleReport();
  const generated = new Date(report.generatedAt).toLocaleString("en-US");

  return (
    <main className="report-shell">
      <header className="report-header">
        <div>
          <p className="product">{report.config.productName}</p>
          <h1>{report.config.reportName}</h1>
          <p>
            {report.config.reportCadence} action brief for {report.config.agentAudience}.
          </p>
        </div>
        <div className="report-meta-grid">
          <div className="meta-card">
            <span>Farm area</span>
            <strong>{report.config.farmArea.label}</strong>
          </div>
          <div className="meta-card">
            <span>Generated</span>
            <strong>{generated}</strong>
          </div>
          <div className="meta-card">
            <span>Data source status</span>
            <strong>Uploaded Apify JSON exports</strong>
          </div>
        </div>
      </header>

      <section className="metric-grid" aria-label="Market metrics">
        <div>
          <span>Residential in farm ZIP</span>
          <strong>{report.listings.residentialListingCount}</strong>
        </div>
        <div>
          <span>Median price</span>
          <strong>
            {report.listings.medianResidentialPrice
              ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                  report.listings.medianResidentialPrice
                )
              : "N/A"}
          </strong>
        </div>
        <div>
          <span>Median DOM</span>
          <strong>{report.listings.medianDaysOnMarket ?? "N/A"}</strong>
        </div>
        <div>
          <span>Fresh / stale</span>
          <strong>
            {report.listings.freshListingCount} / {report.listings.staleListingCount}
          </strong>
        </div>
      </section>

      <section className="scope-strip" aria-label="Data scope">
        <div>
          <span>Raw listings loaded</span>
          <strong>{report.listings.totalRawListingsLoaded}</strong>
        </div>
        <div>
          <span>In configured farm ZIP</span>
          <strong>{report.listings.listingsInFarmZipCount}</strong>
        </div>
        <div>
          <span>Land excluded</span>
          <strong>{report.listings.landListingCount}</strong>
        </div>
        <div>
          <span>Outliers excluded</span>
          <strong>{report.listings.outliersExcludedCount}</strong>
        </div>
      </section>

      {report.sections.map((section) => (
        <section className="report-section" key={section.title}>
          <h2>{section.title}</h2>
          {section.summary ? <p className="section-summary">{section.summary}</p> : null}
          {section.bullets ? (
            <ul className="bullet-list">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
          {section.rows ? (
            section.rows.length > 0 ? (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(section.rows[0]).map((header) => (
                        <th key={header}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {section.rows.map((row, index) => (
                      <tr key={`${section.title}-${index}`}>
                        {Object.keys(section.rows?.[0] ?? {}).map((header) => (
                          <td key={header}>{String(row[header] ?? "")}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="empty">No matching records in this export.</p>
            )
          ) : null}
        </section>
      ))}
    </main>
  );
}
