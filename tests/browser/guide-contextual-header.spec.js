import {test,expect} from '@playwright/test';

const courseControls=[
 '.app-header-brand','#progress-label','#advanced-course-btn',
 '#advanced-cert-top-btn','#certificate-btn'
];

test('Lesson Guide hides course-only controls but preserves editor tools and settings',async({page})=>{
 await page.goto('/');
 const guide=page.locator('#theory-pane-toggle-btn');
 await expect(page.locator('#theory-panel')).toBeVisible();
 await expect(guide).toHaveAttribute('aria-pressed','true');
 for(const selector of courseControls)await expect(page.locator(selector)).toBeVisible();

 await guide.click();
 await expect(page.locator('#theory-panel')).toBeHidden();
 await expect(guide).toHaveAttribute('aria-pressed','false');
 await expect(guide).toHaveAttribute('aria-expanded','false');
 for(const selector of courseControls)await expect(page.locator(selector)).toBeHidden();
 for(const selector of ['#contents-toggle-btn','#sandbox-mode-btn','#cheatsheet-btn','#theme-selector','#lang-selector','#markdown-input','#markdown-preview'])
  await expect(page.locator(selector)).toBeVisible();

 await page.reload();
 await expect(guide).toHaveAttribute('aria-pressed','false');
 for(const selector of courseControls)await expect(page.locator(selector)).toBeHidden();
 await guide.click();
 await expect(page.locator('#theory-panel')).toBeVisible();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeVisible();
});

test('Sandbox hides course header and Lesson Guide button restores the course',async({page})=>{
 await page.goto('/');
 await page.locator('#sandbox-mode-btn').click();
 await expect(page.locator('#theory-panel')).toBeHidden();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeHidden();
 await expect(page.locator('#sandbox-mode-btn')).toBeVisible();
 await page.locator('#theory-pane-toggle-btn').click();
 await expect(page.locator('#theory-panel')).toBeVisible();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeVisible();
});

test('Course-only controls do not reappear at larger responsive breakpoints',async({page})=>{
 await page.setViewportSize({width:1650,height:900});
 await page.goto('/');
 await page.locator('#theory-pane-toggle-btn').click();
 for(const selector of ['.app-header-brand','#advanced-course-btn','#advanced-cert-top-btn','#certificate-btn'])
  await expect(page.locator(selector)).toBeHidden();
 await expect(page.locator('#progress-label')).toBeHidden();
});
