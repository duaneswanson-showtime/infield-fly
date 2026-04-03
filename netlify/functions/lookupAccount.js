const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  try {
    // Parse the email from the request body
    const body = JSON.parse(event.body || "{}");
    const email = (body.email || "").trim().toLowerCase();

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email is required" })
      };
    }

    // Airtable API details
    const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const TABLE_NAME = "Accounts"; // change if your table name differs

    // Query Airtable for the matching account
    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}?filterByFormula=${encodeURIComponent(
      `{Email Normalized} = '${email}'`
    )}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "No account found for this email" })
      };
    }

    const account = data.records[0];

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        accountId: account.id,
        fields: account.fields
      })
    };

  } catch (err) {
    console.error("lookupAccount error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error", details: err.message })
    };
  }
};
