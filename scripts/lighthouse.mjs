import lighthouse from 'lighthouse';
import {launch} from 'chrome-launcher';
import {mkdir,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
const origin=process.env.AUDIT_URL||'http://127.0.0.1:3100';
await mkdir('artifacts/lighthouse',{recursive:true});
const chrome=await launch({chromePath:chromium.executablePath(),chromeFlags:['--headless','--no-sandbox','--disable-dev-shm-usage']});
const summary=[];
try{for(const [name,path] of [['home','/'],['gallery','/gallery'],['shop','/shop'],['custom-cake','/custom-cake']]){const result=await lighthouse(origin+path,{port:chrome.port,output:['html','json'],logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo'],formFactor:'mobile'});await writeFile(`artifacts/lighthouse/${name}.html`,result.report[0]);await writeFile(`artifacts/lighthouse/${name}.json`,result.report[1]);const l=result.lhr;const row={page:path,scores:Object.fromEntries(Object.entries(l.categories).map(([k,v])=>[k,Math.round(v.score*100)])),lcp_ms:Math.round(l.audits['largest-contentful-paint'].numericValue),cls:l.audits['cumulative-layout-shift'].numericValue,tbt_ms:l.audits['total-blocking-time'].numericValue,failed:Object.values(l.audits).filter(a=>a.score!==null&&a.score<1&&a.details?.items?.length).map(a=>({id:a.id,title:a.title,score:a.score,displayValue:a.displayValue}))};summary.push(row);console.log(JSON.stringify(row));}}finally{await chrome.kill();await writeFile('artifacts/lighthouse/summary.json',JSON.stringify(summary,null,2));}
