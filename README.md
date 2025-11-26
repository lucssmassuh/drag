# Drag - Jira Epic Exporter

Google Apps Script to export Jira epics from completed issues.

## Setup

1. Copy `.env.example` to `.env` and fill in your values (for reference only - Google Apps Script doesn't use .env files directly)

2. In Google Apps Script, set the properties using the script editor:
   - Go to Project Settings → Script Properties
   - Add the following properties:
     - `JIRA_DOMAIN`: Your Jira domain (e.g., `https://taxfix.atlassian.net`)
     - `EMAIL`: Your Jira email
     - `API_TOKEN`: Your Atlassian API token

   Or run this setup function once:
   ```javascript
   function setupProperties() {
     const props = PropertiesService.getScriptProperties();
     props.setProperty('JIRA_DOMAIN', 'https://taxfix.atlassian.net');
     props.setProperty('EMAIL', 'your-email@example.com');
     props.setProperty('API_TOKEN', 'your-api-token');
   }
   ```

## Usage

Run `getMaestrosEpics2025()` from the Google Apps Script editor or add it as a custom menu item.

