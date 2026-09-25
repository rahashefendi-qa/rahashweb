import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="eyebrow text-brass-soft">404</p>
        <h1 className="display mt-4 text-6xl">Page not found</h1>
        <p className="mt-4 text-stone">The page you&apos;re looking for has moved or no longer exists.</p>
        <Link href="/shop" className="eyebrow mt-10 inline-block border-b border-paper/40 pb-1 hover:border-paper">Browse the collection</Link>
      </div>
    </div>
  );
}
