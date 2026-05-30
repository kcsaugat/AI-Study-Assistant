const google = require('googlethis');

async function test() {
  const options = {
    page: 0, 
    safe: false, // Safe Search
    parse_ads: false, // If set to true sponsored results will be parsed
    additional_params: { 
      hl: 'en' 
    }
  };

  try {
    const response = await google.search('Prime minister of nepal', options);
    
    let context = [];
    if (response.knowledge_panel && response.knowledge_panel.description) {
      context.push(`Knowledge Panel: ${response.knowledge_panel.title} - ${response.knowledge_panel.description}`);
    }
    if (response.featured_snippet && response.featured_snippet.title) {
      context.push(`Featured Snippet: ${response.featured_snippet.title} - ${response.featured_snippet.description}`);
    }
    
    response.results.slice(0, 3).forEach(r => {
      context.push(`Search Result: ${r.title} - ${r.description}`);
    });
    
    console.log("GOOGLE THIS RESULTS:\n", context.join('\n\n'));
  } catch (err) {
    console.error("GOOGLE ERROR:", err);
  }
}
test();
