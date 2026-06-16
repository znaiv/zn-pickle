import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { Suspense } from "react";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

