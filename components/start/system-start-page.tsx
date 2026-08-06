import { LandingPage } from "@/components/start/landing-page";
import { getLogoSrc } from "@/lib/get-logo-src";

export function SystemStartPage() {
  const logoSrc = getLogoSrc();

  return <LandingPage logoSrc={logoSrc} />;
}
