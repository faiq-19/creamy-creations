import { LoginForm } from "@/components/forms";
export default function Page() {
  return (
    <div className="wrap">
      <div className="page-head text-center">
        <div className="eyebrow justify-center">Behind the bakes</div>
        <h1>Welcome back.</h1>
        <p className="muted mx-auto">Your bakery, all in one place.</p>
      </div>
      <LoginForm />
    </div>
  );
}
