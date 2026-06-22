import { expect, test } from '@playwright/test';

test('preview wrapper renders meaningful summary content from mocked API responses', async ({ page }) => {
  await page.route('**/api/health', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: 'ok' }),
    });
  });

  await page.route('**/api/project-summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        title: 'A Novel Chaos-Optimized TabNet Model for Prediction of Non-Communicable Diseases',
        repositoryType: 'fullstack-research-project',
        summary: 'Repository inspection found preview-relevant assets and configuration files.',
        artifacts: [
          { name: 'main.py', path: 'backend/main.py', kind: 'file' },
          { name: 'page.tsx', path: 'frontend/src/App.tsx', kind: 'file' },
        ],
        runNotes: [
          'Preview wrapper starts independently of the research code\'s training/runtime assumptions.',
          'Primary research assets live under API/ and the UI app lives under UI/.',
        ],
      }),
    });
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: /chaos-optimized tabnet disease prediction preview/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /a novel chaos-optimized tabnet model for prediction of non-communicable diseases/i })).toBeVisible();
  await expect(page.getByText('Repository inspection found preview-relevant assets and configuration files.')).toBeVisible();
  await expect(page.getByText('backend/main.py')).toBeVisible();
  await expect(page.getByText('frontend/src/App.tsx')).toBeVisible();
  await expect(page.getByText('Preview metadata unavailable')).toHaveCount(0);
  await expect(page.getByText('Loading repository preview')).toHaveCount(0);
});
