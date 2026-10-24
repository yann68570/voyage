import { AuthForm } from "@/components/auth-form";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <AuthForm type="sign-up" />
    </main>
  );
}
