import { WebsiteProvider } from '@/context/website-context';

// The onboarding page calls useWebsite() (for currentSite + completeOnboarding).
// WebsiteContext is created with real default values (not `undefined`), so
// without a <WebsiteProvider> ancestor, useContext() silently returns the
// stub defaults instead of throwing — in particular `completeOnboarding:
// async () => null`, a no-op. That made Step 1 of onboarding appear to
// succeed (no error, page advances to Step 2) while never actually writing
// to Firestore or refreshing the __session/__onboarded cookies, so
// "Head to Dashboard Overview" in Step 3 always got redirected straight
// back to /onboarding by the middleware. Mounting the real provider here
// fixes that at the source.
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WebsiteProvider>{children}</WebsiteProvider>;
}
