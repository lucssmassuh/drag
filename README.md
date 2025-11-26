# Drag - Jira Epic Exporter

Google Apps Script to export Jira epics from completed issues.

## Setup

### Step 1: Open Google Apps Script

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. This opens the script editor in a new tab

### Step 2: Add the Code

1. Copy the contents of `code.gs` into the Apps Script editor
2. Save the project (Ctrl+S or Cmd+S)

### Step 3: Configure Properties (Choose one method)

#### Method A: Using the Setup Function (Recommended)

1. In the Apps Script editor, find the `setupJiraProperties()` function
2. Update the values inside the function with your actual credentials:
   ```javascript
   props.setProperty('JIRA_DOMAIN', 'https://taxfix.atlassian.net');
   props.setProperty('EMAIL', 'your-email@example.com');
   props.setProperty('API_TOKEN', 'your-actual-api-token');
   ```
3. Click the **Run** button (▶️) or press `Ctrl+R` (Windows) / `Cmd+R` (Mac)
4. Select `setupJiraProperties` from the function dropdown
5. Click **Run** and authorize the script when prompted
6. You should see an alert: "Properties set successfully!"

#### Method B: Using Project Settings (Manual)

1. In Apps Script editor, click the **Project Settings** icon (⚙️) in the left sidebar
2. Scroll down to **Script Properties**
3. Click **Add script property** for each:
   - **Property**: `JIRA_DOMAIN`, **Value**: `https://taxfix.atlassian.net`
   - **Property**: `EMAIL`, **Value**: `your-email@example.com`
   - **Property**: `API_TOKEN`, **Value**: `your-actual-api-token`
4. Click **Save script properties**

## Usage

Run `getMaestrosEpics2025()` from the Google Apps Script editor or add it as a custom menu item.

