import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FormInput } from "../ui/formInput";
import { SubmitButton } from "../ui/submitButton";



// ─── RegisterForm ─────────────────────────────────────────────────────────────

interface ForgetPasswordFormData {
  email: string;
}

interface ForgetPasswordFormErrors {
  email?: string;
}

export function ForgetPasswordForm() {
  const [formData, setFormData] = useState<ForgetPasswordFormData>({
    email: ""
  });

  const [errors, setErrors] = useState<ForgetPasswordFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validate = (): boolean => {
    const newErrors: ForgetPasswordFormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof ForgetPasswordFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof ForgetPasswordFormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);

    // Navigate to reset password page since everything is mock right now
    navigate("/reset");
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
        Forget Password?
      </h2>

      <div className="flex flex-col gap-5">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <FormInput
            id="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={errors.email}
          />

          <SubmitButton label="Send Me Reset Link" isLoading={isLoading} loadingLabel="Sending reset link..." />
        </form>

        <p className="text-center text-sm text-gray-600">
          Remember password?{" "}
          <a
            href="/login"
            className="font-semibold text-[#E84D2A] hover:underline"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
