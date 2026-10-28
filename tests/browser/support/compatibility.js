// Shared compatibility popover interactions extracted from ux.spec.js.
// Their implementations match the original test helpers.
export const openCompatibility=async page=>{
 if(!(await page.locator('#compatibility-panel').evaluate(panel=>panel.open)))
  await page.locator('#compatibility-trigger').click();
};
export const closeCompatibility=async page=>{
 if(await page.locator('#compatibility-panel').evaluate(panel=>panel.open))
  await page.keyboard.press('Escape');
};
