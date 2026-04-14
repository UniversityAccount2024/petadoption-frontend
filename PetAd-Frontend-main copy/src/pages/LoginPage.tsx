import { AuthLayout, SignInForm } from "../components/auth";
import signInHero from "../assets/signinpet.png";

export default function LoginPage() {
    return (
        <AuthLayout
            imageSrc={signInHero}
            title="Pet Adoption Made Easy & Reliable!"
            description="Human's need companionship & nature has provided us with friends in different forms & variety that we can love, cherish and get emotional support!"
        >
            <SignInForm />
        </AuthLayout>
    );
}
