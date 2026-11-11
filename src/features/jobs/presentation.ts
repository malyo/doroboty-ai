import type { Job, JobCategory, RemoteStatus } from "@/features/jobs/types";

export const categoryLabels: Record<JobCategory, string> = {
  build: "Build",
  apply: "Apply",
  lead: "Lead",
};

/** Instrument segments are marked by shape, never colour: ▲ Build, ● Apply, ■ Lead. */
export const categorySigns: Record<JobCategory, string> = {
  build: "▲",
  apply: "●",
  lead: "■",
};

export const functionLabels = {
  product: "Product",
  engineering: "Engineering",
  data: "Data",
  design: "Design",
  marketing: "Marketing",
  operations: "Operations",
} as const;

export const remoteLabels: Record<RemoteStatus, string> = {
  onsite: "Stacjonarnie",
  hybrid: "Hybrydowo",
  remote: "Zdalnie",
};

export const seniorityLabels = {
  junior: "Junior",
  mid: "Mid",
  senior: "Senior",
  lead: "Lead",
} as const;

export const contractLabels = {
  employment: "Umowa o pracę",
  b2b: "B2B",
  mandate: "Umowa zlecenie",
} as const;

export const publicationStatusLabels = {
  draft: "Szkic",
  review: "Do weryfikacji",
  published: "Opublikowana",
  hidden: "Ukryta",
  expired: "Wygasła",
  archived: "Zarchiwizowana",
} as const;

export function publicationStatusLabel(status: string) {
  return (
    publicationStatusLabels[status as keyof typeof publicationStatusLabels] ?? "Status nieznany"
  );
}

const numberFormat = new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 });

export function formatSalary(job: Job) {
  if (!job.salaryMin && !job.salaryMax) return "Wynagrodzenie nieujawnione";
  const range = [job.salaryMin, job.salaryMax]
    .filter((value): value is number => typeof value === "number")
    .map((value) => numberFormat.format(value))
    .join("–");
  const period = job.salaryPeriod === "year" ? "rok" : "mies.";
  const kind = job.salaryKind === "net" ? "netto" : "brutto";
  return `${range} ${job.salaryCurrency ?? "PLN"} ${kind} / ${period}`;
}
