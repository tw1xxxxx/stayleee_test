# PowerShell Deployment Script for VPS (Optimized with ZIP)
# Usage: .\deploy.ps1

$remoteUser = "root"
$remoteHost = "194.67.100.225"
$remotePath = "/var/www/staysee"
$tempTar = "deploy.tar.gz"
$password = "hZJkpWfGBg0z2rm4"

Write-Host "--- Starting FAST Deployment to $remoteHost ---" -ForegroundColor Cyan

# 1. Create Tar archive locally
Write-Host "Creating archive (tar.gz)..." -ForegroundColor Yellow
if (Test-Path $tempTar) { Remove-Item $tempTar }
tar -czf $tempTar --exclude="node_modules" --exclude=".next" --exclude="public/images/uploads" --exclude="public/images/catalog" --exclude="public/videos" --exclude="parse_catalog" --exclude="foto" --exclude=".git" --exclude="$tempTar" --exclude="deploy.zip" .

# 2. Upload archive to server using pscp
Write-Host "Uploading $tempTar..." -ForegroundColor Yellow
pscp -pw $password $tempTar root@${remoteHost}:${remotePath}/

# 3. Extract, install, build and restart on server using plink
Write-Host "Executing server commands (extract, install, build, restart)..." -ForegroundColor Yellow
$remoteCommand = "cd ${remotePath} && tar -xzf ${tempTar} && rm ${tempTar} && mkdir -p public/images/uploads data && chmod -R 777 public/images/uploads data && chown -R www-data:www-data public/images/uploads data && npm install && npm run build && (pm2 restart clothing-for-restaurants || pm2 start ecosystem.config.js)"
plink -pw $password root@$remoteHost $remoteCommand

# 4. Cleanup local archive
Remove-Item $tempTar
Write-Host "--- Deployment Complete! ---" -ForegroundColor Green

Write-Host "Next steps on VPS (manual check):" -ForegroundColor Cyan
Write-Host "1. cd $remotePath"
Write-Host "2. npm install"
Write-Host "3. npm run build"
Write-Host "4. pm2 restart clothing-for-restaurants"
