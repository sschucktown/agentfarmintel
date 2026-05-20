import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="product">Agent Farm Intel</p>
        <h1>Weekly farm-area intelligence from static Apify exports.</h1>
        <p>
          This MVP turns local listing, competitor, review, and ad JSON files into a readable action brief for real estate agents.
        </p>
        <Link className="button" href="/report">
          View report
        </Link>
      </section>
    </main>
  );
}
