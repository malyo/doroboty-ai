import { test, expect, type Page } from "@playwright/test";

const RESEARCH_KEY = "doroboty-research-v1";

async function events(page: Page) {
  return page.evaluate(
    (key) =>
      (JSON.parse(localStorage.getItem(key) ?? "{}").events ?? []) as {
        prototype: string;
        type: string;
        data?: Record<string, unknown>;
      }[],
    RESEARCH_KEY,
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate((key) => localStorage.removeItem(key), RESEARCH_KEY);
});

test("P1: variant B folds the list, limits selection to three and logs the choice", async ({
  page,
}) => {
  await page.goto("/#/badanie");
  await page.getByRole("link", { name: "Otwórz" }).nth(1).click();
  await expect(page).toHaveURL(/#\/badanie\/p1\/pm\/B$/);
  await expect(page.locator(".shortlist .row")).toHaveCount(10);
  await expect(page.getByText("★ Top 3")).toHaveCount(3);
  const rest = page.getByRole("button", { name: /^Pokaż pozostałe \(\d+\)$/ });
  await expect(rest).toHaveText("Pokaż pozostałe (28)");
  const boxes = page.locator(".shortlist input.chk");
  for (const index of [0, 1, 5]) await boxes.nth(index).check();
  await expect(boxes.nth(2)).toBeDisabled();
  await expect(page.locator(".row.sl")).toHaveCount(3);
  await rest.click();
  await expect(page.locator(".shortlist .row")).toHaveCount(38);
  await page.getByRole("button", { name: "Zaproś 3 osoby na rozmowę" }).click();
  await expect(page.getByText("3 osoby zaproszone na rozmowę")).toBeVisible();
  const invite = (await events(page)).find((e) => e.type === "invite");
  expect(invite?.data).toMatchObject({
    job: "pm",
    variant: "B",
    expanded: true,
    highlightedChosen: 2,
    threshold: 0,
    perPage: 10,
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("P1: variant A shows the full list without sliders or highlights", async ({ page }) => {
  await page.goto("/#/badanie/p1/ml/A");
  await expect(page.locator(".shortlist .row")).toHaveCount(40);
  await expect(page.locator('input[type="range"]')).toHaveCount(0);
  await expect(page.getByText("★ Top 3")).toHaveCount(0);
});

test("P2: the candidate asks about status and sees the answer only after the recruiter clicks", async ({
  page,
}) => {
  await page.goto("/#/badanie");
  await page.getByRole("button", { name: "(3) „Rekrutacja trwa” z widełkami" }).click();
  await expect(page.getByText("24 000–30 000 zł · B2B")).toBeVisible();
  await expect(page.getByText("Pracodawca nadal rozważa Twoje zgłoszenie.")).toHaveCount(0);
  await page.getByRole("button", { name: "Zapytaj o status" }).click();
  await expect(page.getByText(/Pracodawca jeszcze nie odpowiedział/)).toBeVisible();
  await page
    .getByRole("region", { name: "Pasek prowadzącego badanie" })
    .getByRole("button", { name: "Rekruter" })
    .click();
  await page.getByRole("button", { name: "Nadal rozważam", exact: true }).first().click();
  await page
    .getByRole("region", { name: "Pasek prowadzącego badanie" })
    .getByRole("button", { name: "Kandydat" })
    .click();
  await expect(page.getByText("Pracodawca nadal rozważa Twoje zgłoszenie.")).toBeVisible();
  // Variant 3 without salary hides the range but keeps the role scope.
  await page.getByRole("combobox").selectOption("message-no-salary");
  await expect(page.getByText("24 000–30 000 zł · B2B")).toHaveCount(0);
  await expect(page.getByText(/Modele prognozowania popytu/)).toBeVisible();
});

test("P2: the status message needs a reason and a date; reminders save a preview", async ({
  page,
}) => {
  await page.goto("/#/badanie/p2/rekruter");
  await page
    .getByRole("button", { name: "Wyślij wszystkim kandydatom informację, że rekrutacja trwa" })
    .click();
  await page.getByRole("button", { name: "Wyślij do 6 osób" }).click();
  await expect(page.getByRole("alert")).toContainText("powód oczekiwania");
  await expect(page.getByLabel("Powód oczekiwania")).toBeFocused();
  await page.getByRole("button", { name: "Czekamy na zatwierdzenie budżetu." }).click();
  const date = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
  await page.getByLabel("Orientacyjna data kolejnego kontaktu").fill(date);
  await page.getByRole("button", { name: "Wyślij do 6 osób" }).click();
  await expect(page.getByText("Wysłano informację do 6 osób.")).toBeVisible();
  await page
    .getByRole("button", { name: /^Nadal rozważam: / })
    .first()
    .click();
  await expect(page.getByText(/^Nadal rozważam · /)).toBeVisible();
  await page.getByRole("link", { name: "Ustawienia przypomnień" }).click();
  await page.getByLabel("Wysyłaj przypomnienie automatycznie").check();
  await page.getByLabel("Po ilu dniach bez odpowiedzi").selectOption("10");
  await page.getByRole("button", { name: "Zapisz ustawienia" }).click();
  await expect(page.getByText("Ustawienia przypomnień zapisane.")).toBeVisible();
  const saved = (await events(page)).find((e) => e.type === "reminder_saved");
  expect(saved?.data).toMatchObject({ enabled: true, days: 10 });
});

test("P3: skipping the salary needs „Dodam później”; the candidate states conditions; review invites", async ({
  page,
}) => {
  await page.goto("/#/badanie/p3/ogloszenie");
  await page.getByRole("button", { name: "Dalej: wynagrodzenie i zakres" }).click();
  await expect(
    page.getByText("Ogłoszenia z widełkami częściej kończą się rozmową", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Dalej: podgląd" }).click();
  await expect(page.getByRole("alert")).toContainText("Nie podano widełek.");
  await page.getByRole("button", { name: "Dodam później" }).click();
  await page.getByRole("button", { name: "Dalej: podgląd" }).click();
  await page.getByRole("button", { name: "Opublikuj ogłoszenie" }).click();
  await expect(page.getByText("— (dodam później)")).toBeVisible();
  expect((await events(page)).some((e) => e.type === "salary_later")).toBe(true);

  await page.goto("/#/badanie/p3/warunki");
  await expect(page.getByText("To ogłoszenie nie ma widełek", { exact: false })).toBeVisible();
  await page.getByRole("radio", { name: "Do tygodnia" }).check();
  await page.getByRole("button", { name: "Wyślij zgłoszenie z warunkami" }).click();
  await expect(page.getByRole("heading", { name: "Zgłoszenie wysłane" })).toBeVisible();
  const submitted = (await events(page)).find((e) => e.type === "conditions_submitted");
  expect(submitted?.data).toMatchObject({
    skipped: false,
    filled: { responseTime: true, minSalary: false, band: false },
  });

  await page.goto("/#/badanie/p3/zgloszenia");
  await expect(page.locator(".review-list .kv.conditions")).toHaveCount(3);
  await page.getByRole("checkbox", { name: "Zaproś na rozmowę: Ewa Szczepańska-Bąk" }).check();
  await page.getByRole("button", { name: "Zaproś 1 osobę na rozmowę" }).click();
  await expect(page.getByText("1 osoba zaproszona")).toBeVisible();
});

test("facilitator panel exports the event log and starts a new session", async ({ page }) => {
  await page.goto("/#/badanie");
  await page.getByLabel("Uczestnik (kod, bez danych osobowych)").fill("R01");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Eksportuj CSV" }).click();
  expect((await download).suggestedFilename()).toBe("badanie-R01.csv");
  await page.getByRole("button", { name: "Nowa sesja" }).click();
  await page.getByRole("button", { name: "Wyczyść i zacznij" }).click();
  await expect(page.locator(".empty")).toContainText("0 zdarzeń");
});
