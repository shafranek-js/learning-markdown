import {test,expect} from '@playwright/test';

const courseControls=[
 '.app-header-brand','#progress-label','#advanced-course-btn',
 '#advanced-cert-top-btn','#certificate-btn'
];

const guideItem=page=>page.locator('#view-menu [data-view-action="guide"]');
async function setGuide(page){
 await page.locator('#view-menu-trigger').click();
 await guideItem(page).click();
}
async function expectGuideSelection(page,checked){
 await page.locator('#view-menu-trigger').click();
 await expect(guideItem(page)).toHaveAttribute('aria-checked',String(checked));
 await page.keyboard.press('Escape');
}

test('Lesson Guide hides course-only controls but preserves editor tools and settings',async({page})=>{
 await page.goto('/');
 await expect(page.locator('#theory-panel')).toBeVisible();
 await expectGuideSelection(page,true);
 await expect(page.locator('#contents-toggle-btn')).toBeVisible();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeVisible();

 await setGuide(page);
 await expect(page.locator('#theory-panel')).toBeHidden();
 await expectGuideSelection(page,false);
 for(const selector of courseControls)await expect(page.locator(selector)).toBeHidden();
 await expect(page.locator('#contents-toggle-btn')).toBeHidden();
 for(const selector of ['#help-menu-trigger','#settings-menu-trigger','#markdown-input','#markdown-preview'])
  await expect(page.locator(selector)).toBeVisible();
 await page.locator('#help-menu-trigger').click();
 await expect(page.locator('#sandbox-mode-btn')).toBeVisible();
 await expect(page.locator('#cheatsheet-btn')).toBeVisible();
 await page.keyboard.press('Escape');

 await page.reload();
 await expect(page.locator('#contents-toggle-btn')).toBeHidden();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeHidden();
 await setGuide(page);
 await expect(page.locator('#theory-panel')).toBeVisible();
 await expect(page.locator('#contents-toggle-btn')).toBeVisible();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeVisible();
});

test('Only lessons show lesson identifier; Sandbox uses the document tab title',async({page})=>{
 await page.goto('/');
 const badge=page.locator('#lesson-context-badge');
 await expect(badge).toBeVisible();
 await expect(page.locator('#active-tab-title')).toContainText('01_01');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 await expect(badge).toBeHidden();
 await expect(page.locator('#document-tabs')).toBeVisible();
 await expect(page.locator('#document-tab-list [role="tab"][aria-selected="true"]')).toBeVisible();
 await expect(page.locator('#undo-btn')).toBeAttached();
 await page.reload();
 await expect(badge).toBeHidden();
 await expect(page.locator('#document-tabs')).toBeVisible();
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 await expect(badge).toBeVisible();
 await expect(page.locator('#active-tab-title')).toContainText('01_01');
 await expect(page.locator('#document-tabs')).toBeHidden();
});

test('Sandbox hides course header and View restores Lesson Guide',async({page})=>{
 await page.goto('/');
 await page.locator('#help-menu-trigger').click();
 await page.locator('#sandbox-mode-btn').click();
 await expect(page.locator('#theory-panel')).toBeHidden();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeHidden();
 await expect(page.locator('#help-menu-trigger')).toBeVisible();
 await expect(page.locator('#contents-toggle-btn')).toBeHidden();
 await setGuide(page);
 await expect(page.locator('#theory-panel')).toBeVisible();
 for(const selector of courseControls)await expect(page.locator(selector)).toBeVisible();
});

test('Course-only controls do not reappear at larger responsive breakpoints',async({page})=>{
 await page.setViewportSize({width:1650,height:900});
 await page.goto('/');
 await setGuide(page);
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
 await expect(page.locator('#contents-toggle-btn')).toBeHidden();
 await setGuide(page);
 await expect(page.locator('#workspace-container')).toHaveAttribute('data-mobile-tab','guide');
 await expect(page.locator('#theory-panel')).toBeVisible();
 await expect(page.locator('#contents-toggle-btn')).toBeVisible();
 await setGuide(page);
 await expect(page.locator('#workspace-container')).toHaveAttribute('data-mobile-tab','editor');
 await expect(page.locator('#theory-panel')).toBeHidden();
 await expect(page.locator('#contents-toggle-btn')).toBeHidden();
});
