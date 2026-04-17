const REED_API_KEY = '2b532591-eae3-4a57-8273-a22b5131202f';

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const keywords = params.keywords || 'project manager education';
  const location = params.location || 'Edinburgh';
  const distance = params.distance || '20';
  const minimumSalary = params.minimumSalary || '30000';
  const remoteOnly = params.remote === 'true';

  let url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(keywords)}&minimumSalary=${minimumSalary}&resultsToTake=20`;
  if (!remoteOnly) {
    url += `&locationName=${encodeURIComponent(location)}&distanceFromLocation=${distance}`;
  }

  console.log('Reed URL:', url);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(REED_API_KEY + ':').toString('base64'),
        'Content-Type': 'application/json'
      }
    });

    const text = await response.text();
    console.log('Reed status:', response.status);
    console.log('Reed response preview:', text.slice(0, 200));

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Reed API error', status: response.status, detail: text })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: text
    };
  } catch (err) {
    console.error('Reed fetch error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
