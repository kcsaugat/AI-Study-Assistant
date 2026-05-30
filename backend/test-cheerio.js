const cheerio = require('cheerio');

async function search(query) {
  try {
    const res = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      },
      body: new URLSearchParams({ q: query })
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    
    let results = [];
    $('.result').each((i, el) => {
      if (i >= 3) return false;
      const title = $(el).find('.result__title').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      if (title && snippet) {
        results.push(`Search Result: ${title} - ${snippet}`);
      }
    });
    
    console.log("DDG SCRAPE RESULTS:\n", results.join('\n\n'));
  } catch (err) {
    console.error("SCRAPE ERROR:", err);
  }
}

search('budget announcement of nepal fiscal year 2026-2027');
