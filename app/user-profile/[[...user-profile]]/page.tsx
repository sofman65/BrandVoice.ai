import { UserProfile } from '@clerk/nextjs';
import { AuthWrapper } from "@/components/auth-wrapper";
import { brandVoiceClerkAppearance } from "@/components/clerk-appearance";

export default function UserProfilePage() {
  return (
    <AuthWrapper 
      title="Your Profile" 
      subtitle="Manage your account settings and preferences"
    >
      <UserProfile appearance={brandVoiceClerkAppearance} />
    </AuthWrapper>
  );
}


