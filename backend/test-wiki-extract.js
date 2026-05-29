async function test() {
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=Prime_Minister_of_Nepal&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  const pages = data.query.pages;
  const extract = pages[Object.keys(pages)[0]].extract;
  console.log(extract);
}
test();
