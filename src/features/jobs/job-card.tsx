import { Link } from "react-router";
import { usePrototype } from "@/features/prototype/store";
import type { JobWithCompany } from "./types";
import { categoryLabels, categorySigns, remoteLabels, seniorityLabels } from "./presentation";
import { CompanyLogo } from "./company-logo";
import { SalaryFact } from "./salary-fact";

/** Column template shared by the offer list header and its rows (Instrument C05). */
export const jobListColumns = {
  "--cols": "32px minmax(220px,1fr) 84px 190px 110px 84px 36px",
  "--areas": '"logo who seg rate mode upd save"',
  "--areas-m": '"logo seg save" "who who who" "rate rate mode"',
} as React.CSSProperties;

export function JobListHead() {
  return (
    <div className="thead" aria-hidden="true">
      <span />
      <span>Stanowisko</span>
      <span>Segment</span>
      <span>Widełki</span>
      <span>Tryb</span>
      <span>Dodano ↓</span>
      <span />
    </div>
  );
}

/** One offer as a row of the framed list table. A saved offer is an inverted row with its reason. */
export function JobCard({ job, saved }: { job: JobWithCompany; saved?: boolean }) {
  const { run } = usePrototype();
  return (
    <article className={saved ? "row sl pp-job-card" : "row pp-job-card"}>
      <span className="job-logo">
        <CompanyLogo company={job.company} />
      </span>
      <div className="who">
        <h3 className="t-name pp-job-title">
          <Link to={`/oferty/${job.slug}`}>{job.title}</Link>
        </h3>
        <span className="t-meta">
          <Link className="pp-job-company" to={`/firmy/${job.company.slug}`}>
            {job.company.name}
          </Link>{" "}
          · {job.locations.join(" / ")} · {seniorityLabels[job.seniority]}
        </span>
        {saved && <span className="t-label why">Zapisana</span>}
      </div>
      <span className="seg">
        {categorySigns[job.category]} {categoryLabels[job.category]}
      </span>
      <span className="rate">
        <SalaryFact job={job} />
      </span>
      <span className="mode">
        <span className="chip">{remoteLabels[job.remoteStatus]}</span>
      </span>
      <span className="t-data upd" data-label="Dodano:">
        {new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit" }).format(
          new Date(job.publishedAt),
        )}
      </span>
      {saved !== undefined ? (
        <button
          type="button"
          className="save"
          aria-label={`Zapisz ofertę: ${job.title}`}
          aria-pressed={saved}
          onClick={() => run({ type: "toggle_saved", jobId: job.id })}
        >
          {saved ? "★" : "☆"}
        </button>
      ) : (
        <span className="go" aria-hidden="true">
          ›
        </span>
      )}
    </article>
  );
}

/** Framed list table of offers with its column header. */
export function JobList({ children }: { children: React.ReactNode }) {
  return (
    <div className="list job-list pp-job-list" style={jobListColumns}>
      <JobListHead />
      {children}
    </div>
  );
}
