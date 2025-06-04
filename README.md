# SpeakFlow

Application de traduction vocale en temps réel pour sapeurs-pompiers utilisant les APIs Google Cloud.

## Fonctionnalités

- Traduction vocale en temps réel avec l'API Google Cloud Translation
- Reconnaissance de texte dans les images avec l'API Google Cloud Vision
- Détection automatique de langue
- Mode hors ligne avec cache des traductions
- Phrases d'urgence prédéfinies
- Interface adaptée aux situations d'urgence avec mode haute visibilité

## Configuration des APIs Google Cloud

### 1. Créer un projet Google Cloud

1. Accédez à [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez l'ID du projet qui sera utilisé dans la configuration

### 2. Activer les APIs nécessaires

Dans la console Google Cloud, activez les APIs suivantes :

- Cloud Translation API
- Cloud Vision API

### 3. Créer une clé API

1. Dans la console Google Cloud, accédez à "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" et sélectionnez "API Key"
3. Copiez la clé API générée
4. Restreignez la clé API aux services Cloud Translation et Cloud Vision pour plus de sécurité

### 4. Configurer l'application

1. Copiez le fichier `.env.example` en `.env`
2. Remplissez les valeurs suivantes dans le fichier `.env` :
   ```
   GOOGLE_CLOUD_API_KEY=votre_clé_api_google_cloud
   GOOGLE_CLOUD_PROJECT_ID=votre_id_projet_google_cloud
   ```

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build
```

## Utilisation

### Traduction vocale
1. Sélectionnez les langues source et cible
2. Cliquez sur le bouton "Parler" et commencez à parler
3. La traduction s'affichera automatiquement
4. Utilisez le bouton "Prononcer" pour écouter la traduction

### Reconnaissance de texte dans les images
1. Accédez à l'onglet "Média"
2. Sélectionnez une image contenant du texte
3. Cliquez sur "Extraire le texte"
4. Le texte extrait sera affiché et pourra être traduit

### Mode hors ligne
L'application stocke les traductions précédentes dans un cache local pour permettre une utilisation limitée en mode hors ligne.
