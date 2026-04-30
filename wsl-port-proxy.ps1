# PostRestoran - WSL Port Proxy Script
# Bu scripti YÖNETİCİ (Administrator) olarak çalıştırın!
# WSL içindeki API portunu (3001) ve Frontend portunu (3000) 
# yerel ağdaki diğer cihazlardan (tablet, telefon) erişilebilir hale getirir.

Write-Host "PostRestoran WSL Port Proxy Kurulumu..." -ForegroundColor Cyan

# WSL'nin IP adresini al
$wslIp = (wsl -- ip -4 addr show eth0 | Select-String -Pattern '(\d+\.\d+\.\d+\.\d+)/').Matches.Groups[1].Value

if (-not $wslIp) {
    Write-Host "HATA: WSL IP adresi bulunamadi!" -ForegroundColor Red
    exit 1
}

Write-Host "WSL IP adresi: $wslIp" -ForegroundColor Green

# Eski proxy kayıtlarını temizle (idempotent)
netsh interface portproxy delete v4tov4 listenport=3000 listenaddress=0.0.0.0 2>$null
netsh interface portproxy delete v4tov4 listenport=3001 listenaddress=0.0.0.0 2>$null

# Yeni proxy kurallarını ekle
netsh interface portproxy add v4tov4 listenport=3000 listenaddress=0.0.0.0 connectport=3000 connectaddress=$wslIp
netsh interface portproxy add v4tov4 listenport=3001 listenaddress=0.0.0.0 connectport=3001 connectaddress=$wslIp

Write-Host "`n✅ Port proxy kuruldu:" -ForegroundColor Green
Write-Host "   0.0.0.0:3000 -> $wslIp:3000 (Frontend)" -ForegroundColor White
Write-Host "   0.0.0.0:3001 -> $wslIp:3001 (API Backend)" -ForegroundColor White

# Windows Firewall kurallarını ekle
$ruleName3000 = "PostRestoran-Frontend-3000"
$ruleName3001 = "PostRestoran-API-3001"

# Eski kuralları temizle
Remove-NetFirewallRule -DisplayName $ruleName3000 -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName $ruleName3001 -ErrorAction SilentlyContinue

# Yeni Firewall kuralları ekle
New-NetFirewallRule -DisplayName $ruleName3000 -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000 | Out-Null
New-NetFirewallRule -DisplayName $ruleName3001 -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3001 | Out-Null

Write-Host "`n✅ Windows Firewall kurallari guncellendi." -ForegroundColor Green

# Bilgisayarın yerel ağ IP adresini göster
$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" } | Select-Object -First 1).IPAddress
Write-Host "`n📱 Telefon/Tablet'ten su adrese gidin:" -ForegroundColor Yellow
Write-Host "   http://$($localIp):3000" -ForegroundColor Cyan

Write-Host "`nNot: Bu script her bilgisayar yeniden baslatildiginda veya WSL yeniden baslatildiginda tekrar calistirilmalidir." -ForegroundColor Gray
