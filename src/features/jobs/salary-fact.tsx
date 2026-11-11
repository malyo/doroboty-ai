import type { Job } from "./types";
import { contractLabels } from "./presentation";

/** Amount and agreement basis are distinct facts, shared by list rows and offer conditions.
 *  The amount is data (DM Mono); a missing salary is shown as "—", never hidden. */
export function SalaryFact({ job }: { job: Job }) {
  const amount = [job.salaryMin, job.salaryMax]
    .filter((x): x is number => x !== undefined)
    .map((x) => new Intl.NumberFormat("pl-PL").format(x))
    .join("–");
  return (
    <div className="salary-fact">
      {amount ? (
        <>
          <span className="t-data pp-salary-tag">
            {amount} {job.salaryCurrency === "EUR" ? "EUR" : "zł"}
          </span>
          <span className="t-meta pp-salary-description">
            {contractLabels[job.contract]} ·{" "}
            {job.salaryKind === "net"
              ? "netto" + (job.contract === "b2b" ? " + VAT" : "")
              : "brutto"}{" "}
            / {job.salaryPeriod === "year" ? "rok" : "mies."}
          </span>
        </>
      ) : (
        <span className="t-data pp-salary-missing">
          <span aria-hidden="true">—</span>
          <span className="sr-only">Nie podano wynagrodzenia</span>
        </span>
      )}
    </div>
  );
}
