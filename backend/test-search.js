const { search } = require('duck-duck-scrape');

async function test() {
  const results = await search('Prime Minister of Nepal 2026');
  console.log(results.results.slice(0, 3).map(r => r.title + ' - ' + r.description).join('\n\n'));
}
test();
