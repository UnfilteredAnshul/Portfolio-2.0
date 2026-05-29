# Google Drive Setup for Admin Media Uploads

## Step 1: Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it (e.g., `portfolio-media`)
4. Click **Create**

## Step 2: Enable Google Drive API
1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click **Enable**

## Step 3: Create a Service Account
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Name: `portfolio-uploader`
4. Click **Create and Continue** (skip grant, no need)
5. Click **Done**

## Step 4: Generate a Key for the Service Account
1. In the **Service Accounts** list, click your new account
2. Go to **Keys** tab → **Add Key** → **Create New Key**
3. Choose **JSON** → **Create**
4. A JSON file will download — save it securely as `service-account-key.json`

## Step 5: Set Up a Google Drive Folder
1. Go to [drive.google.com](https://drive.google.com/)
2. Create a folder named `portfolio-media`
3. Right-click the folder → **Share**
4. Share with your service account email (find it in the JSON: `client_email`)
5. Give **Editor** permission

## Step 6: Install Google Drive SDK
```bash
npm install googleapis
```

## Step 7: Set Environment Variables
Add to Vercel and `.env.local`:

```
GOOGLE_SERVICE_ACCOUNT_EMAIL=<client_email from JSON>
GOOGLE_PRIVATE_KEY="<private_key from JSON>"
GOOGLE_DRIVE_FOLDER_ID=<folder ID from the URL>
```

The folder ID is the long string in the URL when you open the folder:
`https://drive.google.com/drive/folders/<THIS_IS_THE_ID>`

## Step 8: Create Upload API Route
Create `app/api/upload/route.ts` that:
- Authenticates with the service account
- Uploads file to the shared Drive folder
- Sets file permissions to "Anyone with the link can view"
- Returns the public download URL

## Step 9: Wire Admin Form
Replace preview/video URL text inputs with file inputs that:
1. User selects a file
2. Uploads to `/api/upload`
3. Gets back the public URL
4. Auto-fills the preview/video field

## Notes
- Free tier: 15GB storage shared across Google account (Drive, Gmail, Photos)
- Files are set to "Anyone with the link" so they're publicly accessible
- No egress fees
- Max upload size: 5TB per file (effectively unlimited for your use case)
- Service account uploads don't count toward your personal Google account storage quota (they count toward the project quota, which has 15GB free per Google account)
