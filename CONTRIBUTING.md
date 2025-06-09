# Guide de contribution à UraCAD

Tout d'abord, merci de considérer une contribution à UraCAD ! 👍

Ce document vous guidera dans le processus de contribution afin que votre travail puisse être intégré efficacement.

## Table des matières

- [Code de conduite](#code-de-conduite)
- [Comment puis-je contribuer ?](#comment-puis-je-contribuer-)
  - [Signaler des bugs](#signaler-des-bugs)
  - [Suggérer des fonctionnalités](#suggérer-des-fonctionnalités)
  - [Contribuer au code](#contribuer-au-code)
- [Style de code](#style-de-code)
- [Processus de Pull Request](#processus-de-pull-request)
- [Licence et droits commerciaux](#licence-et-droits-commerciaux)

## Code de conduite

Ce projet et tous les participants sont régis par notre code de conduite. En participant, vous êtes censé respecter ce code. Veuillez signaler tout comportement inacceptable à contact@urahost.com.

## Comment puis-je contribuer ?

### Signaler des bugs

Les bugs sont suivis via les [issues GitHub](https://github.com/BourezBastien/uracad/issues).

Avant de créer un bug report, vérifiez si le problème a déjà été signalé. Si c'est le cas, ajoutez un commentaire à l'issue existante au lieu d'en ouvrir une nouvelle.

Lorsque vous créez une issue, utilisez le modèle "Bug Report" et incluez autant de détails que possible :

- Utilisez un titre clair et descriptif
- Décrivez les étapes exactes pour reproduire le problème
- Décrivez le comportement observé et ce que vous attendiez
- Précisez votre environnement (version FiveM, framework, etc.)
- Incluez des captures d'écran si possible

### Suggérer des fonctionnalités

Les suggestions de fonctionnalités sont également gérées via les [issues GitHub](https://github.com/BourezBastien/uracad/issues).

Utilisez le modèle "Feature Request" et fournissez des informations détaillées :

- Une description claire de la fonctionnalité
- Pourquoi cette fonctionnalité serait utile pour l'ensemble des utilisateurs
- Comment cela fonctionnerait dans l'interface utilisateur

Vous pouvez également ajouter et voter pour des fonctionnalités sur notre [board de feedback](https://uracad.userjot.com/board/all).

### Contribuer au code

1. Forkez le dépôt
2. Clonez votre fork (`git clone https://github.com/your-username/uracad.git`)
3. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
4. Faites vos modifications
5. Committez vos changements (voir [Convention de Commit](#convention-de-commit))
6. Poussez vers votre branche (`git push origin feature/amazing-feature`)
7. Ouvrez une Pull Request

## Style de code

UraCAD est développé avec TypeScript et Next.js 15. Nous suivons des conventions strictes pour maintenir la cohérence et la qualité du code.

### TypeScript

- Utilisez des types explicites et évitez `any` autant que possible
- Préférez les interfaces aux types pour les objets
- Utilisez les fonctions génériques lorsque cela a du sens
- Configurez strictement le TypeScript (strict: true, noImplicitAny: true, etc.)

### Next.js 15

- Suivez l'architecture App Router de Next.js
- Utilisez les Server Components par défaut, sauf si vous avez besoin de fonctionnalités client-side
- Respectez la structure de dossiers recommandée par Next.js
- Utilisez les fonctionnalités de chargement et d'erreur intégrées

### Style de codage

- Utilisez 2 espaces pour l'indentation
- Utilisez les noms en camelCase pour les variables et fonctions
- Utilisez les noms en PascalCase pour les composants, interfaces et types
- Utilisez les noms en UPPER_CASE pour les constantes
- Documentez votre code avec des commentaires JSDoc
- Respectez la limite de 100 caractères par ligne
- Ajoutez des tests unitaires pour toutes les nouvelles fonctionnalités

### Convention de Commit

Nous suivons la [convention de commit Angular](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#-commit-message-format) pour tous les commits. Chaque message de commit doit suivre ce format:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types courants:
- **feat**: Une nouvelle fonctionnalité
- **fix**: Correction d'un bug
- **docs**: Modification de la documentation
- **style**: Changements qui n'affectent pas le sens du code (espaces, formatage, etc.)
- **refactor**: Modification du code qui ne corrige pas un bug et n'ajoute pas de fonctionnalité
- **perf**: Amélioration des performances
- **test**: Ajout ou modification de tests
- **chore**: Modifications des outils de build, des dépendances, etc.

Exemple:
```
feat(auth): add role-based access control

Implement RBAC for MDT access with different permission levels.
```

## Processus de Pull Request

1. Assurez-vous que votre code respecte les conventions de style
2. Exécutez les tests et assurez-vous qu'ils passent
3. Mettez à jour la documentation si nécessaire
4. Les Pull Requests doivent être faites vers la branche `dev`, pas directement vers `main`
5. Un mainteneur examinera votre PR et pourra demander des modifications
6. Une fois approuvée, votre PR sera fusionnée

## Licence et droits commerciaux

En contribuant à UraCAD, vous acceptez que votre contribution soit sous licence Apache 2.0 avec Commons Clause. 

Veuillez noter que l'aspect commercial d'UraCAD reste sous le contrôle exclusif d'UraHost. En contribuant, vous reconnaissez que vous ne pourrez pas commercialiser le code auquel vous avez contribué, ces droits étant exclusivement réservés à UraHost conformément à notre LICENSE-COMMERCIAL.

---

Encore une fois, merci de contribuer à UraCAD ! ❤️
