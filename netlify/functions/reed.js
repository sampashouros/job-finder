const REED_API_KEY = '2b532591-eae3-4a57-8273-a22b5131202f';

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};
  const keywords = params.keywords || 'project manager education';
  const location = params.location || 'Edinburgh';
  const distanceFromLocation = params.distance || '20';
  const minimumSalary = params.minimumSalary || '35000';
  const remoteOnly = params.remote === 'true';

  let url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(keywords)}&minimumSalary=${minimumSalary}&resultsToTake=20`;

  if (!remoteOnly) {
    url += `&locationName=${encodeURIComponent(location)}&distanceFromLocation=${distanceFromLocation}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(REED_API_KEY + ':').toString('base64')
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Reed API error', status: response.status })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
