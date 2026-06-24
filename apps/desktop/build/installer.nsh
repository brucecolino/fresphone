; FreshPhone — installazione automatica dei driver Apple (Apple Mobile Device Support:
; driver USB + servizio usbmuxd). L'installer gira elevato (perMachine), quindi msiexec
; può installare driver e servizio in silenzio, senza ulteriori prompt per l'utente.

!macro customInstall
  DetailPrint "FreshPhone: verifica driver Apple..."
  nsExec::ExecToStack 'sc query "Apple Mobile Device Service"'
  Pop $0
  ${If} $0 == "0"
    DetailPrint "Apple Mobile Device Support già presente: nessuna installazione necessaria."
  ${ElseIf} ${FileExists} "$INSTDIR\resources\drivers\AppleMobileDeviceSupport64.msi"
    DetailPrint "Installazione Apple Mobile Device Support in corso..."
    ExecWait 'msiexec /i "$INSTDIR\resources\drivers\AppleMobileDeviceSupport64.msi" /qn /norestart' $1
    DetailPrint "Driver Apple installati (codice msiexec: $1)."
  ${Else}
    DetailPrint "Driver Apple assenti e pacchetto non incluso: installazione saltata."
  ${EndIf}
!macroend
