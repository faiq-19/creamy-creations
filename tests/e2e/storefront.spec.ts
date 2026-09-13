import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

test("gallery URL filters, lightbox keyboard navigation and focus return", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "For moments worth a little celebration.",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore the gallery" }).click();
  await page.getByRole("link", { name: "Wedding", exact: true }).click();
  await expect(page).toHaveURL(/category=Wedding/);
  const trigger = page.getByRole("button", { name: /Wedding: view/ });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({path:`artifacts/ui/gallery-lightbox-${page.viewportSize()?.width}.png`});
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole("link", { name: /Request a similar cake/ }).click();
  await expect(page).toHaveURL(/custom-cake\?design=/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("ready cart respects stock, persists and expands summary", async ({
  page,
}) => {
  await page.goto("/shop");
  const add = page.getByRole("button", {
    name: "Add to bag +: Fudgy chocolate brownies",
  });
  for (let i = 0; i < 10; i++) await add.click();
  await page.getByRole("link", { name: /Shopping bag/ }).click();
  const quantity = page.getByRole("spinbutton", {
    name: "Quantity for Fudgy chocolate brownies",
  });
  await expect(quantity).toHaveValue("8");
  await page.reload();
  await expect(quantity).toHaveValue("8");
  await expect(
    page.getByText("Preparation time", { exact: false }).first(),
  ).toBeVisible();
  await page.screenshot({path:`artifacts/ui/checkout-filled-${page.viewportSize()?.width}.png`,fullPage:true});
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page
    .getByRole("button", { name: "Remove Fudgy chocolate brownies" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Your bag is waiting for something sweet.",
    }),
  ).toBeVisible();
});

test("eight-step cake brief validates, restores text and reviews", async ({
  page,
}) => {
  await page.goto("/custom-cake");
  const next = page.getByRole("button", { name: "Continue", exact: true });
  await next.click();
  await expect(page.getByLabel("Event date", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await page.getByLabel("Event date", { exact: true }).fill("2099-01-01");
  await page.getByLabel("Required time / delivery window").fill("15:00");
  await next.click();
  await expect(
    page.getByRole("heading", { name: "A slice for everyone." }),
  ).toBeVisible();
  await next.click();
  await expect(
    page.getByRole("heading", { name: "Now for the delicious part." }),
  ).toBeVisible();
  await next.click();
  await page.getByLabel("Theme or inspiration").fill("Ivory roses");
  await page.waitForTimeout(500);
  await page.reload();
  await expect(page.getByLabel("Theme or inspiration")).toHaveValue(
    "Ivory roses",
  );
  await next.click();
  await expect(
    page.getByRole("heading", { name: "Show us what you love." }),
  ).toBeVisible();
  await page
    .getByLabel("Reference images")
    .setInputFiles("public/images/cupcakes.webp");
  await expect(page.getByRole("img", { name: /Your reference/ })).toBeVisible();
  await next.click();
  await page.getByLabel("pickup", { exact: true }).check();
  await next.click();
  await page.getByLabel("Budget range (PKR)").fill("5000–7000");
  await page.getByLabel("Your name", { exact: true }).fill("Demo Customer");
  await page.getByLabel("WhatsApp number", { exact: true }).fill("03001234567");
  await next.click();
  await expect(
    page.getByRole("heading", { name: "Your idea, all together." }),
  ).toBeVisible();
  await expect(page.getByText("Ivory roses", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Send my cake request/ }),
  ).toBeDisabled();
  await page.screenshot({path:`artifacts/ui/custom-review-${page.viewportSize()?.width}.png`,fullPage:true});
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Clear saved draft" }).click();
  await page.getByRole("button", { name: "Keep my draft" }).click();
  await expect(
    page.getByRole("heading", { name: "Your idea, all together." }),
  ).toBeVisible();
});

test("mobile navigation closes with Escape and returns focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Open navigation",
    exact: true,
  });
  await trigger.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("admin, preview and private images fail closed in production", async ({
  page,
  request,
}) => {
  await page.goto("/admin/orders");
  await expect(page).toHaveURL("/login");
  expect(
    (
      await request.post("/api/admin", {
        data: { action: "verify", id: "00000000-0000-4000-8000-000000000001" },
      })
    ).status(),
  ).toBe(401);
  expect(
    (
      await request.get(
        "/api/upload?bucket=payments&path=private.jpg&thumbnail=1",
      )
    ).status(),
  ).toBe(401);
  await page.goto("/design-preview");
  await expect(
    page.getByRole("heading", { name: "This little page is missing." }),
  ).toBeVisible();
});
