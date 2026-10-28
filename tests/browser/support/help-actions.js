// Access relocated workspace actions through the same Help menu users see.
export async function chooseHelpAction(page,action){
 const trigger=page.locator('#help-menu-trigger');
 const menu=page.locator('#help-menu');
 if(!(await menu.isVisible()))await trigger.click();
 await menu.locator('[data-help-action="'+action+'"]').click();
}
export const toggleSandbox=page=>chooseHelpAction(page,'sandbox');
export const openPromptLibrary=page=>chooseHelpAction(page,'library');
export const openCheatSheet=page=>chooseHelpAction(page,'cheats');
