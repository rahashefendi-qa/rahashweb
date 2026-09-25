import type { Metadata } from "next";
import { CartView } from "@/components/store/CartView";

export const metadata: Metadata = { title: "Your Cart", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="container-x pt-28 md:pt-36">
      <h1 className="display text-[clamp(3rem,8vw,6rem)]">Your cart</h1>
      <CartView />
    </div>
  );
}
