import { test, expect } from '@playwright/test';

test('health check — app is running', async ({ request }) => {
  const response = await request.get('/');
  expect(response.status()).toBeDefined();
});
