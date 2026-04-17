exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const keywords = params.keywords || 'education';

  // MyJobScotland has a JSON API endpoint used by their own frontend
  // We fetch their search results as JSON directly
  const apiUrl = `https://myjobscotland.gov.uk/api/job-search?keywords=${encodeURIComponent(keywords)}&latlng=55.9534,-3.18909&location=Edinburgh&distance=20&page=1`;

  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'Mozilla/5.0 (compatible; job aggregator)',
    'Referer': 'https://myjobscotland.gov.uk/search',
  };

  try {
    // Try JSON API first
    let response = await fetch(apiUrl, { headers });
    let text = await response.text();

    console.log('MJS JSON API status:', response.status);
    console.log('MJS response preview:', text.slice(0, 300));

    if (response.ok && text.trim().startsWith('{')) {
      const data = JSON.parse(text);
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'json', data })
      };
    }

    // Fall back to HTML scrape
    const htmlUrl = `https://myjobscotland.gov.uk/search?keywords=${encodeURIComponent(keywords)}&latlng=55.9534,-3.18909&location=Edinburgh&distance=20`;
    response = await fetch(htmlUrl, { headers: { ...headers, 'Accept': 'text/html' } });
    text = await response.text();

    console.log('MJS HTML status:', response.status, 'length:', text.length);

    // Extract job data from the page — MyJobScotland embeds JSON in a script tag
    const jsonMatch = text.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});\s*<\/script>/s)
      || text.match(/drupalSettings\s*=\s*({.+?});\s*<\/script>/s)
      || text.match(/"jobs"\s*:\s*(\[.+?\])/s);

    if (jsonMatch) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'embedded', raw: jsonMatch[1].slice(0, 5000) })
      };
    }

    // Return raw HTML for inspection
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'html', preview: text.slice(0, 2000), length: text.length })
    };

  } catch (err) {
    console.error('MJS error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
