import Link from "next/link";
export default function NotFound() {
  return (
    <div className="success">
      <h1>This little page is missing.</h1>
      <p>The link may be incorrect or no longer available.</p>
      <Link href="/" className="btn">
        Back to the bakery
      </Link>
    </div>
  );
}
