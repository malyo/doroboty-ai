import { z } from "zod";
import marketplace from "./data/marketplace.json" with { type: "json" };
import people from "./data/people.json" with { type: "json" };
import type { JobWithCompany } from "@/features/jobs/types";

const id = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_-]*$/);
const shortText = z.string().trim().min(1).max(200);
const text = z.string().trim().max(12000);
export const MIN_APPLICATION_ANSWER_LENGTH = 20;
/** EXP2: a candidate can ask about status this many days after applying. */
export const ASK_STATUS_AFTER_DAYS = 7;
/** EXP1: an employer invites at most this many people at once from the shortened list. */
export const MAX_INVITES = 3;
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
/** Candidate conditions (EXP3); every field is optional. */
export const conditionsSchema = z.object({
  minSalary: z.number().int().nonnegative().max(10_000_000).optional(),
  workMode: z.enum(["remote", "hybrid", "onsite", "any"]).optional(),
  availability: z.enum(["now", "2w", "1m", "3m"]).optional(),
  responseTime: z.enum(["3d", "7d", "14d", "any"]).optional(),
  band: z.enum(["low", "mid", "high", "none"]).optional(),
});
export type Conditions = z.infer<typeof conditionsSchema>;
/** Status updates between employer and candidate (EXP2). */
const statusUpdateSchema = z.object({
  kind: z.enum(["considering", "message", "question", "answer"]),
  at: z.iso.datetime(),
  reason: text.optional(),
  nextContact: day.optional(),
  answer: z.enum(["considering", "rejected"]).optional(),
});
export type StatusUpdate = z.infer<typeof statusUpdateSchema>;
export const reminderSchema = z.object({
  enabled: z.boolean(),
  days: z.number().int().min(1).max(60),
  audience: z.enum(["preference", "all"]),
  reason: text,
});
const companySchema = z.object({
  id,
  slug: id,
  name: shortText,
  summary: text,
  description: text,
  websiteUrl: z.string().max(500),
  location: shortText,
  sizeLabel: shortText,
  logoUrl: z
    .string()
    .regex(/^\/(?!\/)/)
    .optional(),
  reminder: reminderSchema.optional(),
});
export const jobSchema = z
  .object({
    id,
    slug: id,
    companyId: id,
    title: shortText,
    summary: text.min(10),
    description: text.min(30),
    category: z.enum(["build", "apply", "lead"]),
    function: z.enum(["product", "engineering", "data", "design", "marketing", "operations"]),
    remoteStatus: z.enum(["onsite", "hybrid", "remote"]),
    locations: z.array(shortText).min(1).max(10),
    coordinates: z
      .object({ latitude: z.number().min(-90).max(90), longitude: z.number().min(-180).max(180) })
      .optional(),
    seniority: z.enum(["junior", "mid", "senior", "lead"]),
    contract: z.enum(["employment", "b2b", "mandate"]),
    salaryMin: z.number().nonnegative().optional(),
    salaryMax: z.number().nonnegative().optional(),
    salaryCurrency: z.enum(["PLN", "EUR"]).optional(),
    salaryPeriod: z.enum(["month", "year"]).optional(),
    salaryKind: z.enum(["gross", "net"]).optional(),
    publicationStatus: z.enum(["draft", "review", "published", "hidden", "expired", "archived"]),
    publishedAt: z.iso.datetime(),
    expiryAt: z.iso.datetime(),
    verificationStatus: z.enum(["unverified", "editorial", "employer_verified"]),
    sourceBrief: text.optional(),
    generatedDescription: text.optional(),
    /** EXP3: the employer deliberately postponed the salary range ("Dodam później"). */
    salaryLater: z.boolean().optional(),
    firstProject: text.optional(),
    mandate: text.optional(),
    processForm: text.optional(),
  })
  .refine(
    (job) =>
      job.salaryMin === undefined || job.salaryMax === undefined || job.salaryMin <= job.salaryMax,
    { path: ["salaryMax"], message: "Salary maximum must not be below minimum" },
  );
export const profileSchema = z.object({
  name: shortText,
  headline: shortText,
  bio: text,
  location: shortText,
});
const personSchema = profileSchema.extend({
  id,
  role: z.enum(["candidate", "employer", "operator"]),
  companyId: id.optional(),
  cv: text,
  exampleScore: z.number().int().min(0).max(100),
  exampleSummary: text,
});
export const stages = [
  "submitted",
  "reviewed",
  "interview_invited",
  "first_conversation_held",
  "continued",
  "rejected",
  "withdrawn",
  "hired",
] as const;
export type Stage = (typeof stages)[number];
export const stageLabels: Record<Stage, string> = {
  submitted: "Aplikacja wysłana",
  reviewed: "W przeglądzie",
  interview_invited: "Zaproszenie na rozmowę",
  first_conversation_held: "Pierwsza rozmowa odbyta",
  continued: "Kolejny etap",
  rejected: "Proces zakończony",
  withdrawn: "Wycofana",
  hired: "Zatrudnienie",
};
export const nextStages: Record<Stage, Stage[]> = {
  submitted: ["reviewed", "rejected"],
  reviewed: ["interview_invited", "rejected"],
  interview_invited: ["first_conversation_held", "rejected"],
  first_conversation_held: ["continued", "rejected"],
  continued: ["hired", "rejected"],
  rejected: [],
  withdrawn: [],
  hired: [],
};
const applicationSchema = z.object({
  id,
  candidateId: id,
  jobId: id,
  companyId: id,
  jobTitle: shortText,
  candidateName: shortText,
  cv: text.min(20),
  answer: text.min(MIN_APPLICATION_ANSWER_LENGTH),
  sourceNotes: text,
  generatedAnswer: text,
  score: z.number().int().min(0).max(100),
  summary: text,
  stage: z.enum(stages),
  events: z
    .array(z.object({ stage: z.enum(stages), at: z.iso.datetime(), note: text }))
    .min(1)
    .max(30),
  conditions: conditionsSchema.optional(),
  updates: z.array(statusUpdateSchema).max(100).optional(),
});
const draftSchema = z.object({
  candidateId: id,
  jobId: id,
  notes: text,
  generated: text,
  answer: text,
});
export const stateSchema = z
  .object({
    version: z.literal(1),
    activePersonId: id.nullable(),
    companies: z.array(companySchema).min(1).max(200),
    jobs: z.array(jobSchema).min(1).max(1000),
    people: z.array(personSchema).min(1).max(100),
    applications: z.array(applicationSchema).max(2000),
    saved: z.array(z.object({ candidateId: id, jobId: id })).max(5000),
    drafts: z.array(draftSchema).max(1000),
  })
  .superRefine((s, ctx) => {
    const problem = (message: string) => ctx.addIssue({ code: "custom", message });
    for (const list of [s.companies, s.jobs, s.people, s.applications]) {
      if (new Set(list.map((x) => x.id)).size !== list.length) problem("Duplicate identifiers");
    }
    if (
      new Set(s.jobs.map((x) => x.slug)).size !== s.jobs.length ||
      new Set(s.companies.map((x) => x.slug)).size !== s.companies.length
    )
      problem("Duplicate slugs");
    const companyIds = new Set(s.companies.map((x) => x.id));
    const jobs = new Map(s.jobs.map((x) => [x.id, x]));
    const candidates = new Set(s.people.filter((x) => x.role === "candidate").map((x) => x.id));
    if (s.activePersonId !== null && !s.people.some((x) => x.id === s.activePersonId))
      problem("Unknown active person");
    for (const p of s.people)
      if (p.role === "employer" && (!p.companyId || !companyIds.has(p.companyId)))
        problem("Unknown employer company");
    for (const j of s.jobs) if (!companyIds.has(j.companyId)) problem("Unknown job company");
    const keys = new Set<string>();
    for (const a of s.applications) {
      const key = `${a.candidateId}:${a.jobId}`;
      if (
        !candidates.has(a.candidateId) ||
        jobs.get(a.jobId)?.companyId !== a.companyId ||
        keys.has(key)
      )
        problem("Invalid application reference");
      keys.add(key);
      if (a.events[0]?.stage !== "submitted" || a.events.at(-1)?.stage !== a.stage)
        problem("Invalid application history");
      for (let i = 1; i < a.events.length; i++) {
        const before = a.events[i - 1];
        const after = a.events[i];
        if (!(
          nextStages[before.stage].includes(after.stage) ||
          (after.stage === "withdrawn" &&
            !["hired", "rejected", "withdrawn"].includes(before.stage))
        ))
          problem("Invalid stage transition");
        if (after.at < before.at) problem("Invalid event order");
      }
    }
    for (const list of [s.saved, s.drafts]) {
      const pairs = new Set<string>();
      for (const item of list) {
        const key = `${item.candidateId}:${item.jobId}`;
        if (!candidates.has(item.candidateId) || !jobs.has(item.jobId) || pairs.has(key))
          problem("Invalid candidate/job reference");
        pairs.add(key);
      }
    }
  });
export type State = z.infer<typeof stateSchema>;
export type Person = State["people"][number];
export type Application = State["applications"][number];
export type Action =
  | { type: "select_person"; id: string | null }
  | { type: "profile"; value: z.infer<typeof profileSchema> }
  | { type: "toggle_saved"; jobId: string }
  | { type: "draft"; jobId: string; notes: string; generated: string; answer: string }
  | {
      type: "submit";
      jobId: string;
      notes: string;
      generated: string;
      answer: string;
      consent: boolean;
      conditions?: Conditions;
    }
  | { type: "stage"; applicationId: string; stage: Stage; note: string }
  | { type: "withdraw"; applicationId: string }
  | { type: "publish"; job: z.infer<typeof jobSchema> }
  | { type: "company"; name: string; description: string }
  | { type: "invite"; applicationIds: string[] }
  | { type: "still_considering"; applicationId: string }
  | { type: "status_message"; applicationIds: string[]; reason: string; nextContact: string }
  | { type: "ask_status"; applicationId: string }
  | { type: "answer_status"; applicationId: string; answer: "considering" | "rejected" }
  | { type: "reminder"; value: z.infer<typeof reminderSchema> };

const terminalStages: Stage[] = ["rejected", "withdrawn", "hired"];
/** Applications still waiting for an employer decision. */
export function isWaiting(application: Application) {
  return !terminalStages.includes(application.stage);
}
/** Whole days since the application was submitted. */
export function ageDays(application: Application, now = Date.now()) {
  return Math.max(0, Math.floor((now - Date.parse(application.events[0].at)) / 864e5));
}
/**
 * Days until the candidate may ask about status: ASK_STATUS_AFTER_DAYS after applying and again
 * the same number of days after the previous question. 0 means "can ask now".
 */
export function daysUntilStatusQuestion(application: Application, now = Date.now()) {
  const lastQuestion = (application.updates ?? []).filter((x) => x.kind === "question").at(-1);
  const from = lastQuestion ? Date.parse(lastQuestion.at) : Date.parse(application.events[0].at);
  const days = Math.floor((now - from) / 864e5);
  return Math.max(0, ASK_STATUS_AFTER_DAYS - days);
}
/** The latest status question, if it has not been answered yet. */
export function pendingQuestion(application: Application) {
  const updates = application.updates ?? [];
  let lastQuestion = -1;
  updates.forEach((x, index) => {
    if (x.kind === "question") lastQuestion = index;
  });
  if (lastQuestion < 0) return undefined;
  return updates.slice(lastQuestion + 1).some((x) => x.kind === "answer")
    ? undefined
    : updates[lastQuestion];
}

export function initialState(): State {
  const state = stateSchema.parse({
    version: 1,
    activePersonId: null,
    ...marketplace,
    people,
    applications: [],
    saved: [],
    drafts: [],
  });
  const bob = state.people.find((x) => x.id === "candidate-marek")!;
  const job = state.jobs[0];
  state.applications.push({
    id: "application-example",
    candidateId: bob.id,
    jobId: job.id,
    companyId: job.companyId,
    jobTitle: job.title,
    candidateName: bob.name,
    cv: bob.cv,
    answer:
      "Pracowałem nad automatyzacją obsługi zgłoszeń. Poprowadziłem badania z użytkownikami i wdrożenie, które skróciło czas odpowiedzi o 25%. Chętnie opowiem o decyzjach i ograniczeniach tego projektu.",
    sourceNotes: "",
    generatedAnswer: "",
    score: bob.exampleScore,
    summary: bob.exampleSummary,
    stage: "submitted",
    events: [{ stage: "submitted", at: "2026-11-02T09:00:00.000Z", note: "" }],
    conditions: {
      minSalary: 24000,
      workMode: "hybrid",
      availability: "1m",
      responseTime: "7d",
      band: "mid",
    },
  });
  return stateSchema.parse(state);
}
export function publishedJobs(state: State): JobWithCompany[] {
  return state.jobs
    .filter((x) => x.publicationStatus === "published")
    .map((job) => ({ ...job, company: state.companies.find((x) => x.id === job.companyId)! }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
export function currentPerson(state: State) {
  return state.people.find((x) => x.id === state.activePersonId);
}
export function transition(
  state: State,
  action: Action,
  now = new Date().toISOString(),
  newId: string = crypto.randomUUID(),
): State {
  const s = structuredClone(state);
  const person = currentPerson(s);
  const fail = (message: string): never => {
    throw new Error(message);
  };
  const candidate = () => {
    if (person?.role !== "candidate") return fail("Wybierz profil kandydata.");
    return person;
  };
  const employer = () => {
    if (person?.role !== "employer") return fail("Wybierz profil pracodawcy.");
    return person;
  };
  if (action.type === "select_person") {
    if (action.id !== null && !s.people.some((x) => x.id === action.id))
      fail("Nie znaleziono osoby.");
    s.activePersonId = action.id;
  } else if (action.type === "profile")
    Object.assign(candidate(), profileSchema.parse(action.value));
  else if (action.type === "toggle_saved") {
    const p = candidate();
    if (!s.jobs.some((x) => x.id === action.jobId)) fail("Nie znaleziono oferty.");
    const index = s.saved.findIndex((x) => x.candidateId === p.id && x.jobId === action.jobId);
    if (index >= 0) s.saved.splice(index, 1);
    else s.saved.push({ candidateId: p.id, jobId: action.jobId });
  } else if (action.type === "draft") {
    const p = candidate();
    const draft = draftSchema.parse({ candidateId: p.id, ...action });
    s.drafts = s.drafts.filter((x) => !(x.candidateId === p.id && x.jobId === action.jobId));
    s.drafts.push(draft);
  } else if (action.type === "submit") {
    const p = candidate();
    const job = s.jobs.find((x) => x.id === action.jobId && x.publicationStatus === "published");
    if (!job) return fail("Oferta nie jest dostępna.");
    if (!action.consent) fail("Zatwierdź treść i zgodę na przesłanie aplikacji.");
    if (s.applications.some((x) => x.candidateId === p.id && x.jobId === job.id))
      fail("Aplikacja na tę ofertę została już wysłana.");
    s.applications.push(
      applicationSchema.parse({
        id: newId,
        candidateId: p.id,
        jobId: job.id,
        companyId: job.companyId,
        jobTitle: job.title,
        candidateName: p.name,
        cv: p.cv,
        answer: action.answer,
        sourceNotes: action.notes,
        generatedAnswer: action.generated,
        score: p.exampleScore,
        summary: p.exampleSummary,
        stage: "submitted",
        events: [{ stage: "submitted", at: now, note: "" }],
        ...(action.conditions && Object.values(action.conditions).some((x) => x !== undefined)
          ? { conditions: conditionsSchema.parse(action.conditions) }
          : {}),
      }),
    );
    s.drafts = s.drafts.filter((x) => !(x.candidateId === p.id && x.jobId === job.id));
  } else if (action.type === "stage" || action.type === "withdraw") {
    const application = s.applications.find((x) => x.id === action.applicationId);
    if (!application) return fail("Nie znaleziono aplikacji.");
    const stage = action.type === "withdraw" ? "withdrawn" : action.stage;
    if (action.type === "withdraw") {
      const p = candidate();
      if (
        application.candidateId !== p.id ||
        ["hired", "rejected", "withdrawn"].includes(application.stage)
      )
        fail("Nie można wycofać tej aplikacji.");
    } else {
      const p = employer();
      if (application.companyId !== p.companyId || !nextStages[application.stage].includes(stage))
        fail("Ta zmiana etapu nie jest dostępna.");
    }
    application.stage = stage;
    application.events.push({ stage, at: now, note: action.type === "stage" ? action.note : "" });
  } else if (action.type === "publish") {
    const p = employer();
    const job = jobSchema.parse(action.job);
    if (job.companyId !== p.companyId) fail("Wybierz ofertę własnej firmy.");
    const index = s.jobs.findIndex((x) => x.id === job.id);
    if (index >= 0) {
      if (s.jobs[index].companyId !== p.companyId) fail("Nie można zmienić tej oferty.");
      s.jobs[index] = job;
    } else s.jobs.unshift(job);
  } else if (action.type === "invite") {
    const p = employer();
    if (action.applicationIds.length < 1 || action.applicationIds.length > MAX_INVITES)
      fail(`Wybierz od 1 do ${MAX_INVITES} osób.`);
    for (const applicationId of action.applicationIds) {
      const application = s.applications.find(
        (x) => x.id === applicationId && x.companyId === p.companyId,
      );
      if (!application) return fail("Nie znaleziono aplikacji.");
      // Invitation walks the normal path: submitted → reviewed → interview_invited.
      if (application.stage === "submitted") {
        application.stage = "reviewed";
        application.events.push({ stage: "reviewed", at: now, note: "" });
      }
      if (application.stage !== "reviewed") fail("Tę osobę zaproszono już wcześniej.");
      application.stage = "interview_invited";
      application.events.push({ stage: "interview_invited", at: now, note: "" });
    }
  } else if (
    action.type === "still_considering" ||
    action.type === "answer_status" ||
    action.type === "ask_status"
  ) {
    const application = s.applications.find((x) => x.id === action.applicationId);
    if (!application) return fail("Nie znaleziono aplikacji.");
    if (!isWaiting(application)) fail("Ta aplikacja jest już zakończona.");
    application.updates ??= [];
    if (action.type === "ask_status") {
      const p = candidate();
      if (application.candidateId !== p.id) fail("Nie można zapytać o tę aplikację.");
      if (pendingQuestion(application)) fail("Pytanie o status czeka już na odpowiedź.");
      if (daysUntilStatusQuestion(application, Date.parse(now)) > 0)
        fail(`O status zapytasz po ${ASK_STATUS_AFTER_DAYS} dniach.`);
      application.updates.push({ kind: "question", at: now });
    } else {
      const p = employer();
      if (application.companyId !== p.companyId) fail("Nie można zmienić tej aplikacji.");
      if (action.type === "still_considering") {
        application.updates.push({ kind: "considering", at: now });
      } else {
        if (!pendingQuestion(application)) fail("Brak pytania o status.");
        application.updates.push({ kind: "answer", at: now, answer: action.answer });
        if (action.answer === "rejected") {
          application.stage = "rejected";
          application.events.push({ stage: "rejected", at: now, note: "" });
        }
      }
    }
  } else if (action.type === "status_message") {
    const p = employer();
    const reason = text.parse(action.reason);
    if (reason.length < 10) fail("Napisz powód oczekiwania (co najmniej 10 znaków).");
    if (!day.safeParse(action.nextContact).success || action.nextContact < now.slice(0, 10))
      fail("Podaj orientacyjną datę kolejnego kontaktu (dziś lub później).");
    const targets = s.applications.filter(
      (x) => action.applicationIds.includes(x.id) && x.companyId === p.companyId && isWaiting(x),
    );
    if (!targets.length) fail("Brak oczekujących kandydatów.");
    for (const application of targets) {
      application.updates ??= [];
      application.updates.push({
        kind: "message",
        at: now,
        reason,
        nextContact: action.nextContact,
      });
    }
  } else if (action.type === "reminder") {
    const p = employer();
    s.companies.find((x) => x.id === p.companyId)!.reminder = reminderSchema.parse(action.value);
  } else if (action.type === "company") {
    const p = employer();
    Object.assign(
      s.companies.find((x) => x.id === p.companyId)!,
      { name: shortText.parse(action.name), description: text.parse(action.description) },
    );
  }
  return stateSchema.parse(s);
}
