const JOOBLE_KEY = '26833169-20fb-40df-a18c-ec5122da515d';

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const keywords = params.keywords || 'education manager';
  const location  = params.location  || 'Edinburgh';

  const body = JSON.stringify({ keywords, location, resultsOnPage: 20 });

  console.log('Jooble request:', body);

  try {
    const response = await fetch(`https://jooble.org/api/${JOOBLE_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const text = await response.text();
    console.log('Jooble status:', response.status);
    console.log('Jooble preview:', text.slice(0, 200));

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Jooble API error', status: response.status, detail: text })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: text
    };
  } catch (err) {
    console.error('Jooble error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
