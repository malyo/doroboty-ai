import { CompanyLogoImage } from "@/features/jobs/company-logo-image";
import { companyInitials, companyLogoUrl } from "@/features/jobs/company-logos";
import type { Company } from "@/features/jobs/types";
import { cn } from "@/lib/utils";

/** Instrument C09: a small framed square with an initial fallback. It never carries contrast. */
export function CompanyLogo({
  company,
  size = "default",
}: {
  company: Pick<Company, "name" | "slug" | "logoUrl">;
  size?: "default" | "large";
}) {
  const src = companyLogoUrl(company);
  const dimension = size === "large" ? 56 : 32;
  const initials = companyInitials(company.name);

  return (
    <span
      aria-hidden="true"
      data-company-logo={company.slug}
      className={cn("logo company-logo overflow-hidden", size === "large" && "company-logo-large")}
    >
      {src ? <CompanyLogoImage src={src} dimension={dimension} initials={initials} /> : initials}
    </span>
  );
}
