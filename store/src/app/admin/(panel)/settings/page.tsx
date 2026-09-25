import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader } from "@/components/admin/ui";
import { emailProvider } from "@/lib/email/send";
import { getSettings, parseGovernorateFees } from "@/lib/settings";
import { storageMode } from "@/lib/storage";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Settings" description="Store details, payments and delivery. Changes apply to the website immediately." />
      <SettingsForm
        initial={{
          storeName: s.storeName,
          tagline: s.tagline,
          logoUrl: s.logoUrl,
          heroImageUrl: s.heroImageUrl,
          storeEmail: s.storeEmail ?? "",
          adminEmail: s.adminEmail ?? "",
          phone: s.phone ?? "",
          whatsapp: s.whatsapp ?? "",
          currency: s.currency,
          deliveryFee: s.deliveryFee,
          governorateFees: parseGovernorateFees(s.governorateFees),
          freeDeliveryOver: s.freeDeliveryOver,
          codEnabled: s.codEnabled,
          wishMoneyEnabled: s.wishMoneyEnabled,
          wishMoneyName: s.wishMoneyName ?? "",
          wishMoneyNumber: s.wishMoneyNumber ?? "",
          wishMoneyInstructions: s.wishMoneyInstructions,
          instagramUrl: s.instagramUrl ?? "",
          facebookUrl: s.facebookUrl ?? "",
          tiktokUrl: s.tiktokUrl ?? "",
        }}
        system={{
          email: emailProvider() && process.env.EMAIL_FROM ? `${emailProvider()} · from ${process.env.EMAIL_FROM}` : null,
          storage: storageMode(),
        }}
      />
    </>
  );
}
