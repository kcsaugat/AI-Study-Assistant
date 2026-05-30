const { search } = require('duck-duck-scrape');

async function test() {
  try {
    const results = await search('Nepal Budget announcement fiscal year 2026-2027');
    const topHits = results.results.slice(0, 3).map(r => r.title + ' - ' + r.description).join('\n\n');
    console.log("DDG RESULTS:\n", topHits);
  } catch (err) {
    console.error("DDG ERROR:", err);
  }
}
test();
