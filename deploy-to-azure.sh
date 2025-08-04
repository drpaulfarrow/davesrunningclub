#!/bin/bash

# ====== CONFIGURE THESE ======
RESOURCE_GROUP="daves-running-club-rg"
APP_NAME="daves-running-club"
LOCATION="uksouth"
PLAN_NAME="${APP_NAME}-plan"
NODE_VERSION="22-lts"
# =============================

echo "🚀 Starting Azure deployment for Dave's Running Club..."

echo "📝 Logging in to Azure..."
az login

echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

echo "📋 Creating App Service plan..."
az appservice plan create --name $PLAN_NAME --resource-group $RESOURCE_GROUP --sku B1

echo "🌐 Creating Web App..."
az webapp create --name $APP_NAME --resource-group $RESOURCE_GROUP --plan $PLAN_NAME --runtime "NODE|$NODE_VERSION"

echo "⚙️ Setting environment variables..."
az webapp config appsettings set --name $APP_NAME --resource-group $RESOURCE_GROUP --settings NODE_ENV=production

echo "🔨 Building React app..."
npm run build

echo "📦 Zipping project for deployment..."
zip -r app.zip . -x "node_modules/*" -x "*.git*" -x "*.DS_Store"

echo "🚀 Deploying to Azure Web App..."
az webapp deploy --resource-group $RESOURCE_GROUP --name $APP_NAME --src-path app.zip --type zip

echo "🧹 Cleaning up zip file..."
rm app.zip

echo "🌍 Opening your app in the browser..."
az webapp browse --name $APP_NAME --resource-group $RESOURCE_GROUP

echo "✅ Deployment complete!"
echo "🎉 Your app is live at: https://$APP_NAME.azurewebsites.net"
echo "💙 Dave's Running Club is now online!" 