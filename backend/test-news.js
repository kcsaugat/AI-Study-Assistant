async function test() {
  const query = "Nepal Budget announcement fiscal year 2026-2027";
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  try {
    const res = await fetch(rssUrl);
    const xml = await res.text();
    
    // Simple regex to extract titles
    const titles = [...xml.matchAll(/<title>(.*?)<\/title>/g)].slice(1, 4).map(m => m[1]);
    console.log("NEWS TITLES:\n", titles.join('\n'));
  } catch (err) {
    console.error("NEWS ERROR:", err);
  }
}
test();
