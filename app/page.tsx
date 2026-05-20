import Link from "next/link";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="product">Agent Farm Intel</p>
        <h1>Weekly farm-area intelligence for real estate agents.</h1>
        <p>
          Agent Farm Intel turns local listings, competitor visibility, reviews, and ads into a weekly action brief showing
          what changed and what to do next.
        </p>
        <Link className="button" href="/report">
          View report
        </Link>
        <p className="technical-note">Current MVP: generated from uploaded Apify JSON exports.</p>
      </section>
    </main>
  );
}
