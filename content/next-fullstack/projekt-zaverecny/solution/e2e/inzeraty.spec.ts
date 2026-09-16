import { expect, test } from '@playwright/test';

test('návštěvník si projde seznam i detail', async ({ page }) => {
  await page.goto('/inzeraty');
  await expect(page.getByRole('heading', { name: 'Inzeráty' })).toBeVisible();

  const prvni = page.locator('.karta a').first();
  const nazev = await prvni.innerText();
  await prvni.click();

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(nazev);
});

test('neznámý inzerát vrátí 404', async ({ page }) => {
  const odpoved = await page.goto('/inzeraty/takovy-tu-neni');
  expect(odpoved?.status()).toBe(404);
});

test('nepřihlášený se na přidání inzerátu nedostane', async ({ page }) => {
  await page.goto('/inzeraty/novy');
  await expect(page).toHaveURL(/\/prihlaseni/);
});
