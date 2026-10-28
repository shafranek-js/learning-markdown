// Exercise the existing Edit menu instead of removed toolbar buttons.
// This also verifies undo/redo remain accessible without a mouse-only control.
async function historyAction(page,action){
 await page.locator('#edit-menu-trigger').click();
 await page.locator('#edit-menu [data-edit-action="'+action+'"]').click();
}
export const undo=page=>historyAction(page,'undo');
export const redo=page=>historyAction(page,'redo');
