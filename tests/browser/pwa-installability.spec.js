import {test,expect} from '@playwright/test';

// Headless Chromium does not draw its address bar. Inspect its PWA metadata instead.
test('PWA manifest, images and browser installability diagnostics',async({page,browserName})=>{
 await page.goto('/');
 const manifestLink=page.locator('link[rel="manifest"]');
 await expect(manifestLink).toHaveCount(1);
 const manifestUrl=new URL(await manifestLink.getAttribute('href'),page.url()).href;
 const manifestResponse=await page.request.get(manifestUrl);
 expect(manifestResponse.ok(),'PWA manifest must be served by the site').toBeTruthy();
 const manifest=await manifestResponse.json();
 expect(manifest.name).toBeTruthy();
 expect(manifest.short_name).toBeTruthy();
 expect(manifest.display).toBe('standalone');
 expect(manifest.start_url).toBeTruthy();
 for(const size of [192,512]){
  const icon=manifest.icons.find(item=>item.type==='image/png'&&item.sizes.split(' ').includes(size+'x'+size));
  expect(icon,'Required '+size+'px PNG icon').toBeTruthy();
  const url=new URL(icon.src,manifestUrl).href;
  const response=await page.request.get(url);
  expect(response.ok(),url+' must be reachable').toBeTruthy();
  expect(response.headers()['content-type']).toContain('image/png');
  expect((await response.body()).length).toBeGreaterThan(100);
 }
 const sw=await page.request.get(new URL('./sw.js',page.url()).href);
 expect(sw.ok(),'Service worker must be published beside the app').toBeTruthy();
 if(browserName==='chromium'){
  const cdp=await page.context().newCDPSession(page);
  const details=await cdp.send('Page.getAppManifest');
  expect(details.url).toBe(manifestUrl);
  expect(details.data).toContain('Learning Markdown');
  const errors=await cdp.send('Page.getInstallabilityErrors');
  console.log('Chromium PWA installability diagnostics:',JSON.stringify(errors.installabilityErrors));
  // Icon appearance is ultimately a Chrome UI decision and cannot be tested in headless mode.
 }
});
