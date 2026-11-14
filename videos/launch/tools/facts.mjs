#!/usr/bin/env node
/**
 * facts — every number and named thing the launch film states, read from the live
 * public site. Writes facts.json; the film's copy may only state what is in it
 * (kind.test.mjs holds SCRIPT.md to that with lib/plan.mjs's numbersIn).
 *
 *   node tools/facts.mjs        (run from videos/launch/)
 */
import fs from 'node:fs';

const SITE = 'https://anyrouter.dev';
const get = async path => {
  const res = await fetch(SITE + path, { headers: { 'user-agent': 'anyrouter-video-facts' } });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.text();
};
/** Page HTML → its visible text lines, scripts and styles dropped. */
const lines = html => html
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, '\n')
  .replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .split('\n').map(s => s.trim()).filter(Boolean);
const need = (v, what) => { if (v == null || Number.isNaN(v)) throw new Error(`could not read ${what}`); return v; };
const at = new Date().toISOString();

const api = JSON.parse(await get('/api/v1/models'));
const llms = await get('/llms.txt');
const home = lines(await get('/'));
const mcp = lines(await get('/mcp'));
const poolStats = JSON.parse(await get('/api/v1/pool/stats'));
const poolPage = lines(await get('/pool'));
const sentence = (page, start) => need(page.find(l => l.startsWith(start)), `sentence "${start}"`);

const homeLatest = home.join(' ').match(/Latest of (\d+) models/);
const homeFree = home.join(' ').match(/(\d+) free with Go/);
const catalog = llms.match(/Catalog: (\d+)\+ models across (\d+)\+ providers/);
const goPlan = llms.match(/The Go plan is \$(\d+) a month and includes \$(\d+) of monthly credit/);

// The connector catalog on /mcp: a server name line followed by its one-line description.
const serverStart = mcp.indexOf('Action');
const servers = [];
for (let i = serverStart + 1; i < mcp.length - 1; i++) {
  if (mcp[i + 1] && /[.]$/.test(mcp[i + 1]) && mcp[i + 2] === 'Connect' && !servers.some(s => s.name === mcp[i])) {
    servers.push({ name: mcp[i], does: mcp[i + 1] });
  }
}
const toolStart = mcp.indexOf("'.result.tools[].name'");
const tools = mcp.slice(toolStart + 1).filter((l, i, a) => /^[a-z_]+$/.test(l) && a.slice(0, i).every(x => /^[a-z_]+$/.test(x)));

const facts = {
  capturedAt: at,
  models: {
    api: { value: api.data.length, source: `${SITE}/api/v1/models (length of data[])` },
    homepage: { value: need(+homeLatest?.[1], 'home model count'), source: `${SITE}/ ("Latest of N models")` },
    claim: { value: need(+catalog?.[1], 'llms catalog'), text: `${catalog?.[1]}+`, source: `${SITE}/llms.txt ("Catalog: N+ models")` },
    freeWithGo: { value: need(+homeFree?.[1], 'free with Go'), source: `${SITE}/ ("N free with Go")` },
  },
  providers: { value: need(+catalog?.[2], 'providers'), text: `${catalog?.[2]}+`, source: `${SITE}/llms.txt ("across N+ providers")` },
  plans: {
    goPrice: { value: need(+goPlan?.[1], 'Go price'), unit: 'USD/month', source: `${SITE}/llms.txt` },
    goCredit: { value: need(+goPlan?.[2], 'Go credit'), unit: 'USD/month', source: `${SITE}/llms.txt` },
  },
  pool: {
    activeDonors: { value: need(poolStats.active_donors, 'pool donors'), source: `${SITE}/api/v1/pool/stats (active_donors)` },
    requestsToday: { value: need(poolStats.requests_today, 'pool requests today'), source: `${SITE}/api/v1/pool/stats (requests_today)` },
    oneKeyGivesGo: { text: sentence(poolPage, 'Add one valid free-tier key'), source: `${SITE}/pool` },
    skips: { text: sentence(poolPage, 'AnyRouter balances requests'), source: `${SITE}/pool` },
  },
  homeH1: { text: need(home.find(l => l === 'Every LLM.') && 'Every LLM. One API.', 'home H1'), source: `${SITE}/` },
  failover: { text: 'a 401, 429, or 5xx from one upstream retries on the next upstream for that model', source: `${SITE}/llms.txt` },
  mcp: {
    endpoint: { text: `${SITE}/api/v1/mcp`, source: `${SITE}/mcp` },
    anyrouterTools: { names: tools, source: `${SITE}/mcp (tools/list example)` },
    servers: { list: servers, source: `${SITE}/mcp (connector catalog)` },
  },
  cli: {
    install: { text: `curl -fsSL ${SITE}/cli.sh | bash`, source: `${SITE}/cli.sh, AGENTS.md of the anyrouter repo` },
  },
};
need(servers.length || NaN, 'mcp servers');
need(tools.length || NaN, 'mcp tools');
fs.writeFileSync('facts.json', `${JSON.stringify(facts, null, 2)}\n`);
console.log(`models api=${facts.models.api.value} home=${facts.models.homepage.value} claim=${facts.models.claim.text} providers=${facts.providers.text} go=$${facts.plans.goPrice.value}/$${facts.plans.goCredit.value} donors=${facts.pool.activeDonors.value} servers=${servers.map(s => s.name).join(',')} tools=${tools.length}`);
