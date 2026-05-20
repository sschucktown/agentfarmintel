import { loadSampleReport } from "@/lib/report/loadReport";

export default function ReportPage() {
  const report = loadSampleReport();

  return (
    <main className="report-shell">
      <header className="report-header">
        <div>
          <p className="product">Agent Farm Intel</p>
          <h1>Farm Area Action Brief</h1>
          <p>
            Agent Farm Intel monitors your farm area and turns listings, competitor visibility, reviews, and ads into weekly
            actions.
          </p>
        </div>
        <div className="meta-card">
          <span>Generated</span>
          <strong>{new Date(report.generatedAt).toLocaleString("en-US")}</strong>
        </div>
      </header>

      <section className="metric-grid" aria-label="Market metrics">
        <div>
          <span>Total listings</span>
          <strong>{report.listings.totalListings}</strong>
        </div>
        <div>
          <span>Residential</span>
          <strong>{report.listings.residentialListingCount}</strong>
        </div>
        <div>
          <span>Fresh listings</span>
          <strong>{report.listings.freshListings.length}</strong>
        </div>
        <div>
          <span>Active ads</span>
          <strong>{report.ads.activeAds}</strong>
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
