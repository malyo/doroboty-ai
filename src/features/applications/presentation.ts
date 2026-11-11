export const applicationStatusLabels = {
  submitted: "Nowa aplikacja",
  in_review: "W przeglądzie",
  interview: "Etap rozmowy",
  continued: "Kolejny etap",
  rejected: "Proces zakończony",
  withdrawn: "Wycofana",
  hired: "Zatrudniona/y",
} as const;

export const applicationStageLabels = {
  submitted: "Aplikacja wysłana",
  reviewed: "Aplikacja przejrzana",
  interview_invited: "Zaproszenie na rozmowę",
  first_conversation_held: "Pierwsza rozmowa odbyta",
  continued: "Przejście do kolejnego etapu",
  rejected: "Proces zakończony",
  withdrawn: "Aplikacja wycofana",
  hired: "Zatrudnienie",
} as const;

export type ApplicationStatus = keyof typeof applicationStatusLabels;

export function applicationStatusLabel(status: string) {
  return applicationStatusLabels[status as ApplicationStatus] ?? "Status nieznany";
}

export const applicationStatusDescriptions: Record<string, string> = {
  submitted: "Pracodawca otrzymał aplikację. Na tym etapie nie musisz nic robić.",
  in_review: "Pracodawca przegląda Twoje zgłoszenie.",
  interview: "Proces jest na etapie rozmowy. Szczegóły zaproszenia otrzymasz od pracodawcy.",
  continued: "Pracodawca chce kontynuować proces i skontaktuje się w sprawie kolejnego kroku.",
  rejected: "Pracodawca zakończył proces dla tej aplikacji.",
  withdrawn: "Aplikacja została przez Ciebie wycofana i nie bierze już udziału w procesie.",
  hired: "Proces zakończył się zatrudnieniem.",
};

export function applicationStatusDescription(status: string) {
  return applicationStatusDescriptions[status] ?? "Status aplikacji został zaktualizowany.";
}

export function applicationStageLabel(stage: string) {
  return applicationStageLabels[stage as keyof typeof applicationStageLabels] ?? "Zmiana etapu";
}

// Instrument status badges carry no colour: green means only "available" and orange only the main action.
// In-progress states get an ink frame (.badge.warn), closed states are muted (.badge.off).
export function applicationStatusClass(status: string) {
  if (status === "interview" || status === "continued") {
    return "border-[var(--ink)] text-[var(--ink)]";
  }
  if (status === "rejected" || status === "withdrawn") {
    return "border-[var(--rule)] text-[var(--mute)]";
  }
  return "border-[var(--frame)] text-[var(--ink)]";
}
