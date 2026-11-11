const REED_API_KEY = '2b532591-eae3-4a57-8273-a22b5131202f';

exports.handler = async function(event) {
  const params = event.queryStringParameters || {};

  // Full advert for one job: Reed's official job details request (/api/1.0/jobs/{id})
  if (params.jobId) {
    const headers = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
    if (!/^\d+$/.test(params.jobId)) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Bad job id' }) };
    try {
      const r = await fetch(`https://www.reed.co.uk/api/1.0/jobs/${params.jobId}`, {
        headers: { 'Authorization': 'Basic ' + Buffer.from(REED_API_KEY + ':').toString('base64') }
      });
      const text = await r.text();
      if (!r.ok) console.log('Reed details status:', r.status, text.slice(0, 200));
      return { statusCode: r.status, headers, body: r.ok ? text : JSON.stringify({ error: 'Reed API error', status: r.status }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  const keywords = params.keywords || 'project manager education';
  const location = params.location || 'Edinburgh';
  const distance = params.distance || '20';
  const minimumSalary = params.minimumSalary || '30000';
  const remoteOnly = params.remote === 'true';

  let url = `https://www.reed.co.uk/api/1.0/search?keywords=${encodeURIComponent(keywords)}${minimumSalary==='0'?'':`&minimumSalary=${minimumSalary}`}&resultsToTake=100`; // 0 = no salary filter (include unsalaried jobs) // max allowed; same request, 5x the jobs
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
