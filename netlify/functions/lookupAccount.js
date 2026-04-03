exports.handler = async (event, context) => {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      },
      body: ""
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "Email is required" })
      };
    }

    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_NAME = "Accounts"; // change if your table name differs

    // Airtable API URL with filterByFormula
    const url =
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}` +
      `?filterByFormula=${encodeURIComponent(`{Email Normalized} = '${email}'`)}`;

    const response = await fetch(url, {
      headers
