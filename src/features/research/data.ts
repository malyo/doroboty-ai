/**
 * Sample data for the EXP1–EXP3 research prototypes. All people are fictional and generated
 * deterministically, so every test session sees the same lists. Nothing here is sent anywhere.
 */

import type { CandidateConditions } from "@/features/applications/conditions";
export {
  availabilityLabels,
  bandLabels,
  bandRanges,
  responseTimeDays,
  responseTimeLabels,
  workModeLabels,
} from "@/features/applications/conditions";
export type {
  Availability,
  CandidateConditions,
  ResponseTime,
  SalaryBand,
  WorkMode,
} from "@/features/applications/conditions";
import type {
  Availability,
  ResponseTime,
  SalaryBand,
  WorkMode,
} from "@/features/applications/conditions";

export type ResearchApplication = {
  id: string;
  name: string;
  headline: string;
  summary: string;
  score: number;
  status: "new" | "reviewed";
  ageDays: number;
  conditions: CandidateConditions;
};

export type ResearchJob = {
  key: string;
  title: string;
  company: string;
  location: string;
  salary: { min: number; max: number; contract: string };
  scope: string;
};

/** Two postings for EXP1, so variant A and B can run on different lists. */
export const p1Jobs: ResearchJob[] = [
  {
    key: "ml",
    title: "Senior ML Engineer (LLM)",
    company: "Wektor Labs",
    location: "Kraków / hybrydowo",
    salary: { min: 26000, max: 32000, contract: "B2B" },
    scope: "Budowa i utrzymanie modeli językowych w produkcie dla działów obsługi klienta.",
  },
  {
    key: "pm",
    title: "AI Product Manager",
    company: "Wektor Labs",
    location: "Warszawa / hybrydowo",
    salary: { min: 22000, max: 29000, contract: "Umowa o pracę" },
    scope: "Prowadzenie produktu od problemu operacyjnego do mierzalnego wdrożenia AI.",
  },
];

/** The EXP2 posting the candidate applied to 7 days ago. */
export const p2Job: ResearchJob = {
  key: "p2",
  title: "Senior Data Scientist",
  company: "Wektor Labs",
  location: "Zdalnie",
  salary: { min: 24000, max: 30000, contract: "B2B" },
  scope:
    "Modele prognozowania popytu i eksperymenty cenowe; własność metryk jakości i współpraca z zespołem produktu.",
};

/** The EXP3 posting the recruiter creates and the candidate applies to (defaults before publishing). */
export const p3Defaults = {
  title: "Lider zespołu AI",
  company: "Wektor Labs",
  location: "Warszawa / hybrydowo",
  market: { min: 28000, max: 36000, median: 32000, contract: "B2B", period: "mies." },
};

const femaleNames = [
  "Agnieszka",
  "Celina",
  "Ewa",
  "Gabriela",
  "Iga",
  "Katarzyna",
  "Magdalena",
  "Oliwia",
  "Renata",
  "Teresa",
  "Zofia",
  "Beata",
];
const maleNames = [
  "Bartosz",
  "Dawid",
  "Filip",
  "Hubert",
  "Jakub",
  "Łukasz",
  "Norbert",
  "Paweł",
  "Szymon",
  "Wiktor",
  "Adrian",
  "Cezary",
];
/** Surname pairs: feminine and masculine form. */
const lastNames: [string, string][] = [
  ["Wróblewska", "Wróblewski"],
  ["Szczepańska-Bąk", "Szczepański-Bąk"],
  ["Kowalczyk", "Kowalczyk"],
  ["Zielińska", "Zieliński"],
  ["Lewandowska", "Lewandowski"],
  ["Dąbrowska", "Dąbrowski"],
  ["Mazur", "Mazur"],
  ["Krawczyk", "Krawczyk"],
  ["Piątek", "Piątek"],
  ["Grabowska", "Grabowski"],
  ["Pawlak", "Pawlak"],
  ["Michalska", "Michalski"],
  ["Król", "Król"],
  ["Wieczorek-Nowicka", "Wieczorek-Nowicki"],
  ["Jabłońska", "Jabłoński"],
  ["Nowakowska", "Nowakowski"],
  ["Majewska", "Majewski"],
  ["Olszewska", "Olszewski"],
  ["Stępień", "Stępień"],
  ["Malinowska", "Malinowski"],
];
const headlines = [
  "ML Engineer",
  "Data Scientist",
  "MLOps Engineer",
  "Backend Engineer",
  "Research Engineer",
  "Product Manager",
  "Analityk danych",
  "AI Engineer",
];
// Written without gendered verbs, so they fit every generated person.
const summaries = [
  "Wdrożenie modelu klasyfikacji zgłoszeń: czas obsługi krótszy o 30%.",
  "Migracja pipeline'u danych do chmury i monitoring jakości danych.",
  "System RAG dla dokumentacji wewnętrznej, używany przez 400 osób.",
  "Doświadczenie z fine-tuningiem modeli, mniejsze z wdrożeniami produkcyjnymi.",
  "Dwa lata odpowiedzialności za ewaluację modeli i zestawy testowe.",
  "Zmiana branży z finansów; mocne podstawy statystyki, krótko z LLM.",
  "Prowadzenie zespołu 4 osób; ostatnio więcej zarządzania niż pracy technicznej.",
  "Projekty open source z przetwarzania języka polskiego, bez pracy w produkcie.",
  "Automatyzacja raportowania i prognoz sprzedaży w e-commerce.",
  "Doświadczenie z modelami wizyjnymi, chęć przejścia do pracy z tekstem.",
];
const responseTimes: ResponseTime[] = ["3d", "7d", "14d", "any"];
const workModes: WorkMode[] = ["remote", "hybrid", "onsite", "any"];
const availabilities: Availability[] = ["now", "2w", "1m", "3m"];
const bands: SalaryBand[] = ["low", "mid", "high", "none"];

/** Small deterministic PRNG (mulberry32), so generated lists are stable between sessions. */
function random(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generate(
  prefix: string,
  seed: number,
  count: number,
  ages: [number, number],
): ResearchApplication[] {
  const next = random(seed);
  const pick = <T>(items: readonly T[]) => items[Math.floor(next() * items.length)];
  const used = new Set<string>();
  const people: ResearchApplication[] = [];
  for (let i = 0; people.length < count; i++) {
    const female = next() > 0.5;
    const first = pick(female ? femaleNames : maleNames);
    const [feminine, masculine] = pick(lastNames);
    const name = `${first} ${female ? feminine : masculine}`;
    if (used.has(name)) continue;
    used.add(name);
    people.push({
      id: `${prefix}-${String(people.length + 1).padStart(2, "0")}`,
      name,
      headline: pick(headlines),
      summary: pick(summaries),
      score: Math.round(28 + next() * 68),
      status: next() > 0.75 ? "reviewed" : "new",
      ageDays: Math.round(ages[0] + next() * (ages[1] - ages[0])),
      conditions: {
        minSalary: next() > 0.3 ? Math.round((18 + next() * 16) * 2) * 500 : undefined,
        workMode: pick(workModes),
        availability: pick(availabilities),
        responseTime: pick(responseTimes),
        band: pick(bands),
      },
    });
  }
  return people.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name, "pl"));
}

/** About 40 applications per EXP1 posting, sorted by Match Score (highest first). */
export const p1Applications: Record<string, ResearchApplication[]> = {
  ml: generate("ml", 41, 40, [1, 9]),
  pm: generate("pm", 77, 38, [1, 9]),
};

/** Applications waiting 3–16 days for the EXP2 recruiter task. */
export const p2Waiting: ResearchApplication[] = generate("p2", 13, 6, [3, 16]).sort(
  (a, b) => b.ageDays - a.ageDays,
);

/** Three applications with candidate conditions for the EXP3 review task. */
export const p3Applications: ResearchApplication[] = [
  {
    id: "p3-01",
    name: "Magdalena Kowalczyk",
    headline: "Head of Data · 9 lat doświadczenia",
    summary: "Zbudowała od zera zespół 6 osób i wdrożyła trzy modele w produkcji.",
    score: 86,
    status: "new",
    ageDays: 2,
    conditions: {
      minSalary: 34000,
      workMode: "hybrid",
      availability: "1m",
      responseTime: "7d",
      band: "high",
    },
  },
  {
    id: "p3-02",
    name: "Szymon Wieczorek-Nowicki",
    headline: "Senior ML Engineer · lider techniczny",
    summary: "Prowadzi zespół 3 osób; chce przejść do roli z większym mandatem decyzyjnym.",
    score: 78,
    status: "new",
    ageDays: 4,
    conditions: { workMode: "remote", availability: "now", responseTime: "3d", band: "mid" },
  },
  {
    id: "p3-03",
    name: "Ewa Szczepańska-Bąk",
    headline: "AI Product Lead · fintech",
    summary: "Odpowiadała za strategię AI w produkcie kredytowym i budżet zespołu.",
    score: 81,
    status: "new",
    ageDays: 1,
    conditions: { minSalary: 29000, availability: "2w", responseTime: "14d", band: "none" },
  },
];

export function formatSalary(min: number, max: number) {
  const fmt = new Intl.NumberFormat("pl-PL");
  return `${fmt.format(min)}–${fmt.format(max)} zł`;
}
