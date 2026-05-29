async function test() {
  const url = 'https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=Prime%20Minister%20of%20Nepal&utf8=&format=json';
  const res = await fetch(url);
  const data = await res.json();
  console.log(data.query.search.slice(0, 3));
}
test();
