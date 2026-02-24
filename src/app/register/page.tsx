import { Suspense } from "react";
import AuthForm from "../components/AuthForm";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Загрузка...</div>}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
