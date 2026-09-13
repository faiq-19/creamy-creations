export default function Loading() {
  return (
    <div className="wrap section" role="status" aria-label="Loading page">
      <p className="eyebrow">A LITTLE SOMETHING LOVELY IS ON ITS WAY</p>
      <div
        className="skeleton"
        style={{ height: 48, width: "60%", margin: "24px 0 32px" }}
      />
      <div className="loading-grid">
        <div className="skeleton" />
        <div className="skeleton" />
        <div className="skeleton" />
      </div>
      <span className="sr-only">Loading the next page…</span>
    </div>
  );
}
