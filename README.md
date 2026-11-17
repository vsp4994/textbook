## Import JSON
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

The 48-character task title limit is a recommendation for better readability on smaller screens, where titles are displayed on a single line. It is not a restriction enforced by the importer.