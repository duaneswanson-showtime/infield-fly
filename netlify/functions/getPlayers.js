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
    const accountId = body.accountId;

    if (!accountId) {
      return {
        statusCode: 400,
        headers: { "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ error: "accountId is required" })
      };
    }

    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_NAME = "Player Profiles"; // adjust if needed

    // Filter: find all players whose linked Accounts field contains this accountId
    const formula = `FIND('${accountId}', ARRAYJOIN({Accounts}))`;

    const url =
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}` +
      `?filterByFormula=${encodeURIComponent(formula)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({
        success: true,
        players: data.records || [],
        debugUrl: url
      })
    };

  } catch (err) {
    console.error("getPlayers error:", err);
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
};
