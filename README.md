# 📖 TextBook

**A simple place to organize your tasks, notes, and links.**

🌐 **Live App:** https://vsp4994.github.io/textbook/

## 🇬🇧 English

### What is TextBook?

TextBook is a free, lightweight web application designed to keep your everyday information organized in one place.

It allows you to save and manage **text-based content only**, such as tasks, to-do lists, personal notes, ideas, and useful links.

Whether you're planning your day, creating shopping lists, saving interesting websites, or organizing personal information, TextBook keeps everything simple and accessible.

The application is available in both **English and French**.

### ✨ Key Features

- **Lists & Categories:** Create multiple lists and organize them with categories and subcategories.
- **Task Management:** Add, edit, complete, delete, move, and reorder tasks.
- **Notes & Links:** Save text notes, descriptions, website links, and references.
- **Starred Items:** Mark important tasks and access them together in a dedicated view.
- **Search:** Quickly find saved information across your lists.
- **Easy Organization:** Copy content, paste multiple tasks, and customize how categories are displayed.
- **Google Drive Sync:** Optionally connect your Google account to synchronize your data.
- **Local Storage:** Keep your information saved locally in your browser, even without connecting Google Drive.
- **Installable PWA:** Install TextBook like an app on your phone or computer.
- **Bilingual Interface:** Easily switch between English and French according to your preference.

### 📌 Important

TextBook is a **text-only organizer**. It is not designed to upload or store images, videos, audio, or other files. However, you can save links to external content.

Its goal is simple: **Keep your everyday information organized, accessible, and easy to manage.**

---

## 🇫🇷 Français

### Qu'est-ce que TextBook ?

TextBook est une application web gratuite et légère, conçue pour organiser facilement vos informations quotidiennes au même endroit.

Elle permet d'enregistrer et de gérer **uniquement du contenu textuel**, comme des tâches, des listes de choses à faire, des notes personnelles, des idées et des liens utiles.

Que ce soit pour planifier votre journée, préparer vos courses, enregistrer des sites intéressants ou organiser vos informations personnelles, TextBook vous aide à tout garder au même endroit.

L'application est disponible en **anglais et en français**.

### ✨ Fonctionnalités principales

- **Listes et catégories :** Créez plusieurs listes et organisez-les avec des catégories et sous-catégories.
- **Gestion des tâches :** Ajoutez, modifiez, cochez, supprimez, déplacez et réorganisez vos tâches.
- **Notes et liens :** Enregistrez des notes, des descriptions, des liens web et des références.
- **Favoris :** Marquez les tâches importantes avec une étoile et retrouvez-les dans une vue dédiée.
- **Recherche :** Retrouvez rapidement les informations enregistrées dans vos listes.
- **Organisation facile :** Copiez du contenu, collez plusieurs tâches et personnalisez l'affichage des catégories.
- **Synchronisation Google Drive :** Connectez votre compte Google, si vous le souhaitez, pour synchroniser vos données.
- **Stockage local :** Conservez vos informations directement dans votre navigateur, même sans connexion à Google Drive.
- **Application installable (PWA) :** Installez TextBook comme une application sur votre téléphone ou votre ordinateur.
- **Interface bilingue :** Passez facilement de l'anglais au français selon vos préférences.

### 📌 Important

TextBook est une application **exclusivement dédiée au texte**. Elle n'est pas conçue pour importer ou stocker des images, des vidéos, des fichiers audio ou d'autres documents. Vous pouvez toutefois enregistrer des liens vers des contenus externes.

Son objectif est simple : **Garder vos informations quotidiennes organisées, accessibles et faciles à gérer.**


<!-- ## Import JSON (This feature is not accessible to public)
Here’s the JSON structure supported by your **TextBook Import JSON** feature.

### **Example:&#x20;**`textbook_import.json`

```
{
  "format": "textbook-import-v1",
  "categories": [
    {
      "title": "DIY",
      "subcategories": [
        {
          "title": "Woodworking",
          "items": [
            {
              "title": "Build a wooden wall shelf",
              "url": "https://www.instagram.com/reel/ABC123/"
            },
            {
              "title": "DIY storage cabinet",
              "url": "https://www.instagram.com/reel/DEF456/"
            }
          ]
        },
        {
          "title": "Home Repairs",
          "items": [
            {
              "title": "Repair a damaged wall",
              "url": "https://www.instagram.com/reel/GHI789/"
            }
          ]
        }
      ]
    },
    {
      "title": "Interiors",
      "subcategories": [
        {
          "title": "Kitchen Design",
          "items": [
            {
              "title": "Modern modular kitchen ideas",
              "url": "https://www.instagram.com/reel/JKL123/"
            }
          ]
        }
      ]
    },
    {
      "title": "Others",
      "items": [
        {
          "title": "Interesting Instagram post",
          "url": "https://www.instagram.com/reel/MNO456/"
        }
      ]
    }
  ]
}
```

### **Import rules**

| Property        | Description                          |
| --------------- | ------------------------------------ |
| `format`        | Required: `textbook-import-v1`       |
| `categories`    | Array of categories                  |
| `title`         | Category, subcategory, or task title |
| `subcategories` | Optional nested categories           |
| `items`         | Array of tasks                       |
| `url`           | HTTPS link to the saved post         |

**Automatically handled by the importer:**

- Creates a new list: `IMP_ddmm_hhmm`
- Generates unique IDs for lists, categories, and tasks.
- Converts each `url` into a task description: `https://...`
- Sets `completed: false` and `starred: false`.
- Preserves existing TextBook data.
- Supports up to 3 category levels.

**Important:** You don't need to include IDs, completion status, descriptions, or list names in the JSON.

The 48-character task title limit is a recommendation for better readability on smaller screens, where titles are displayed on a single line. It is not a restriction enforced by the importer. -->