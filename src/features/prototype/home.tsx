import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { JobCard, JobList } from "@/features/jobs/job-card";
import { categorySigns } from "@/features/jobs/presentation";
import { usePrototype } from "./store";
import { publishedJobs } from "./model";
import { plural } from "@/lib/plural";

const categories = [
  {
    slug: "build",
    label: "Build",
    description: "Tworzysz modele, systemy i produkty wykorzystujące AI.",
  },
  {
    slug: "apply",
    label: "Apply",
    description: "Używasz AI, żeby lepiej wykonywać swoją właściwą pracę.",
  },
  {
    slug: "lead",
    label: "Lead",
    description: "Prowadzisz zmianę, decyzje i zespoły w świecie AI.",
  },
] as const;

const counter = (n: number) => String(n).padStart(2, "0");

export default function HomePage() {
  const { state } = usePrototype();
  const jobs = publishedJobs(state);
  const latestJobs = jobs.slice(0, 4);

  return (
    <>
      <section className="home-intro">
        <div className="home-intro-grid">
          <div>
            <p className="t-label">Dobra robota. Z AI w środku.</p>
            <h1 className="t-h1">Praca dla ludzi, którzy dowożą z AI.</h1>
            <p className="lead">
              Wyselekcjonowane role, w których AI jest częścią odpowiedzialności, decyzji i wyniku
              pracy — nie dopiskiem w employer brandingu.
            </p>
            <div className="home-actions">
              <Link to="/oferty" className={buttonVariants({ variant: "action" })}>
                Zobacz oferty
              </Link>
              <Link to="/metodologia" className={buttonVariants()}>
                Jak wybieramy role
              </Link>
            </div>
          </div>
          <div className="console home-console" aria-label="Oferty teraz" role="group">
            <div className="c-head">
              <span>DoRoboty / Oferty</span>
              <span>Teraz</span>
            </div>
            <p className="c-title">
              {jobs.length} {plural(jobs.length, "rola", "role", "ról")}, w których AI jest częścią
              pracy, a nie dopiskiem.
            </p>
            <div className="c-stats">
              {categories.map((category) => (
                <div className="c-stat" key={category.slug}>
                  <b>{counter(jobs.filter((x) => x.category === category.slug).length)}</b>
                  <small>
                    {categorySigns[category.slug]} {category.label}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home-section">
        <p className="t-label">Trzy sposoby pracy z AI</p>
        <h2 className="t-sec">Build. Apply. Lead.</h2>
        <div className="home-segments">
          {categories.map((category, index) => (
            <article key={category.slug} className="prototype-panel">
              <span className="nr">Nr 0{index + 1}</span>
              <h3>
                {categorySigns[category.slug]} {category.label}
              </h3>
              <p className="t-meta">{category.description}</p>
              <Link className="tx" to={`/oferty?category=${category.slug}`}>
                Przeglądaj role →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section">
        <div className="sec-head">
          <div>
            <p className="t-label">Aktualne role</p>
            <h2 className="t-sec">Najnowsze oferty</h2>
          </div>
          <Link className="tx" to="/oferty">
            Wszystkie oferty →
          </Link>
        </div>
        <JobList>
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </JobList>
      </section>
    </>
  );
}
