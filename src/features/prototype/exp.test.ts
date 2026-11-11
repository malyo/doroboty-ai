import { describe, expect, it } from "vitest";
import { initialState, pendingQuestion, transition, type State } from "./model";

const later = (days: number) =>
  new Date(Date.parse("2026-11-02T09:00:00.000Z") + days * 864e5).toISOString();

function as(state: State, id: string) {
  return transition(state, { type: "select_person", id });
}

describe("EXP1–EXP3 product actions", () => {
  it("invites up to three people through the normal stage path", () => {
    const s = as(initialState(), "employer-brightlabs");
    const next = transition(
      s,
      { type: "invite", applicationIds: ["application-example"] },
      later(3),
    );
    const app = next.applications[0];
    expect(app.stage).toBe("interview_invited");
    expect(app.events.map((x) => x.stage)).toEqual(["submitted", "reviewed", "interview_invited"]);
    expect(() =>
      transition(s, { type: "invite", applicationIds: ["a", "b", "c", "d"] }, later(3)),
    ).toThrow();
  });

  it("lets the candidate ask about status after 7 days and the employer answer once", () => {
    let s = as(initialState(), "candidate-marek");
    expect(() =>
      transition(s, { type: "ask_status", applicationId: "application-example" }, later(3)),
    ).toThrow(/7 dniach/);
    s = transition(s, { type: "ask_status", applicationId: "application-example" }, later(8));
    expect(pendingQuestion(s.applications[0])).toBeDefined();
    expect(() =>
      transition(s, { type: "ask_status", applicationId: "application-example" }, later(9)),
    ).toThrow(/czeka już/);
    s = as(s, "employer-brightlabs");
    s = transition(
      s,
      { type: "answer_status", applicationId: "application-example", answer: "considering" },
      later(9),
    );
    expect(pendingQuestion(s.applications[0])).toBeUndefined();
    expect(s.applications[0].stage).toBe("submitted");
    // Another question only 7 days after the previous one.
    s = as(s, "candidate-marek");
    expect(() =>
      transition(s, { type: "ask_status", applicationId: "application-example" }, later(10)),
    ).toThrow(/7 dniach/);
  });

  it("requires a reason and a future date for the status message", () => {
    const s = as(initialState(), "employer-brightlabs");
    const ids = ["application-example"];
    expect(() =>
      transition(
        s,
        {
          type: "status_message",
          applicationIds: ids,
          reason: "krótko",
          nextContact: "2026-11-20",
        },
        later(9),
      ),
    ).toThrow(/powód/);
    expect(() =>
      transition(
        s,
        {
          type: "status_message",
          applicationIds: ids,
          reason: "Czekamy na budżet zespołu.",
          nextContact: "2026-11-01",
        },
        later(9),
      ),
    ).toThrow(/datę/);
    const next = transition(
      s,
      {
        type: "status_message",
        applicationIds: ids,
        reason: "Czekamy na budżet zespołu.",
        nextContact: "2026-11-20",
      },
      later(9),
    );
    expect(next.applications[0].updates?.at(-1)).toMatchObject({
      kind: "message",
      nextContact: "2026-11-20",
    });
  });

  it("rejecting a status question ends the process", () => {
    let s = as(initialState(), "candidate-marek");
    s = transition(s, { type: "ask_status", applicationId: "application-example" }, later(8));
    s = as(s, "employer-brightlabs");
    s = transition(
      s,
      { type: "answer_status", applicationId: "application-example", answer: "rejected" },
      later(9),
    );
    expect(s.applications[0].stage).toBe("rejected");
  });
});
