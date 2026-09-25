import type { Metadata } from "next";
import { CheckoutForm } from "@/components/store/CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-x pt-28 md:pt-36">
      <p className="eyebrow text-brass-soft">Secure checkout</p>
      <h1 className="display mt-3 text-[clamp(3rem,8vw,6rem)]">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
