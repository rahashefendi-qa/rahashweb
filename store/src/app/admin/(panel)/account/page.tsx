import { PasswordForm } from "@/components/admin/PasswordForm";
import { Card, PageHeader } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const admin = await requireAdmin();
  return (
    <>
      <PageHeader title="Account" description={`Signed in as ${admin.email}`} />
      <Card title="Change password" className="max-w-lg">
        <PasswordForm />
      </Card>
      <p className="mt-6 max-w-lg text-xs text-ash">To add another admin or reset a forgotten password, run <code className="text-stone">npm run admin:create</code> on a machine connected to the database (see README).</p>
    </>
  );
}
