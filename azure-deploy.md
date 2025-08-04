# Azure Deployment Guide for Dave's Running Club

## Option 1: Azure App Service (Recommended)

### Prerequisites
- Azure account
- Azure CLI installed (optional)
- Git repository with your code

### Method 1: Deploy via Azure Portal

1. **Create App Service:**
   - Go to Azure Portal
   - Create a new "Web App"
   - Choose Node.js 18+ runtime
   - Select your region

2. **Configure App Settings:**
   - Go to Configuration → Application settings
   - Add: `NODE_ENV` = `production`
   - Add: `WEBSITE_NODE_DEFAULT_VERSION` = `18.x`

3. **Deploy via GitHub Actions (Recommended):**
   - In Azure Portal, go to Deployment Center
   - Connect your GitHub repository
   - Azure will create a GitHub Action workflow

4. **Manual Deploy:**
   ```bash
   # Build locally
   npm run build
   
   # Deploy to Azure (if using Azure CLI)
   az webapp up --name your-app-name --resource-group your-rg
   ```

### Method 2: GitHub Actions (Automatic)

1. **Push your code to GitHub**
2. **Connect Azure to GitHub:**
   - In Azure Portal → App Service → Deployment Center
   - Choose GitHub as source
   - Select your repository
   - Azure creates `.github/workflows/azure-deploy.yml`

3. **The workflow will:**
   - Build the React app
   - Deploy to Azure App Service
   - Set NODE_ENV=production

### Method 3: Azure CLI

```bash
# Login to Azure
az login

# Create resource group
az group create --name daves-running-club-rg --location "UK South"

# Create App Service plan
az appservice plan create --name daves-running-club-plan --resource-group daves-running-club-rg --sku B1

# Create Web App
az webapp create --name daves-running-club --resource-group daves-running-club-rg --plan daves-running-club-plan --runtime "NODE|18-lts"

# Set environment variables
az webapp config appsettings set --name daves-running-club --resource-group daves-running-club-rg --settings NODE_ENV=production

# Deploy
az webapp up --name daves-running-club --resource-group daves-running-club-rg
```

## Option 2: Azure Static Web Apps + Azure Functions

### Frontend (Static Web Apps)
- Deploy React build to Azure Static Web Apps
- Configure API routes to point to Azure Functions

### Backend (Azure Functions)
- Convert Express routes to Azure Functions
- Use Azure Table Storage instead of JSON files

## Data Storage Options

### Current: JSON File (Simple)
- Works for small data
- Data stored in App Service file system
- May reset on app restarts

### Recommended: Azure Database
- **Azure SQL Database** (relational)
- **Azure Cosmos DB** (NoSQL)
- **Azure Table Storage** (simple key-value)

## Environment Variables

Set these in Azure App Service Configuration:
- `NODE_ENV` = `production`
- `PORT` = `8080` (Azure default)

## Custom Domain

1. **Add custom domain in Azure Portal**
2. **Configure DNS records**
3. **Enable HTTPS**

## Monitoring

- **Application Insights** for performance monitoring
- **Azure Monitor** for logs
- **Health checks** at `/api/health`

## Cost Estimation

- **Basic App Service (B1)**: ~£10/month
- **Custom domain**: ~£10/year
- **SSL certificate**: Free with Azure

## Troubleshooting

### Common Issues:
1. **Build fails**: Check Node.js version
2. **API not working**: Verify NODE_ENV=production
3. **Static files not served**: Ensure build folder exists

### Logs:
- View logs in Azure Portal → App Service → Log stream
- Or use: `az webapp log tail --name your-app-name`

## Next Steps

1. Choose deployment method
2. Set up GitHub repository
3. Deploy to Azure
4. Configure custom domain
5. Set up monitoring
6. Test all functionality

Your app will be available at: `https://your-app-name.azurewebsites.net` 