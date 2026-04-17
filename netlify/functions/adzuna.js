const ADZUNA_APP_ID  = '48908c3e';
const ADZUNA_APP_KEY = 'f486e192fc75b1200048886c266fce28';

exports.handler = async function(event) {
  const p      = event.queryStringParameters || {};
  const what   = p.what   || 'education';
  const where  = p.where  || 'edinburgh';
  const sal    = p.salary || '30000';

  const url = `https://api.adzuna.com/v1/api/jobs/gb/search/1`
    + `?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}`
    + `&results_per_page=10`
    + `&what=${encodeURIComponent(what)}`
    + `&where=${encodeURIComponent(where)}`
    + `&salary_min=${sal}`
    + `&distance=20`
    + `&content-type=application/json`;

  console.log('Adzuna:', url);

  try {
    const r = await fetch(url);
    const text = await r.text();
    console.log('Adzuna status:', r.status, 'preview:', text.slice(0,150));
    return {
      statusCode: r.status,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: text
    };
  } catch(err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
