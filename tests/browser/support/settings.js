// Use the same Settings entrypoint as a real user, rather than interacting
// with hidden selectors directly after the header migration.
async function chooseSetting(page, id, value){
 const trigger=page.locator('#settings-menu-trigger');
 await trigger.scrollIntoViewIfNeeded();
 await trigger.click();
 await page.locator(id).selectOption(value);
 await page.locator('#settings-close').click();
}
export const setAppLanguage=(page,language)=>chooseSetting(page,'#lang-selector',language);
export const setAppTheme=(page,theme)=>chooseSetting(page,'#theme-selector',theme);
