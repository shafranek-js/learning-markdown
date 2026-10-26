import {defineConfig} from '@playwright/test';

// Focused browser parity gate; the full regression suite remains Chromium-only.
export default defineConfig({
 testDir:'./tests/browser',
 testMatch:'release-cross-browser.spec.js',
 timeout:30000,
 expect:{timeout:7500},
 use:{baseURL:'http://127.0.0.1:4173',viewport:{width:1440,height:900},trace:'retain-on-failure'},
 projects:[
  {name:'chromium-release',use:{browserName:'chromium'}},
  {name:'firefox-release',use:{browserName:'firefox'}},
  {name:'webkit-release',use:{browserName:'webkit'}}
 ],
 reporter:process.env.CI?[['list'],['html',{open:'never'}]]:'list',
 webServer:{command:'npm run preview -- --host 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173/',reuseExistingServer:!process.env.CI,timeout:45000}
});
