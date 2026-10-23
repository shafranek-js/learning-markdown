import {defineConfig} from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  expect: {timeout: 7500},
  use: {baseURL:'http://127.0.0.1:4173', viewport:{width:1440,height:900}, trace:'retain-on-failure'},
  projects: [{name:'chromium',use:{browserName:'chromium'}}],
  reporter: process.env.CI ? [['list'],['html',{open:'never'}]] : 'list',
  webServer: {command:'npm run preview -- --host 127.0.0.1 --port 4173',url:'http://127.0.0.1:4173/',reuseExistingServer:!process.env.CI,timeout:45000},
});
