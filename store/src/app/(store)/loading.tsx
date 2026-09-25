export default function Loading() {
  return (
    <div className="container-x pt-32 md:pt-40" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-16 w-2/3 max-w-xl" />
      <div className="mt-12 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-[4/5]" />
            <div className="skeleton mt-4 h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );
}
