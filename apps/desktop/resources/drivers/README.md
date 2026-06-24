# resources/drivers — driver Apple per l'installer

L'installer di FreshPhone installa automaticamente l'**Apple Mobile Device Support**
(driver USB + servizio `usbmuxd`) se non già presente sul PC, così l'iPhone viene
riconosciuto al primo avvio senza che il cliente debba installare nulla a mano.

## File richiesto (NON versionato)

- `AppleMobileDeviceSupport64.msi` — il pacchetto Apple Mobile Device Support (64-bit).

Deve essere presente in questa cartella **prima** di creare l'installer
(`pnpm --filter @freshphone/desktop build && electron-builder`). È escluso da git
(vedi `.gitignore`): è un componente Apple (~38MB) ridistribuibile.

## Come ottenerlo

È il pacchetto incluso in iTunes / "Apple Devices". Su una macchina con iTunes
installato è recuperabile dalla cache di Windows Installer (la copia esatta
ridistribuibile):

```powershell
$root="HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Installer\UserData\S-1-5-18\Products"
Get-ChildItem $root | ForEach-Object {
  $p = Get-ItemProperty (Join-Path $_.PSPath InstallProperties) -ErrorAction SilentlyContinue
  if ($p.DisplayName -eq 'Apple Mobile Device Support') { $p.LocalPackage }
}
# Copia il percorso risultante in AppleMobileDeviceSupport64.msi
```

In alternativa si estrae `AppleMobileDeviceSupport64.msi` da `iTunes64Setup.exe`.

## Logica di installazione

- L'installer (NSIS, elevato/perMachine) esegue `build/installer.nsh` → se il
  servizio `Apple Mobile Device Service` non esiste, lancia
  `msiexec /i AppleMobileDeviceSupport64.msi /qn /norestart`.
- A runtime l'app rileva il servizio (`driver:status`) e, come fallback, può
  reinstallarlo dal pacchetto incluso (`driver:install`).
