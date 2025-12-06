# auto-deploy.ps1
# Robotcito para actualizar Constella sin escribir comandos a mano.

Set-Location "C:\Users\Carlos J. Polanco\Desktop\constella-social"

while ($true) {
    # Revisa si hay cambios sin commitear
    $changes = git status --porcelain

    if ($changes) {
        Write-Host "🔄 Cambios detectados. Subiendo a GitHub y Vercel..." -ForegroundColor Cyan

        git add .

        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "auto: actualización Constella ($timestamp)"

        git push

        Write-Host "✅ Deploy lanzado. Espera unos momentos y Constella se actualizará online." -ForegroundColor Green
    }
    else {
        Write-Host "⏳ Sin cambios. Revisaré de nuevo en 60 segundos..." -ForegroundColor DarkGray
    }

    # Espera 60 segundos antes de revisar otra vez
    Start-Sleep -Seconds 60
}
