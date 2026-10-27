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
 await expect(page.locator('#contents-toggle-btn')).toBeVisible();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeVisible();

 await guide.click();
 await expect(page.locator('#theory-panel')).toBeHidden();
 await expect(guide).toHaveAttribute('aria-pressed','false');
 await expect(guide).toHaveAttribute('aria-expanded','false');
 for(const selector of courseControls)await expect(page.locator(selector)).toBeHidden();
 await expect(page.locator('#contents-toggle-btn')).toBeHidden();
 for(const selector of ['#sandbox-mode-btn','#cheatsheet-btn','#theme-selector','#lang-selector','#markdown-input','#markdown-preview'])
  await expect(page.locator(selector)).toBeVisible();

 await page.reload();
 await expect(guide).toHaveAttribute('aria-pressed','false');
 await expect(page.locator('#contents-toggle-btn')).toBeHidden();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeHidden();
 await guide.click();
 await expect(page.locator('#theory-panel')).toBeVisible();
 await expect(page.locator('#contents-toggle-btn')).toBeVisible();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeVisible();
});

test('Sandbox hides course header and Lesson Guide button restores the course',async({page})=>{
 await page.goto('/');
 await page.locator('#sandbox-mode-btn').click();
 await expect(page.locator('#theory-panel')).toBeHidden();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeHidden();
 await expect(page.locator('#sandbox-mode-btn')).toBeVisible();
 await expect(page.locator('#contents-toggle-btn')).toBeHidden();
 await page.locator('#theory-pane-toggle-btn').click();
 await expect(page.locator('#theory-panel')).toBeVisible();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeVisible();
});

test('Course-only controls do not reappear at larger responsive breakpoints',async({page})=>{
 await page.setViewportSize({width:1650,height:900});
 await page.goto('/');
 await page.locator('#theory-pane-toggle-btn').click();
 for(const selector of ['#contents-toggle-btn','.app-header-brand','#advanced-course-btn','#advanced-cert-top-btn','#certificate-btn'])
  await expect(page.locator(selector)).toBeHidden();
 await expect(page.locator('#progress-label')).toBeHidden();
});

test('Mobile users can reopen Lesson Guide when Contents is hidden',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.evaluate(()=>{
  const key='md_course_state_v1';
  const saved=JSON.parse(localStorage.getItem(key)||'{}');
  localStorage.setItem(key,JSON.stringify({...saved,guideVisible:false}));
 });
 await page.reload();
 const guide=page.locator('#theory-pane-toggle-btn');
 await expect(page.locator('#contents-toggle-btn')).toBeHidden();
 await expect(guide).toBeVisible();
 await expect(guide).toHaveAttribute('aria-pressed','false');
 await guide.click();
 await expect(guide).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#contents-toggle-btn')).toBeVisible();
});
