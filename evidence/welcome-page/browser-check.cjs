// Native browser observation; not a platform tests.run receipt.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const report = {
  kind: 'independent-native-browser-observation', startedAt: new Date().toISOString(),
  candidateRevision: 'd458803d9372062eafd58245c773efd2cdaa8e95',
  candidateFile: 'index.html', candidateSha256: sha(path.join(root,'index.html')),
  testRevision: 'e7509c985a7437cba36c023f82e44721197bbca1',
  testSha256: sha(path.join(root,'tests/welcome-page-9cbb65e8/welcome.test.mjs')),
  frozenRuntimeImage: 'sha256:cfdd13360965d846cf746bf829782d65247e5cb8e986c71271124f908e09673d',
  runtimeBindingScope: 'Outer harness only; browser and downloaded dependencies identified separately.',
  platform: { system: os.type(), release: os.release(), arch: os.arch(), node: process.version, osRelease: fs.readFileSync('/etc/os-release','utf8') },
  headless: true, url: 'file://' + path.join(root,'index.html'), requests: [], consoleErrors: [], observations: []
};
let browser;
(async () => {
  assert.equal(report.candidateSha256, 'b0b2c0c4b1a8e791699c1a8b8084c2f62e57dcc0290722e54cfac194c319039a');
  assert.equal(report.testSha256, '4424f91b1c220d4a0ffd70d2cf454f28ac21157718fe468699643e54de6443bf');
  browser = await chromium.launch({headless:true, args:['--no-sandbox'], ...(process.env.BROWSER_EXECUTABLE ? { executablePath:process.env.BROWSER_EXECUTABLE } : {})});
  report.browserVersion = browser.version();
  report.browserExecutable = process.env.BROWSER_EXECUTABLE || chromium.executablePath();
  report.browserExecutableSha256 = sha(report.browserExecutable);
  report.launchArgs = ['--no-sandbox'];
  report.environment = { TMPDIR:process.env.TMPDIR, LD_LIBRARY_PATH:process.env.LD_LIBRARY_PATH, FONTCONFIG_FILE:process.env.FONTCONFIG_FILE };
  report.fontConfig = process.env.FONTCONFIG_FILE ? fs.readFileSync(process.env.FONTCONFIG_FILE,'utf8') : null;
  report.playwrightVersion = require(path.join(path.dirname(require.resolve(process.env.PLAYWRIGHT_MODULE || 'playwright')), 'package.json')).version;
  async function context(offline, viewport) {
    const ctx=await browser.newContext({offline,viewport,deviceScaleFactor:1});
    ctx.on('request',r=>report.requests.push({at:new Date().toISOString(),url:r.url(),method:r.method(),resourceType:r.resourceType(),offline}));
    ctx.on('page',p=>p.on('pageerror',e=>report.consoleErrors.push(String(e))));
    return ctx;
  }
  async function observe(page, phase, offline, viewport) {
    await page.waitForLoadState('load'); await page.evaluate(()=>document.fonts.ready);
    const result=await page.evaluate(()=>{
      const h=document.querySelector('main h1'), main=document.querySelector('main');
      const r=h.getBoundingClientRect();
      const range=document.createRange(); range.selectNodeContents(h); const t=range.getBoundingClientRect();
      const style=getComputedStyle(h);
      const points=[[t.left+1,t.top+1],[t.right-1,t.top+1],[t.left+1,t.bottom-1],[t.right-1,t.bottom-1],[(t.left+t.right)/2,(t.top+t.bottom)/2]];
      return { title:document.title, text:h.innerText, lang:document.documentElement.lang, charset:document.characterSet, url:location.href,
        online:navigator.onLine, userAgent:navigator.userAgent, viewport:{width:innerWidth,height:innerHeight},
        document:{clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth},
        body:{clientWidth:document.body.clientWidth,scrollWidth:document.body.scrollWidth},
        headingRect:r.toJSON(), textRect:t.toJSON(), mainRect:main.getBoundingClientRect().toJSON(),
        computedStyle:{display:style.display,visibility:style.visibility,opacity:style.opacity,fontSize:style.fontSize,color:style.color,fontFamily:style.fontFamily},
        hitTests:points.map(([x,y])=>({x,y,headingOnTop:!!document.elementFromPoint(x,y)?.closest('h1')})),
        textInViewport:t.left>=0&&t.top>=0&&t.right<=innerWidth&&t.bottom<=innerHeight,
        textInsideHeading:t.left>=r.left&&t.top>=r.top&&t.right<=r.right&&t.bottom<=r.bottom,
        resources:performance.getEntriesByType('resource').map(e=>e.name)
      };
    });
    const cdp=await page.context().newCDPSession(page); await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
    const doc=await cdp.send('DOM.getDocument'); const headingNode=await cdp.send('DOM.querySelector',{nodeId:doc.root.nodeId,selector:'h1'});
    result.renderedFonts=(await cdp.send('CSS.getPlatformFontsForNode',{nodeId:headingNode.nodeId})).fonts; await cdp.detach();
    result.phase=phase; result.at=new Date().toISOString(); result.offlineRequested=offline;
    result.screenshot=phase+'.png';
    await page.screenshot({path:path.join(__dirname,result.screenshot),fullPage:true});
    report.observations.push(result);
    assert.equal(result.title,'欢迎'); assert.equal(result.text,'欢迎！'); assert.equal(result.url,report.url);
    assert.deepEqual(result.viewport,viewport); assert.equal(result.online,!offline);
    assert.ok(result.textInViewport&&result.textInsideHeading); assert.ok(result.hitTests.every(p=>p.headingOnTop));
    assert.ok(result.document.scrollWidth<=result.document.clientWidth); assert.ok(result.body.scrollWidth<=result.body.clientWidth);
    assert.equal(result.computedStyle.visibility,'visible'); assert.equal(result.computedStyle.opacity,'1'); assert.notEqual(result.computedStyle.display,'none');
    assert.deepEqual(result.resources,[]); result.passed=true;
  }
  const desktop={width:1280,height:800}, narrow={width:320,height:640};
  let ctx=await context(false,desktop), page=await ctx.newPage();
  await page.goto(report.url); await observe(page,'01-open-desktop',false,desktop);
  await page.reload(); await observe(page,'02-refresh-desktop',false,desktop);
  await page.close(); page=await ctx.newPage(); await page.goto(report.url); await observe(page,'03-reopen-desktop',false,desktop);
  await ctx.close(); ctx=await context(true,desktop); page=await ctx.newPage();
  await page.goto(report.url); await observe(page,'04-offline-desktop',true,desktop);
  await page.setViewportSize(narrow); await ctx.setOffline(false); await ctx.setOffline(true); await observe(page,'05-offline-narrow',true,narrow);
  await page.reload(); await observe(page,'06-offline-narrow-refresh',true,narrow);
  await page.close(); page=await ctx.newPage(); await page.setViewportSize(narrow); await ctx.setOffline(false); await ctx.setOffline(true); await page.goto(report.url); await observe(page,'07-offline-narrow-reopen',true,narrow);
  await page.setViewportSize(desktop); await ctx.setOffline(false); await ctx.setOffline(true); await observe(page,'08-offline-resize-desktop',true,desktop);
  await ctx.close();
  assert.deepEqual(report.requests.filter(r=>!r.url.startsWith('file:')),[]); assert.deepEqual(report.consoleErrors,[]);
  report.candidateSha256After=sha(path.join(root,'index.html')); assert.equal(report.candidateSha256After,report.candidateSha256);
  report.status='passed';
})().catch(e=>{report.status='failed';report.error={message:e.message,stack:e.stack};process.exitCode=1;}).finally(async()=>{
  if(browser) await browser.close(); report.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(__dirname,'browser-observations.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,browserVersion:report.browserVersion,candidateSha256:report.candidateSha256,phases:report.observations.map(o=>({phase:o.phase,passed:o.passed})),error:report.error}));
});
