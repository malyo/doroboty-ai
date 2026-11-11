import { Link, useLocation, useParams, useSearchParams } from "react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { MapPin } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { BackLink } from "@/components/back-link";
import { ResponsivePanel } from "@/components/responsive-panel";
import { SalaryFact } from "@/features/jobs/salary-fact";
import { functionLabels, categorySigns } from "@/features/jobs/presentation";
import { CompanyLogo } from "@/features/jobs/company-logo";
import { JobCard, JobList } from "@/features/jobs/job-card";
import { JobFiltersForm } from "@/features/jobs/job-filters";
import { JobPagination } from "@/features/jobs/job-pagination";
import { JobDescription } from "@/features/jobs/job-description";
import { filterJobs, parseJobFilters } from "@/features/jobs/filters";
import { paginateJobs, jobListingHref } from "@/features/jobs/pagination";
import {
  categoryLabels,
  remoteLabels,
  seniorityLabels,
  contractLabels,
} from "@/features/jobs/presentation";
import type { JobWithCompany } from "@/features/jobs/types";
import { usePrototype } from "./store";
import { currentPerson, publishedJobs } from "./model";
import { NotFound } from "./shell";
import { plural } from "@/lib/plural";

/** Console counters are two digits like a display: 7 → "07". */
const counter = (n: number) => String(n).padStart(2, "0");

function LocalMap({ jobs }: { jobs: JobWithCompany[] }) {
  const [selected, setSelected] = useState<string | null>(null);
  const job = jobs.find((x) => x.id === selected);
  const located = jobs.filter((x) => x.coordinates);
  const locationKey = (x: JobWithCompany) => x.locations[0].trim().toLocaleLowerCase("pl");
  const markers = located.filter(
    (x, index) => located.findIndex((other) => locationKey(other) === locationKey(x)) === index,
  );
  const locationCount = (x: JobWithCompany) =>
    located.filter((other) => locationKey(other) === locationKey(x)).length;
  return (
    <div className="prototype-map-layout">
      <div className="prototype-map" role="region" aria-label="Mapa ofert w Polsce">
        <svg viewBox="0 0 600 520" aria-hidden="true">
          <path
            d="M140 45 220 65 320 40 375 60 440 50 505 150 480 240 520 335 440 420 355 435 310 480 230 435 150 445 90 350 70 260 95 160Z"
            fill="var(--gui-surface-muted)"
            stroke="var(--frame)"
            strokeWidth="1"
          />
        </svg>
        {markers.map((x) => (
          <Button
            key={x.id}
            className="prototype-map-pin"
            size="icon-sm"
            variant={selected === x.id ? "default" : "outline"}
            style={{
              left: `${((x.coordinates!.longitude - 14) / 11) * 80 + 10}%`,
              top: `${((55 - x.coordinates!.latitude) / 6) * 80 + 10}%`,
            }}
            aria-label={`${x.locations.join(" / ")}: ${locationCount(x)} ofert`}
            aria-pressed={selected === x.id}
            onClick={() => setSelected(x.id)}
          >
            {locationCount(x) > 1 ? locationCount(x) : <MapPin />}
          </Button>
        ))}
      </div>
      <div className="prototype-panel">
        {job ? (
          <>
            <h2 className="t-sec">{job.title}</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Oferty w tej lokalizacji: {locationCount(job)}
            </p>
            <p className="my-3">
              {job.company.name} · {job.locations.join(" / ")}
            </p>
            <Link to={`/oferty/${job.slug}`} className={buttonVariants({ variant: "outline" })}>
              Zobacz rolę
            </Link>
          </>
        ) : (
          <p>Wybierz znacznik, aby zobaczyć ofertę.</p>
        )}
        <ul className="mt-5 space-y-3">
          {jobs.map((x) => (
            <li key={x.id}>
              <Link className="underline underline-offset-[3px]" to={`/oferty/${x.slug}`}>
                {x.title} · {x.company.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
export function JobsPage() {
  const { state } = usePrototype();
  const person = currentPerson(state);
  const [params, setParams] = useSearchParams();
  const filters = parseJobFilters(Object.fromEntries(params));
  const chipButtons = useRef(new Map<string, HTMLButtonElement>());
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const pendingChipFocus = useRef<string | null>(null);
  useEffect(() => {
    const target = pendingChipFocus.current;
    if (!target) return;
    (chipButtons.current.get(target) ?? resultsHeading.current)?.focus();
    pendingChipFocus.current = null;
  }, [params]);
  const all = publishedJobs(state);
  const jobs = filterJobs(all, filters);
  const pagination = paginateJobs(jobs, filters.page);
  const view = params.get("view") === "map" ? "map" : "list";
  const savedIds =
    person?.role === "candidate"
      ? new Set(state.saved.filter((x) => x.candidateId === person.id).map((x) => x.jobId))
      : undefined;
  function change(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.delete("page");
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  }
  function removeFilter(key: string) {
    const keys = Object.entries(filters)
      .filter(([name, value]) => name !== "page" && value)
      .map(([name]) => name);
    const index = keys.indexOf(key);
    pendingChipFocus.current = keys[index + 1] ?? keys[index - 1] ?? "results";
    change(key, "");
  }
  function reset() {
    setParams(view === "map" ? { view: "map" } : {});
  }
  function search(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next = new URLSearchParams(params);
    next.delete("page");
    for (const key of ["query", "location"]) {
      const value = String(data.get(key) ?? "").trim();
      if (value) next.set(key, value);
      else next.delete(key);
    }
    setParams(next);
  }
  const locations = [...new Set(all.flatMap((x) => x.locations))];
  return (
    <>
      <header className="console pp-intro-section">
        <div className="c-head">
          <span>DoRoboty / Oferty / Najnowsze</span>
          <span>Build · Apply · Lead</span>
        </div>
        <h1 className="c-title pp-intro-copy">
          Dobra robota. Z AI w środku. {jobs.length}{" "}
          {plural(jobs.length, "oferta", "oferty", "ofert")} dla ludzi, którzy dowożą z AI.
        </h1>
        <div className="c-stats">
          <div className="c-stat">
            <b>{counter(all.length)}</b>
            <small>Wszystkie oferty</small>
          </div>
          {(["build", "apply", "lead"] as const).map((key) => (
            <div className="c-stat" key={key}>
              <b>{counter(all.filter((x) => x.category === key).length)}</b>
              <small>
                {categorySigns[key]} {categoryLabels[key]}
              </small>
            </div>
          ))}
        </div>
      </header>
      <div className="filters job-filters-bar">
        <div className="choice segment-choice" role="group" aria-label="Kategorie ofert">
          {(
            [
              ["", "Wszystkie oferty"],
              ["build", "Build"],
              ["apply", "Apply"],
              ["lead", "Lead"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className="fpill pp-category-tab"
              aria-pressed={(filters.category ?? "") === key}
              onClick={() => change("category", key)}
            >
              {key ? `${categorySigns[key]} ` : ""}
              {label} ({filterJobs(all, { ...filters, category: key || undefined }).length})
            </button>
          ))}
        </div>
        <form
          key={`${filters.query ?? ""}:${filters.location ?? ""}`}
          className="pp-search-form"
          onSubmit={search}
        >
          <label className="fsearch">
            <span className="sr-only">Szukaj ofert</span>
            <input
              name="query"
              aria-label="Szukaj ofert"
              maxLength={100}
              defaultValue={filters.query ?? ""}
              placeholder="Szukaj: stanowisko, firma, słowo kluczowe"
            />
            <kbd aria-hidden="true">/</kbd>
          </label>
          <label className="fselect">
            <span className="sr-only">Lokalizacja</span>
            <select name="location" aria-label="Lokalizacja" defaultValue={filters.location ?? ""}>
              <option value="">Cała Polska</option>
              {[...new Set([...locations, ...(filters.location ? [filters.location] : [])])].map(
                (x) => (
                  <option key={x}>{x}</option>
                ),
              )}
            </select>
          </label>
          <Button type="submit" className="pp-search-submit">
            Szukaj
          </Button>
        </form>
        <span className="count">
          {jobs.length} z {all.length}
        </span>
      </div>
      <section className="pp-container pp-board-layout">
        <div className="pp-filter-position">
          <ResponsivePanel
            title="Filtry"
            description="Wyniki zmieniają się od razu. W każdej grupie wybierz jeden warunek."
            resultCount={jobs.length}
          >
            <JobFiltersForm filters={filters} onChange={change} onReset={reset} />
          </ResponsivePanel>
        </div>
        <div className="pp-results-column">
          <div className="pp-results-heading">
            <div className="pp-results-title">
              <h2 className="t-sec" ref={resultsHeading} tabIndex={-1}>
                Oferty pracy
              </h2>
              <span className="t-data" role="status" aria-live="polite">
                {jobs.length}
              </span>
            </div>
            <div className="pp-results-controls">
              <span className="t-label pp-sort-label">Najnowsze</span>
              <Link
                className="pp-view-link"
                aria-current={view === "list" ? "page" : undefined}
                to={jobListingHref(filters)}
              >
                Lista
              </Link>
              <Link
                className="pp-view-link"
                aria-current={view === "map" ? "page" : undefined}
                to={jobListingHref(filters, 1, "map")}
              >
                Mapa
              </Link>
            </div>
          </div>
          {Object.entries(filters).some(([k, v]) => k !== "page" && v) && (
            <div className="pp-active-filters">
              {Object.entries(filters)
                .filter(([k, v]) => k !== "page" && v)
                .map(([key, value]) => (
                  <button
                    className="fpill pp-filter-chip"
                    aria-pressed="true"
                    key={key}
                    aria-label={`Usuń filtr: ${value}`}
                    ref={(element) => {
                      if (element) chipButtons.current.set(key, element);
                      else chipButtons.current.delete(key);
                    }}
                    onClick={() => removeFilter(key)}
                  >
                    {String(value)} <span aria-hidden="true">✕</span>
                  </button>
                ))}
              <button className="tx pp-text-button" onClick={reset}>
                Wyczyść
              </button>
            </div>
          )}
          {jobs.length ? (
            view === "map" ? (
              <LocalMap jobs={jobs} />
            ) : (
              <>
                {savedIds && savedIds.size > 0 && (
                  <p className="t-meta list-legend">
                    Ciemny wiersz oznacza ofertę zapisaną przez Ciebie.
                  </p>
                )}
                <JobList>
                  {pagination.items.map((job) => (
                    <JobCard key={job.id} job={job} saved={savedIds?.has(job.id)} />
                  ))}
                </JobList>
                <JobPagination pagination={pagination} filters={filters} />
              </>
            )
          ) : (
            <div className="empty pp-empty-state">
              <span className="t-label">0 wyników</span>
              <h3>Brak ofert dla tych filtrów</h3>
              <p>Wyczyść część kryteriów i spróbuj ponownie.</p>
              <button type="button" className="tx" onClick={reset}>
                Pokaż wszystkie oferty
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export function JobPage() {
  const { slug } = useParams();
  const location = useLocation();
  useEffect(() => {
    const target =
      location.hash === "#role" ? "role" : location.hash === "#employer" ? "employer" : null;
    if (!target) return;
    // Run after the shell's route focus handling, including direct deep links.
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById(target);
      section?.focus({ preventScroll: true });
      section?.scrollIntoView({ behavior: "instant", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash, location.key, slug]);
  const { state, run } = usePrototype();
  const person = currentPerson(state);
  const job = publishedJobs(state).find((x) => x.slug === slug);
  if (!job) return <NotFound />;
  const saved = state.saved.some((x) => x.candidateId === person?.id && x.jobId === job.id);
  const submitted = state.applications.find(
    (x) => x.candidateId === person?.id && x.jobId === job.id,
  );
  const related = publishedJobs(state)
    .filter((x) => x.id !== job.id)
    .sort((a, b) => Number(b.category === job.category) - Number(a.category === job.category))
    .slice(0, 3);
  return (
    <article className="detail pp-offer-page">
      <header className="d-head pp-offer-hero">
        <nav className="pp-offer-breadcrumb" aria-label="Powrót do ofert">
          <BackLink to="/oferty">Wróć do ofert</BackLink>
        </nav>
        <div className="t-label">
          {categorySigns[job.category]} {categoryLabels[job.category]} · Opublikowano{" "}
          {new Intl.DateTimeFormat("pl-PL").format(new Date(job.publishedAt))}
        </div>
        <h1 className="t-h1">{job.title}</h1>
        <p className="lead">{job.summary}</p>
        <div className="offer-company">
          <CompanyLogo company={job.company} />
          <Link className="pp-offer-company-link" to={`/firmy/${job.company.slug}`}>
            {job.company.name}
          </Link>
        </div>
        <div className="chips">
          <span className="chip">{job.locations.join(" / ")}</span>
          <span className="chip">{remoteLabels[job.remoteStatus]}</span>
          <span className="chip">{seniorityLabels[job.seniority]}</span>
          <span className="chip">{functionLabels[job.function]}</span>
        </div>
      </header>
      <aside className="side pp-offer-sidebar">
        <div className="cap">
          <span>Fakty</span>
          <span>Oferta</span>
        </div>
        <h2 className="sr-only">Konkrety</h2>
        <div className="pp-offer-pay">
          <p className="t-label">Wynagrodzenie</p>
          <SalaryFact job={job} />
        </div>
        <dl className="kv pp-offer-terms">
          {[
            ["Forma", contractLabels[job.contract]],
            ["Tryb", remoteLabels[job.remoteStatus]],
            ["Lokalizacja", job.locations.join(" / ")],
            ["Doświadczenie", seniorityLabels[job.seniority]],
          ].map(([key, value]) => (
            <div key={key} className="contents">
              <dt>{key}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="pp-offer-actions">
          {person?.role === "candidate" ? (
            <>
              <Link
                className={buttonVariants({ variant: "action", className: "wide" })}
                to={submitted ? `/app/aplikacje/${submitted.id}` : `/aplikuj/${job.slug}`}
              >
                {submitted ? "Zobacz swoją aplikację" : "Aplikuj"}
              </Link>
              <Button
                className="wide"
                aria-label="Zapisz ofertę"
                aria-pressed={saved}
                onClick={() => run({ type: "toggle_saved", jobId: job.id })}
              >
                {saved ? "Zapisana" : "Zapisz ofertę"}
              </Button>
            </>
          ) : !person ? (
            <Link
              className={buttonVariants({ variant: "action", className: "wide" })}
              to={`/auth/sign-in?audience=candidate&next=${encodeURIComponent(`/aplikuj/${job.slug}`)}`}
            >
              Wybierz osobę i aplikuj
            </Link>
          ) : (
            <p className="t-meta">Aplikacje są dostępne z profilu kandydata.</p>
          )}
          <p className="t-meta">
            Firma zobaczy Twój profil DoRoboty i odpowiedzi z formularza. Prototyp: aplikacja
            zostaje w tym przeglądarkowym scenariuszu.
          </p>
        </div>
      </aside>
      <div className="d-body pp-offer-description">
        <nav className="pp-offer-section-nav" aria-label="Sekcje oferty">
          <Link to={{ pathname: `/oferty/${job.slug}`, hash: "#role" }}>O roli</Link>
          <Link to={{ pathname: `/oferty/${job.slug}`, hash: "#employer" }}>O firmie</Link>
        </nav>
        <section id="role" tabIndex={-1} className="pp-offer-section">
          <h2 className="t-sec">O roli</h2>
          <JobDescription description={job.description} />
        </section>
        {(job.firstProject || job.mandate || job.processForm) && (
          <section className="pp-offer-section">
            <h2 className="t-sec">Zakres roli</h2>
            <dl className="spec">
              {job.firstProject && (
                <>
                  <dt>Pierwszy projekt</dt>
                  <dd>{job.firstProject}</dd>
                </>
              )}
              {job.mandate && (
                <>
                  <dt>Mandat</dt>
                  <dd>{job.mandate}</dd>
                </>
              )}
              {job.processForm && (
                <>
                  <dt>Proces rekrutacji</dt>
                  <dd>{job.processForm}</dd>
                </>
              )}
            </dl>
          </section>
        )}
        <section className="pp-offer-employer" id="employer" tabIndex={-1}>
          <h2 className="t-sec">O firmie</h2>
          <div className="offer-company">
            <CompanyLogo company={job.company} />
            <span className="t-name">{job.company.name}</span>
          </div>
          <p className="t-body">{job.company.description}</p>
          <Link
            className={buttonVariants({ variant: "outline", size: "sm" })}
            to={`/firmy/${job.company.slug}`}
          >
            Oferty tej firmy
          </Link>
        </section>
      </div>
      {related.length > 0 && (
        <section className="pp-offer-related">
          <div className="sec-head">
            <h2 className="t-sec">Może też Cię zainteresować</h2>
            <Link className="tx" to="/oferty">
              Wszystkie oferty
            </Link>
          </div>
          <JobList>
            {related.map((x) => (
              <JobCard key={x.id} job={x} />
            ))}
          </JobList>
        </section>
      )}
    </article>
  );
}

export function CompanyPage() {
  const { slug } = useParams();
  const { state } = usePrototype();
  const company = state.companies.find((x) => x.slug === slug);
  if (!company) return <NotFound />;
  const jobs = publishedJobs(state).filter((x) => x.companyId === company.id);
  return (
    <article className="detail company-page">
      <header className="d-head">
        <div className="t-label">Firma · {jobs.length} otwarte role</div>
        <div className="offer-company">
          <CompanyLogo company={company} size="large" />
        </div>
        <h1 className="t-h1">{company.name}</h1>
        <p className="lead">{company.summary}</p>
      </header>
      <aside className="side">
        <div className="cap">
          <span>Fakty</span>
        </div>
        <dl className="kv">
          <dt>Lokalizacja</dt>
          <dd>{company.location}</dd>
          <dt>Wielkość</dt>
          <dd>{company.sizeLabel}</dd>
        </dl>
        {/^https?:\/\//i.test(company.websiteUrl) && (
          <a
            className={buttonVariants({ className: "wide ext" })}
            href={company.websiteUrl}
            target="_blank"
            rel="noreferrer"
          >
            Strona firmy
          </a>
        )}
      </aside>
      <div className="d-body">
        <p className="t-body">{company.description}</p>
        <section>
          <h2 className="t-sec">Otwarte role</h2>
          {jobs.length > 0 ? (
            <JobList>
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </JobList>
          ) : (
            <div className="empty">
              <span className="t-label">0 ofert</span>
              <p>Ta firma nie ma teraz aktywnych ofert.</p>
            </div>
          )}
        </section>
      </div>
    </article>
  );
}
