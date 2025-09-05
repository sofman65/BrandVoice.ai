import { UserProfile } from '@clerk/nextjs';
import { AuthWrapper } from "@/shared/components/auth-wrapper";
import { brandVoiceClerkAppearance } from "@/shared/components/clerk-appearance";

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


