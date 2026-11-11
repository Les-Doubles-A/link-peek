# Link Peek

Dépôt GitHub : **https://github.com/Les-Doubles-A/link-peek**

Extension navigateur qui ouvre les liens dans une fenêtre flottante déplaçable et redimensionnable, sans nouvel onglet.

<!-- installeur-release -->
## Installation

Téléchargez **`link-peek-Setup-1.5.1.exe`** depuis la [dernière release](https://github.com/Les-Doubles-A/link-peek/releases/latest), puis lancez-le.

L'installeur copie l'extension dans `%LOCALAPPDATA%\Programs\link-peek\extension` puis affiche la marche à suivre :

1. Ouvrez la page des extensions du navigateur (`chrome://extensions`, `edge://extensions`, `vivaldi://extensions`...).
2. Activez le **Mode développeur**.
3. Cliquez sur **Charger l'extension non empaquetée** et choisissez le dossier `extension` (raccourci dans le menu Démarrer).

L'installeur n'est pas signé : si Windows SmartScreen l'affiche, cliquez sur « Informations complémentaires » puis « Exécuter quand même ».

### Recréer l'installeur

Lancer [Inno Setup 6](https://jrsoftware.org/isinfo.php) : `iscc installer\link-peek.iss`. Le setup est créé dans `installer\Output\`.
