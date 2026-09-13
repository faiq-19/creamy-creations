"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="success">
      <h1>A little pause in the kitchen.</h1>
      <p>We couldn’t load this page. Please try again in a moment.</p>
      <button className="btn" onClick={reset}>
        Try again
      </button>
    </div>
  );
}
