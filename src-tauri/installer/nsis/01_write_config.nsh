!include "FileFunc.nsh"
!include "LogicLib.nsh"

Function WriteConfigJson
  StrCpy $0 "$PROGRAMDATA\\MAMASTOCK"
  IfFileExists "$0\\config.json" +3 0
    ; le fichier existe déjà → ne pas écraser
    Return
  CreateDirectory "$0"
  CopyFiles /SILENT "$INSTDIR\\resources\\config.json" "$0\\config.json"
FunctionEnd
