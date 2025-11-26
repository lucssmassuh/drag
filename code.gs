function getMaestrosEpics2025() {
  // Load configuration from PropertiesService
  // Set these using: PropertiesService.getScriptProperties().setProperty('JIRA_DOMAIN', 'https://taxfix.atlassian.net')
  const props = PropertiesService.getScriptProperties();
  const JIRA_DOMAIN = props.getProperty('JIRA_DOMAIN') || "https://taxfix.atlassian.net";
  const EMAIL = props.getProperty('EMAIL') || "lucas.massuh-external@taxfix.de";
  const API_TOKEN = props.getProperty('API_TOKEN');
  
  if (!API_TOKEN) {
    SpreadsheetApp.getUi().alert("Error: API_TOKEN not set. Please set it in PropertiesService.");
    return;
  }

  // JQL for done issues in 2025 for project MKS
  const jqlQuery = `
    project = "MKS"
    AND statusCategory = Done
    AND resolutiondate >= 2025-01-01
    AND resolutiondate < 2026-01-01
  `;

  const searchUrl = `${JIRA_DOMAIN}/rest/api/3/search/jql`;

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      "Authorization": "Basic " + Utilities.base64Encode(`${EMAIL}:${API_TOKEN}`)
    },
    payload: JSON.stringify({
      jql: jqlQuery,
      maxResults: 1000,
      fields: ["summary", "key", "resolutiondate", "parent"]
    })
  };

  const response = UrlFetchApp.fetch(searchUrl, options);
  const data = JSON.parse(response.getContentText());
  const issues = data.issues;

  if (!issues.length) {
    SpreadsheetApp.getUi().alert("No DONE issues found in 2025 for MKS.");
    return;
  }

  // Extract Epic keys (from parent)
  const epicKeys = [...new Set(
    issues
      .map(i => i.fields.parent ? i.fields.parent.key : null)
      .filter(Boolean)
  )];

  // Fetch full epic data
  const epicDetails = epicKeys.map(epicKey =>
    getIssue(epicKey, JIRA_DOMAIN, EMAIL, API_TOKEN)
  );

  // Write to sheet
  const sheet = SpreadsheetApp.getActiveSheet();
  sheet.clear();
  sheet.appendRow(["ID", "Epic Link", "Epic Key", "Summary"]);

  epicDetails.forEach(epic => {
    sheet.appendRow([
      epic.id,
      `${JIRA_DOMAIN}/browse/${epic.key}`,
      epic.key,
      epic.fields.summary
    ]);
  });

  SpreadsheetApp.getUi().alert(
    `Done! Exported ${epicDetails.length} epics from MKS (DONE issues in 2025).`
  );
}


// Helper to fetch a single Jira issue
function getIssue(issueKey, domain, email, token) {
  const url = `${domain}/rest/api/3/issue/${issueKey}`;
  const options = {
    method: "get",
    contentType: "application/json",
    headers: {
      "Authorization": "Basic " + Utilities.base64Encode(`${email}:${token}`)
    }
  };
  const response = UrlFetchApp.fetch(url, options);
  return JSON.parse(response.getContentText());
}