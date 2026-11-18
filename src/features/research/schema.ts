import { z } from "zod";
import { conditionsSchema } from "@/features/prototype/model";

/**
 * Zod schema of the research prototypes' local state (EXP1–EXP3). Shared by loading from
 * localStorage and importing an exported session, so both accept exactly the same shape.
 */
export const MAX_RESEARCH_BYTES = 2_000_000;

const text = (max: number) => z.string().max(max);

export const researchEventSchema = z.object({
  at: text(40),
  /** Milliseconds since the session started (facilitator's "Nowa sesja"). */
  ms: z.number(),
  prototype: z.enum(["P1", "P2", "P3", "HUB"]),
  type: text(100),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const p2ScenarioSchema = z.enum(["silence", "queue", "message", "message-no-salary"]);

const statusMessageSchema = z.object({
  reason: text(2000),
  nextContact: text(200),
  sentAt: text(40),
  to: z.number(),
});

const p3JobSchema = z.object({
  title: text(200),
  location: text(200),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  contract: text(100),
  salaryLater: z.boolean(),
  firstProject: text(4000),
  mandate: text(4000),
  process: text(4000),
  publishedAt: text(40),
});

export const researchStateSchema = z.object({
  sessionStartedAt: text(40),
  participant: text(80),
  /** Which posting runs variant A in task 1 (the other runs B); swapped between participants. */
  p1Order: z.enum(["ml-first", "pm-first"]),
  p2: z.object({
    scenario: p2ScenarioSchema,
    askAfterDays: z.number(),
    considering: z.record(z.string(), text(40)),
    statusMessages: z.array(statusMessageSchema).max(500),
    question: z
      .object({
        askedAt: text(40),
        answer: z.enum(["considering", "rejected"]).optional(),
        answeredAt: text(40).optional(),
      })
      .optional(),
    withdrawnAt: text(40).optional(),
    reminder: z.object({
      enabled: z.boolean(),
      days: z.number(),
      audience: z.enum(["all", "preference"]),
      reason: text(2000),
      savedAt: text(40).optional(),
    }),
  }),
  p3: z.object({
    job: p3JobSchema.optional(),
    conditions: conditionsSchema.extend({ submittedAt: text(40), skipped: z.boolean() }).optional(),
  }),
  events: z.array(researchEventSchema).max(50_000),
});

export type ResearchEvent = z.infer<typeof researchEventSchema>;
export type P2Scenario = z.infer<typeof p2ScenarioSchema>;
export type StatusMessage = z.infer<typeof statusMessageSchema>;
export type P3Job = z.infer<typeof p3JobSchema>;
export type ResearchState = z.infer<typeof researchStateSchema>;

/** Fills fields added after a session was saved, then validates the whole state. */
export function withDefaults(raw: unknown, base: ResearchState): ResearchState {
  const parsed = (raw && typeof raw === "object" ? raw : {}) as Partial<ResearchState>;
  return researchStateSchema.parse({
    ...base,
    ...parsed,
    p2: { ...base.p2, ...parsed.p2, reminder: { ...base.p2.reminder, ...parsed.p2?.reminder } },
    p3: { ...parsed.p3 },
    events: parsed.events ?? [],
  });
}

/**
 * Parses a file from "Eksportuj JSON" (`{ participant, sessionStartedAt, state, events }`) or a
 * bare state object. Throws a user-facing Polish message; the current session is never touched.
 */
export function parseResearchExport(raw: string, base: ResearchState): ResearchState {
  if (new TextEncoder().encode(raw).length > MAX_RESEARCH_BYTES)
    throw new Error("Plik jest za duży (maksymalnie 2 MB).");
  try {
    const json: unknown = JSON.parse(raw);
    const exported = json as { state?: unknown; events?: unknown };
    const candidate =
      exported && typeof exported === "object" && "state" in exported
        ? { ...(exported.state as object), events: exported.events }
        : json;
    return withDefaults(candidate, base);
  } catch {
    throw new Error(
      "To nie jest poprawny plik dziennika badania (JSON z „Eksportuj JSON”). Bieżąca sesja pozostaje bez zmian.",
    );
  }
}
