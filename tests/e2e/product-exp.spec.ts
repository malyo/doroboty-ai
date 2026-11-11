import { test, expect, type Page } from "@playwright/test";

async function choose(page: Page, name: string) {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: `Wejdź jako ${name}`, exact: true }).click();
}

test("EXP2 in the product: status message, question and answer reach the candidate", async ({
  page,
}) => {
  await choose(page, "Karolina Wiśniewska");
  await page.goto("/#/app/kandydaci");
  await expect(page.getByText("★ Top 3", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Wyślij wszystkim kandydatom informację, że rekrutacja trwa" })
    .click();
  await page.getByRole("button", { name: /^Wyślij do 1 / }).click();
  await expect(page.getByRole("alert")).toContainText("powód oczekiwania");
  await page.getByRole("button", { name: "Czekamy na zatwierdzenie budżetu." }).click();
  const date = new Date(Date.now() + 5 * 864e5).toISOString().slice(0, 10);
  await page.getByLabel("Orientacyjna data kolejnego kontaktu").fill(date);
  await page.getByRole("button", { name: /^Wyślij do 1 / }).click();
  await expect(page.getByText(/Wysłano informację do 1/)).toBeVisible();

  await choose(page, "Marek Nowak");
  await page.goto("/#/app/aplikacje/application-example");
  const panel = page.getByRole("region", { name: "Status od pracodawcy" });
  await expect(panel).toContainText("Czekamy na zatwierdzenie budżetu.");
  await expect(panel).toContainText("22 000–29 000 zł");
  await panel.getByRole("button", { name: "Zapytaj o status" }).click();
  await expect(panel).toContainText("Pracodawca jeszcze nie odpowiedział.");

  await choose(page, "Karolina Wiśniewska");
  await page.goto("/#/app/kandydaci");
  await expect(page.getByText("Pyta o status")).toBeVisible();
  await page.getByRole("link", { name: "Marek Nowak", exact: true }).click();
  await expect(page.getByRole("group", { name: "Pytanie o status" })).toBeVisible();
  await page
    .getByRole("group", { name: "Pytanie o status" })
    .getByRole("button", { name: "Nadal rozważam" })
    .click();

  await choose(page, "Marek Nowak");
  await page.goto("/#/app/aplikacje/application-example");
  await expect(panel).toContainText("Pracodawca nadal rozważa Twoje zgłoszenie.");
  await expect(panel.getByRole("button", { name: "Zapytaj o status" })).toHaveCount(0);
});

test("EXP1 and EXP3 in the product: conditions with the application, shortlist invite", async ({
  page,
}) => {
  await choose(page, "Anna Kowalska");
  await page.goto("/#/aplikuj/ai-product-manager");
  await page.getByLabel("Minimalne wynagrodzenie (zł / mies.)").fill("27000");
  await page.getByRole("radio", { name: "Do 3 dni" }).check();
  await page.getByRole("radio", { name: /^Górna część/ }).check();
  await page
    .getByLabel("Dlaczego pasujesz do tej roli?")
    .fill("Prowadziłam badania i wdrożenie automatyzacji obsługi zgłoszeń w produkcie B2B.");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Wyślij aplikację", exact: true }).click();
  await expect(page.getByText("Aplikacja została wysłana.", { exact: false })).toBeVisible();

  await choose(page, "Karolina Wiśniewska");
  await page.goto("/#/app/kandydaci");
  await page.getByRole("link", { name: "Anna Kowalska", exact: true }).click();
  const conditions = page.locator(".kv.conditions");
  await expect(conditions).toContainText("27 000 zł");
  await expect(conditions).toContainText("Do 3 dni");
  await expect(conditions).toContainText("Górna część");

  await page.goto("/#/app/kandydaci");
  await page.getByRole("checkbox", { name: "Zaproś na rozmowę: Anna Kowalska" }).check();
  await page.getByRole("checkbox", { name: "Zaproś na rozmowę: Marek Nowak" }).check();
  await expect(page.locator(".candidates-list .row.sl")).toHaveCount(2);
  await page.getByRole("button", { name: "Zaproś 2 osoby na rozmowę" }).click();
  await expect(page.getByText(/Zaproszono na rozmowę:/)).toBeVisible();
  await expect(page.getByText("Zaproszenie na rozmowę").first()).toBeVisible();
});

test("EXP2 reminder settings save on the organization page", async ({ page }) => {
  await choose(page, "Karolina Wiśniewska");
  await page.goto("/#/app/organizacja");
  await page.getByLabel("Wysyłaj przypomnienie automatycznie").check();
  await page.getByLabel("Po ilu dniach bez odpowiedzi").selectOption("5");
  await page.getByRole("button", { name: "Zapisz ustawienia przypomnień" }).click();
  await expect(page.getByText("Ustawienia przypomnień zapisane.")).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Po ilu dniach bez odpowiedzi")).toHaveValue("5");
});
