import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSelect } from "@/components/ui/form-select";
import {
  categoryLabels,
  functionLabels,
  remoteLabels,
  seniorityLabels,
  contractLabels,
  categorySigns,
} from "@/features/jobs/presentation";
import { currentPerson, jobSchema } from "./model";
import { usePrototype } from "./store";
import { Field } from "./workspace";
import { Empty, NotFound, PageTitle } from "./shell";
import { ReminderSettings } from "@/features/applications/status";
import {
  SalaryScopeFields,
  marketHint,
  type SalaryScopeValue,
} from "@/features/jobs/salary-scope-fields";

/** Instrument C05 columns for the employer's own offers. */
const employerJobColumns = {
  "--cols": "minmax(240px,1fr) 100px 110px 150px 120px",
  "--areas": '"who seg rate stat go"',
  "--areas-m": '"seg seg stat" "who who who" "rate rate go"',
} as React.CSSProperties;

export function EmployerJobs() {
  const { state } = usePrototype();
  const person = currentPerson(state)!;
  const jobs = state.jobs.filter((x) => x.companyId === person.companyId);
  return (
    <>
      <PageTitle
        action={
          <Link to="/app/oferty/nowa" className={buttonVariants({ variant: "action" })}>
            Dodaj ofertę
          </Link>
        }
      >
        Moje oferty
      </PageTitle>
      {jobs.length ? (
        <div className="list record-list" style={employerJobColumns}>
          <div className="thead" aria-hidden="true">
            <span>Oferta</span>
            <span>Segment</span>
            <span>Zgłoszenia</span>
            <span>Stan</span>
            <span />
          </div>
          {jobs.map((job) => (
            <article key={job.id} className="row">
              <div className="who">
                <h2 className="t-name">
                  <Link to={`/app/oferty/${job.id}`}>{job.title}</Link>
                </h2>
                <span className="t-meta">
                  {job.locations.join(" / ")} · {remoteLabels[job.remoteStatus]}
                </span>
              </div>
              <span className="seg">
                {categorySigns[job.category]} {categoryLabels[job.category]}
              </span>
              <span className="t-data rate" data-label="Zgłoszenia:">
                {state.applications.filter((x) => x.jobId === job.id).length}
              </span>
              <span className="stat">
                <span className={job.publicationStatus === "published" ? "badge" : "badge off"}>
                  {job.publicationStatus === "published" ? "Opublikowana" : "Szkic"}
                </span>
              </span>
              <Link className="tx public-link" to={`/oferty/${job.slug}`}>
                Zobacz ofertę
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <Empty>Nie masz jeszcze ofert. Dodaj pierwszą ofertę.</Empty>
      )}
    </>
  );
}
export function EmployerJobEditor() {
  const { id } = useParams();
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const navigate = useNavigate();
  const existing = state.jobs.find((x) => x.id === id && x.companyId === person.companyId);
  const [title, setTitle] = useState(existing?.title ?? "");
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [source, setSource] = useState(existing?.sourceBrief ?? "");
  const [generated, setGenerated] = useState(existing?.generatedDescription ?? "");
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState("");
  const [salary, setSalary] = useState<SalaryScopeValue>({
    min: existing?.salaryMin?.toString() ?? "",
    max: existing?.salaryMax?.toString() ?? "",
    later: existing?.salaryLater ?? false,
    firstProject: existing?.firstProject ?? "",
    mandate: existing?.mandate ?? "",
    processForm: existing?.processForm ?? "",
  });
  const [askLater, setAskLater] = useState(false);
  if (id !== "nowa" && !existing) return <NotFound />;
  function publish(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!approved) {
      setError("Zatwierdź opis przed publikacją.");
      return;
    }
    const data = new FormData(e.currentTarget);
    // EXP3: skipping the salary range needs a deliberate "Dodam później".
    if (!(salary.min && salary.max) && !salary.later) {
      setAskLater(true);
      setError("Dodaj widełki wynagrodzenia albo wybierz „Dodam później”.");
      return;
    }
    const newId = existing?.id ?? crypto.randomUUID();
    const parsed = jobSchema.safeParse({
      id: newId,
      slug: existing?.slug ?? `oferta-${newId}`,
      companyId: person.companyId,
      title,
      summary,
      description,
      sourceBrief: source,
      generatedDescription: generated,
      category: data.get("category"),
      function: data.get("function"),
      remoteStatus: data.get("remoteStatus"),
      locations: [String(data.get("location")).trim()],
      seniority: data.get("seniority"),
      contract: data.get("contract"),
      salaryMin: salary.min ? Number(salary.min) : undefined,
      salaryMax: salary.max ? Number(salary.max) : undefined,
      salaryLater: !(salary.min && salary.max) && salary.later ? true : undefined,
      firstProject: salary.firstProject.trim() || undefined,
      mandate: salary.mandate.trim() || undefined,
      processForm: salary.processForm || undefined,
      salaryCurrency: existing?.salaryCurrency ?? "PLN",
      salaryPeriod: existing?.salaryPeriod ?? "month",
      salaryKind: existing?.salaryKind ?? "gross",
      coordinates: (
        {
          warszawa: { latitude: 52.2297, longitude: 21.0122 },
          kraków: { latitude: 50.0647, longitude: 19.945 },
          wrocław: { latitude: 51.1079, longitude: 17.0385 },
          gdańsk: { latitude: 54.352, longitude: 18.6466 },
          poznań: { latitude: 52.4064, longitude: 16.9252 },
        } as Record<string, { latitude: number; longitude: number }>
      )[String(data.get("location")).trim().toLocaleLowerCase("pl")],
      publicationStatus: "published",
      publishedAt: existing?.publishedAt ?? new Date().toISOString(),
      expiryAt: existing?.expiryAt ?? "2099-12-31T23:59:59.000Z",
      verificationStatus: "employer_verified",
    });
    if (
      !parsed.success ||
      (parsed.data.salaryMin !== undefined &&
        parsed.data.salaryMax !== undefined &&
        parsed.data.salaryMin > parsed.data.salaryMax)
    ) {
      setError(
        "Sprawdź formularz: tytuł, lokalizacja, podsumowanie (min. 10 znaków), opis (min. 30 znaków) i widełki wynagrodzenia.",
      );
      return;
    }
    if (run({ type: "publish", job: parsed.data })) navigate("/app/oferty");
  }
  return (
    <>
      <PageTitle>{existing ? "Edytuj ofertę" : "Nowa oferta"}</PageTitle>
      <form className="prototype-form" onSubmit={publish}>
        <Field label="Nazwa stanowiska">
          <Input
            required
            maxLength={200}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setApproved(false);
            }}
          />
        </Field>
        <Field label="Brief — kogo szukasz i do jakiego zadania?">
          <Textarea
            maxLength={12000}
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setGenerated("");
              setApproved(false);
            }}
          />
        </Field>
        <div>
          <Button
            type="button"
            variant="outline"
            disabled={source.trim().length < 20 || title.trim().length < 3}
            onClick={() => {
              setGenerated(
                `${title}\n\nO roli\n${source.trim().slice(0, 10000)}\n\nJak pracujemy\nŁączymy potrzeby użytkowników, odpowiedzialne wykorzystanie AI i mierzalne efekty.\n\nProces rekrutacji\nPrześlij aplikację i opowiedz o projekcie, w którym Twoje decyzje wpłynęły na wynik.`,
              );
              setApproved(false);
            }}
          >
            Przygotuj opis z AI
          </Button>
        </div>
        {generated && (
          <section className="prototype-panel">
            <h2 className="mb-4">Propozycja opisu</h2>
            <p className="whitespace-pre-wrap">{generated}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={() => {
                setDescription(generated);
                if (!summary) setSummary(source.slice(0, 180));
                setApproved(false);
              }}
            >
              Użyj propozycji
            </Button>
          </section>
        )}
        <Field label="Krótkie podsumowanie">
          <Textarea
            required
            minLength={10}
            maxLength={12000}
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              setApproved(false);
            }}
          />
        </Field>
        <Field label="Opis oferty">
          <Textarea
            required
            minLength={30}
            maxLength={12000}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setApproved(false);
            }}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              ["category", "Kategoria", categoryLabels, existing?.category ?? "build"],
              ["function", "Funkcja", functionLabels, existing?.function ?? "engineering"],
              ["remoteStatus", "Tryb pracy", remoteLabels, existing?.remoteStatus ?? "hybrid"],
              ["seniority", "Poziom", seniorityLabels, existing?.seniority ?? "mid"],
              ["contract", "Umowa", contractLabels, existing?.contract ?? "employment"],
            ] as const
          ).map(([name, label, values, value]) => (
            <Field key={name} label={label}>
              <FormSelect
                name={name}
                ariaLabel={label}
                defaultValue={value}
                options={Object.entries(values).map(([value, label]) => ({ value, label }))}
              />
            </Field>
          ))}
          <Field label="Lokalizacja">
            <Input
              name="location"
              required
              maxLength={200}
              defaultValue={existing?.locations.join(" / ") ?? "Warszawa"}
            />
          </Field>
        </div>
        <SalaryScopeFields
          value={salary}
          onChange={setSalary}
          hint={marketHint(state.jobs, existing?.category ?? "build")}
          askLater={askLater}
          onLaterAnswered={() => {
            setAskLater(false);
            setError("");
          }}
        />
        <label className="flex items-start gap-3">
          <Checkbox
            checked={approved}
            onCheckedChange={setApproved}
            aria-label="Zatwierdzam treść oferty"
          />
          <span>Zatwierdzam treść oferty do publikacji.</span>
        </label>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <Button type="submit" variant="action" disabled={!approved}>
          Opublikuj ofertę
        </Button>
      </form>
    </>
  );
}
export function CompanyEditor() {
  const { state, run } = usePrototype();
  const person = currentPerson(state)!;
  const company = state.companies.find((x) => x.id === person.companyId)!;
  const [message, setMessage] = useState("");
  function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (
      run({
        type: "company",
        name: String(data.get("name")),
        description: String(data.get("description")),
      })
    )
      setMessage("Dane firmy zostały zapisane.");
  }
  return (
    <>
      <PageTitle>Twoja organizacja</PageTitle>
      <form className="prototype-panel prototype-form" onSubmit={save}>
        <Field label="Nazwa firmy">
          <Input name="name" required maxLength={200} defaultValue={company.name} />
        </Field>
        <Field label="Opis firmy">
          <Textarea name="description" maxLength={12000} defaultValue={company.description} />
        </Field>
        <Button type="submit" variant="action">
          Zapisz dane firmy
        </Button>
        {message && <p role="status">{message}</p>}
        <Link className="text-[var(--gui-link)]" to={`/firmy/${company.slug}`}>
          Zobacz profil firmy
        </Link>
      </form>
      <div className="mt-6">
        <ReminderSettings />
      </div>
    </>
  );
}
