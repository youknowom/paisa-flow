import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text">PaisaFlow</h1>
          <p className="text-text-secondary mt-2">
            Create your account and take control of your money.
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full bg-card border border-border rounded-2xl shadow-2xl",
            },
          }}
        />
      </div>
    </div>
  );
}
