"use client";

import { Button } from "@/components/ui/Button";

export default function StoreError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-x grid min-h-[70vh] place-items-center pt-24 text-center">
      <div>
        <h1 className="display text-5xl">Something went wrong</h1>
        <p className="mt-4 text-stone">Please try again. If the problem continues, contact us.</p>
        <Button className="mt-8" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
