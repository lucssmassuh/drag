function getMaestrosEpics2025() {

  const JIRA_DOMAIN = "https://taxfix.atlassian.net";
  const EMAIL = "lucas.massuh-external@taxfix.de";
  const API_TOKEN = "KEY"; // <--- add your key

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

// Get all issues for each epic from the "Epics" sheet
function getIssuesForEpics2025() {
  const JIRA_DOMAIN = "https://taxfix.atlassian.net";
  const EMAIL = "lucas.massuh-external@taxfix.de";
  const API_TOKEN = "KEY"; // <--- add your key

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Get the "Epics" sheet
  let epicsSheet = spreadsheet.getSheetByName("Epics");
  if (!epicsSheet) {
    SpreadsheetApp.getUi().alert("Error: 'Epics' sheet not found. Please run getMaestrosEpics2025() first.");
    return;
  }

  // Get all epic keys from the "Epic Key" column (column 3, assuming headers in row 1)
  const lastRow = epicsSheet.getLastRow();
  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert("No epics found in the Epics sheet.");
    return;
  }

  const epicKeys = epicsSheet.getRange(2, 3, lastRow - 1, 1).getValues().flat().filter(Boolean);

  if (epicKeys.length === 0) {
    SpreadsheetApp.getUi().alert("No epic keys found in the Epics sheet.");
    return;
  }

  // Get or create the "Issues" sheet
  let issuesSheet = spreadsheet.getSheetByName("Issues");
  if (!issuesSheet) {
    issuesSheet = spreadsheet.insertSheet("Issues");
  } else {
    issuesSheet.clear();
  }

  // Set headers
  issuesSheet.appendRow([
    "Issue Key",
    "Issue Link",
    "Epic Key",
    "Summary",
    "Status",
    "Resolution Date"
  ]);

  let totalIssues = 0;

  // Process each epic one by one
  for (let i = 0; i < epicKeys.length; i++) {
    const epicKey = epicKeys[i];
    
    // JQL to get all issues in this epic that are done in 2025
    const jqlQuery = `"Epic Link" = ${epicKey} AND statusCategory = Done AND resolutiondate >= 2025-01-01 AND resolutiondate < 2026-01-01`;
    
    const searchUrl = `${JIRA_DOMAIN}/rest/api/3/search`;
    
    const options = {
      method: "get",
      contentType: "application/json",
      headers: {
        "Authorization": "Basic " + Utilities.base64Encode(`${EMAIL}:${API_TOKEN}`)
      }
    };

    const url = `${searchUrl}?jql=${encodeURIComponent(jqlQuery)}&maxResults=1000&fields=summary,key,status,resolutiondate`;
    
    try {
      const response = UrlFetchApp.fetch(url, options);
      const data = JSON.parse(response.getContentText());
      const issues = data.issues || [];

      // Write each issue to the sheet
      issues.forEach(issue => {
        issuesSheet.appendRow([
          issue.key,
          `${JIRA_DOMAIN}/browse/${issue.key}`,
          epicKey,
          issue.fields.summary,
          issue.fields.status.name,
          issue.fields.resolutiondate || ""
        ]);
        totalIssues++;
      });
    } catch (error) {
      Logger.log(`Error fetching issues for epic ${epicKey}: ${error.toString()}`);
    }
  }

  SpreadsheetApp.getUi().alert(
    `Done! Exported ${totalIssues} issues from ${epicKeys.length} epics (DONE issues in 2025).`
  );
}