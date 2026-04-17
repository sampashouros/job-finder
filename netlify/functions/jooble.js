const JOOBLE_API_KEY = '26833169-20fb-40df-a18c-ec5122da515d';

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const keywords = params.keywords || 'education';
  const location  = params.location  || 'Edinburgh';
  const salary    = parseInt(params.minimumSalary || '35000');
  const remote    = params.remote === 'true';

  const body = {
    keywords: keywords,
    location: remote ? '' : location,
    salary:   salary,
    page:     1,
  };

  console.log('Jooble request:', JSON.stringify(body));

  try {
    const response = await fetch(`https://jooble.org/api/${JOOBLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await response.text();
    console.log('Jooble status:', response.status, 'preview:', text.slice(0, 200));

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Jooble error', status: response.status, detail: text })
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
