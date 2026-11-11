; Installeur Inno Setup de link-peek. Compilation : iscc installer\link-peek.iss
; Le setup est cree dans installer\Output\link-peek-Setup-1.5.1.exe
#define MyAppName "link-peek"
#define MyAppVersion "1.5.1"
#define MyAppURL "https://github.com/Les-Doubles-A/link-peek"

[Setup]
AppId={{897632B2-BC65-57BA-858D-38FB960C4995}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher=Les-Doubles-A
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}/releases
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
OutputDir=Output
OutputBaseFilename={#MyAppName}-Setup-{#MyAppVersion}
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
CloseApplications=yes
SetupIconFile=link-peek.ico
UninstallDisplayIcon={app}\link-peek.ico
InfoAfterFile=INSTALLATION.txt
Uninstallable=yes

[Languages]
Name: "french"; MessagesFile: "compiler:Languages\French.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Files]
Source: "INSTALLATION.txt"; DestDir: "{app}"; Flags: ignoreversion
Source: "link-peek.ico"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\icons\*"; DestDir: "{app}\extension\icons"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\manifest.json"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\background.js"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\content.js"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\newtab.html"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\newtab.js"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\options.html"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\options.js"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\overlay.js"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\popup.html"; DestDir: "{app}\extension"; Flags: ignoreversion
Source: "..\popup.js"; DestDir: "{app}\extension"; Flags: ignoreversion

[Icons]
Name: "{autoprograms}\{#MyAppName} - dossier de l'extension"; Filename: "{app}\extension"; IconFilename: "{app}\link-peek.ico"
Name: "{autoprograms}\{#MyAppName} - instructions"; Filename: "{app}\INSTALLATION.txt"

[Run]
Filename: "{app}\extension"; Description: "Ouvrir le dossier de l'extension"; Flags: postinstall shellexec skipifsilent nowait
