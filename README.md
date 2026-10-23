# 🌍 Voyage

Application de gestion de profil et d'authentification moderne développée avec Next.js, Better Auth, Tailwind CSS et Resend.

## 🚀 Fonctionnalités

- Authentification complète (Inscription, Connexion) gérée par Better Auth.
- Vérification d'e-mail sécurisée via **Resend**.
- Gestion séparée du Prénom (`firstName`) et du Nom (`lastName`).
- Modification du profil, du pseudo unique (`@username`) et de l'avatar (avec upload Cloudinary).
- Interface utilisateur moderne conçue avec Base UI / Tailwind CSS.

## 🛠️ Prérequis

Assurez-vous d'avoir installé :

- Node.js (version 18+)
- Un gestionnaire de paquets (npm, pnpm ou yarn)

## ⚙️ Configuration de l'environnement

Créez un fichier `.env` à la racine du projet en vous inspirant de `.env.example` :

```env
BETTER_AUTH_SECRET=votre_secret_better_auth
BETTER_AUTH_URL=http://localhost:3000

RESEND_API_KEY=re_votre_cle_resend

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=votre_upload_preset
```
