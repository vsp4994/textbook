import type { Language, TranslateParams } from './types';

/**
 * The single source of truth for every user-visible string in the app.
 *
 * `en` is the master dictionary and defines the shape of `TranslationKey`.
 * Every other language must provide exactly the same keys (the `Dictionary`
 * type enforces this at compile time), so adding a language is purely additive:
 * drop a new `LANGUAGES` entry in types.ts and add one block here.
 *
 * Interpolation: `t('key', { name: value })` replaces `{{name}}` occurrences.
 * NOTE: English values for known deep-layer error messages (moves/import) must
 * match, character for character, what the throwing modules emit — the
 * `localizeErrorMessage` helper reverse-maps them for translation.
 */

const en = {
  // --- Common / generic ---
  'common.confirm': 'Confirm',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.copy': 'Copy',
  'common.copied': 'Copied!',
  'common.loading': 'Loading...',

  // --- App chrome / hero empty state ---
  'app.empty.title': 'Every story starts with a blank page.',
  'app.empty.subtitle': 'Create your first list and give your notes, plans, and ideas a home.',
  'app.emptyCategoryHint': 'Click "Category" to get started.',
  'app.addCategory': 'Add New Category',
  'app.starred': 'Starred',
  'app.starredTab': 'Starred ({{count}})',
  'app.addList': 'List',
  'app.importJson': 'Import JSON',
  'app.importJsonTooltip': 'Import TextBook JSON into a new list',
  'app.listOptions': 'View and reorder lists',
  'app.dragToReorder': 'Drag to reorder lists',
  'app.noListsYet': 'No lists yet.',
  'app.goToList': 'Go to {{title}}',
  'app.renameList': 'Rename list',
  'app.deleteList': 'Delete list',
  'app.openList': 'Open "{{title}}"',
  'app.starredEmpty.title': 'Nothing starred yet',
  'app.starredEmpty.subtitle': 'Tap the star on any task to keep it here for quick access.',
  'app.diagnostics': '{{sizeKb}} KB · {{lines}} lines · {{tasks}} tasks',
  // --- Confirmation modals (delete list / category / checked) ---
  'modal.deleteList.title': 'Delete List -  {{title}}',
  'modal.deleteList.message':
    'Are you absolutely sure you want to delete the list "{{title}}" and all its contents?',
  'modal.confirmDelete': 'Yes, Delete!',
  'modal.noKeep': 'No, Keep it',
  'modal.deleteCategory.title': 'Delete Category',
  'modal.deleteCategory.message':
    'Delete the category "{{title}}" and all its subcategories and checklist items?',
  'modal.deleteChecked.title': 'Delete Checked Items',
  'modal.deleteChecked.message':
    'Delete all checked items in "{{title}}"? This only affects this category\'s own checked items and cannot be undone.',
  'modal.renameCategory': 'Rename Category',
  'modal.addCategory': 'Add Category',
  'modal.addSubcategory': 'Add Subcategory',
  'modal.addList': 'Add List',
  'modal.renameList': 'Rename List',
  'modal.moveTo': 'Move "{{title}}" to ...',

  // --- Text prompt (category / list naming) ---
  'prompt.categoryTitle': 'Category title',
  'prompt.subcategoryTitle': 'Subcategory title',
  'prompt.listTitle': 'List title',
  'prompt.maxCharacters': 'Maximum {{count}} characters.',

  // --- Todo item ---
  'task.namePlaceholder': 'Task name...',
  'task.untitled': 'Untitled',
  'task.star': 'Star',
  'task.unstar': 'Unstar',
  'task.unstarChecked': 'Unstar (checked)',
  'task.moreActions': 'More actions',
  'task.addDescription': 'Add Description',
  'task.moveTo': 'Move to ...',
  'task.entityTask': 'Task',
  'task.entityCategory': 'Category',
  'task.movedToast': 'was moved to {{dest}}.',
  'task.completedToast': 'Task completed',
  'task.showDescription': 'Show description',
  'task.hideDescription': 'Hide description',
  'task.copyDescription': 'Copy description',
  'task.previewMarkdown': 'Preview Markdown',
  'task.collapseDescription': 'Collapse description',
  'task.expandDescription': 'Expand description',
  'task.preview': 'Preview',
  'task.closePreview': 'Close preview',
  'task.nothingToPreview': '*Nothing to preview*',
  'task.addDescriptionPlaceholder': 'Add description...',
  'task.openLinkTitle': 'Open {{url}} in a new tab',
  'task.pasteTitle': 'Paste multiple tasks?',
  'task.pasteMessage': 'Detected {{count}} tasks. How would you like to paste them?',
  'task.addTasks': 'Add {{count}} tasks',
  'task.pasteAsOneLine': 'Paste as one line',

  // --- Category dropdown ---
  'category.rename': 'Rename',
  'category.keepOpen': 'Keep open',
  'category.showCheckedAtBottom': 'Show checked at bottom',
  'category.hideCheckboxes': 'Hide checkboxes',
  'category.showCheckboxes': 'Show checkboxes',
  'category.uncheckAllToHide': 'Uncheck all to hide check-boxes',
  'category.uncheckAll': 'Uncheck all items',
  'category.addSubcategory': 'Add Subcategory',
  'category.moveTo': 'Move to ...',
  'category.deleteAllChecked': 'Delete all checked',
  'category.deleteCategory': 'Delete Category',
  'category.left': '{{count}} left',
  'category.nestingLimit':
    'Nesting limit reached! Maximum nesting level is {{level}}.',

  // --- Sync header ---
  'sync.localOnly': 'Local only - Connect to sync data',
  'sync.connecting': 'Connecting',
  'sync.syncing': 'Syncing',
  'sync.synced': 'Synced',
  'sync.offline': 'Offline',
  'sync.reconnect': 'Reconnect',
  'sync.failed': 'Sync failed',
  'sync.connectTitle': 'Connect to sync data',
  'sync.retryTitle': 'Retry sync',
  'sync.logoutTitle': 'Sign out',
  'sync.indexedDbUnavailable':
    'IndexedDB is unavailable. Changes only survive while this page stays open.',

  // --- Sync error codes (driven by DriveSyncContext) ---
  'sync.error.unreachable':
    'Google Drive could not be reached. Your changes are saved locally.',
  'sync.error.failed': 'Google Drive sync failed.',
  'sync.error.authFailed': 'Google authorization failed.',
  'sync.error.changedRepeatedly':
    'Google Drive changed repeatedly during sync. The app kept local data and will retry.',
  'sync.error.driveDataCorrupt':
    'The Google Drive data file is invalid or corrupted. Local data was not replaced.',
  'sync.error.reconnectRequired':
    'Reconnect Google Drive and complete the final sync before signing out.',
  'sync.error.unexpected': 'An unexpected error occurred.',
  // --- Toast labels ---
  'toast.success': 'Success',
  'toast.error': 'Error',
  'toast.info': 'Info',
  'toast.dismiss': 'Dismiss notification',

  // --- Search ---
  'search.placeholder': 'Search tasks, categories, lists...',
  'search.clear': 'Clear search',
  'search.close': 'Close search',
  'search.search': 'Search',
  'search.noResults': 'No results for "{{query}}"',
  'search.ariaLabel': 'Search the document',

  // --- Move modal ---
  'move.current': '(current)',
  'move.noDestinations': 'No other destinations available in this document.',
  'move.makeMainCategory': 'Make it a top-level (Main) Category',
  'move.asMainCategory': 'As a Main Category in "{{list}}"',
  'move.tooDeepToFit': 'Too deep to fit here (max 3 levels)',
  'move.dest.topLevel': 'the top level of "{{list}}"',
  'move.dest.fallbackList': 'list',
  'move.dest.fallbackCategory': 'this category',

  // --- Import (App flow + importTextbookJson deep errors) ---
  'import.docNotReady': 'Document is not ready.',
  'import.docChanged': 'Your active document changed during import. Please try again.',
  'import.couldNotImport': 'Could not import JSON.',
  'import.successToast': 'Imported {{count}} tasks into {{list}}{{skipped}}',
  'import.duplicatesSkipped': ' ({{count}} duplicates skipped)',
  'import.error.taskNeedsUrl': 'Every imported task must have a URL.',
  'import.error.invalidUrl': 'Invalid task URL: {{url}}',
  'import.error.httpsOnly': 'Imported links must be HTTPS URLs without credentials.',
  'import.error.categoryNeedsTitle': 'Every category needs a title.',
  'import.error.emptyCategoryTitle': 'Category titles cannot be empty.',
  'import.error.unsupportedFormat': 'Unsupported JSON format. Expected textbook-import-v1.',
  'import.error.missingCategories': 'Import JSON must contain a categories array.',
  'import.error.nestingTooDeep': 'Category nesting cannot exceed {{level}} levels.',
  'import.error.invalidCategory': 'Invalid category object.',
  'import.error.invalidItemsIn': 'Invalid items or subcategories in "{{title}}".',
  'import.error.invalidTaskIn': 'Invalid task title in "{{title}}".',
  'import.error.noTasks': 'No tasks found in this import JSON.',

  // --- Move deep-layer errors (moveUtils) ---
  'move.error.taskMustBeInCategory': 'A task can only be moved into a category.',
  'move.error.taskNotFound': 'Task not found.',
  'move.error.alreadyInCategory': 'Task is already in that category.',
  'move.error.targetListNotFound': 'Target list not found.',
  'move.error.categoryNotFound': 'Category not found.',
  'move.error.targetCategoryNotFound': 'Target category not found.',
  'move.error.intoSelf': 'A category cannot be moved into itself or its own subcategories.',
  'move.error.tooDeep': 'Target is too deep for the moved category (max 3 levels).',
  'move.error.notAllowed': 'This move is not allowed.',

  // --- Language switcher ---
  'language.switch': 'Change language',
  'language.current': 'Language: {{language}}',
};

const fr: Dictionary = {
  // --- Commun / générique ---
  'common.confirm': 'Confirmer',
  'common.cancel': 'Annuler',
  'common.close': 'Fermer',
  'common.save': 'Enregistrer',
  'common.delete': 'Supprimer',
  'common.copy': 'Copier',
  'common.copied': 'Copié !',
  'common.loading': 'Chargement…',

  // --- Interface de l’application / état vide ---
  'app.empty.title': 'Chaque histoire commence par une page blanche.',
  'app.empty.subtitle':
    'Créez votre première liste et donnez un foyer à vos notes, plans et idées.',
  'app.emptyCategoryHint': 'Cliquez sur « Catégorie » pour commencer.',
  'app.addCategory': 'Ajouter une nouvelle catégorie',
  'app.starred': 'Favoris',
  'app.starredTab': 'Favoris ({{count}})',
  'app.addList': 'Liste',
  'app.importJson': 'Importer JSON',
  'app.importJsonTooltip': 'Importer un JSON TextBook dans une nouvelle liste',
  'app.listOptions': 'Voir et réorganiser les listes',
  'app.dragToReorder': 'Faites glisser pour réorganiser les listes',
  'app.noListsYet': 'Aucune liste pour le moment.',
  'app.goToList': 'Aller à « {{title}} »',
  'app.renameList': 'Renommer la liste',
  'app.deleteList': 'Supprimer la liste',
  'app.openList': 'Ouvrir « {{title}} »',
  'app.starredEmpty.title': 'Aucun favori pour le moment',
  'app.starredEmpty.subtitle':
    'Touchez l’étoile sur une tâche pour la garder ici.',
  'app.diagnostics': '{{sizeKb}} Ko · {{lines}} lignes · {{tasks}} tâches',

  // --- Fenêtres de confirmation (suppression) ---
  'modal.deleteList.title': 'Supprimer la liste -  {{title}}',
  'modal.deleteList.message':
    'Êtes-vous vraiment sûr(e) de vouloir supprimer la liste « {{title}} » et tout son contenu ?',
  'modal.confirmDelete': 'Oui, supprimer !',
  'modal.noKeep': 'Non, garder',
  'modal.deleteCategory.title': 'Supprimer la catégorie',
  'modal.deleteCategory.message':
    'Supprimer la catégorie « {{title}} », ses sous-catégories et toutes ses tâches ?',
  'modal.deleteChecked.title': 'Supprimer les éléments cochés',
  'modal.deleteChecked.message':
    'Supprimer tous les éléments cochés de « {{title}} » ? Cela ne concerne que les éléments cochés de cette catégorie et ne peut pas être annulé.',
  'modal.renameCategory': 'Renommer la catégorie',
  'modal.addCategory': 'Ajouter une catégorie',
  'modal.addSubcategory': 'Ajouter une sous-catégorie',
  'modal.addList': 'Ajouter une liste',
  'modal.renameList': 'Renommer la liste',
  'modal.moveTo': 'Déplacer « {{title}} » vers…',

  // --- Saisie de texte (nom de catégorie / liste) ---
  'prompt.categoryTitle': 'Titre de la catégorie',
  'prompt.subcategoryTitle': 'Titre de la sous-catégorie',
  'prompt.listTitle': 'Titre de la liste',
  'prompt.maxCharacters': 'Maximum {{count}} caractères.',

  // --- Tâche ---
  'task.namePlaceholder': 'Nom de la tâche…',
  'task.untitled': 'Sans titre',
  'task.star': 'Mettre en favori',
  'task.unstar': 'Retirer des favoris',
  'task.unstarChecked': 'Retirer des favoris (cochée)',
  'task.moreActions': 'Plus d’actions',
  'task.addDescription': 'Ajouter une description',
  'task.moveTo': 'Déplacer vers…',
  'task.entityTask': 'Tâche',
  'task.entityCategory': 'Catégorie',
  'task.movedToast': 'a été déplacée vers {{dest}}.',
  'task.completedToast': 'Tâche terminée',
  'task.showDescription': 'Afficher la description',
  'task.hideDescription': 'Masquer la description',
  'task.copyDescription': 'Copier la description',
  'task.previewMarkdown': 'Aperçu Markdown',
  'task.collapseDescription': 'Réduire la description',
  'task.expandDescription': 'Agrandir la description',
  'task.preview': 'Aperçu',
  'task.closePreview': 'Fermer l’aperçu',
  'task.nothingToPreview': '*Rien à prévisualiser*',
  'task.addDescriptionPlaceholder': 'Ajouter une description…',
  'task.openLinkTitle': 'Ouvrir {{url}} dans un nouvel onglet',
  'task.pasteTitle': 'Coller plusieurs tâches ?',
  'task.pasteMessage':
    '{{count}} tâches détectées. Comment souhaitez-vous les coller ?',
  'task.addTasks': 'Ajouter {{count}} tâches',
  'task.pasteAsOneLine': 'Coller sur une seule ligne',
  // --- Menu de catégorie ---
  'category.rename': 'Renommer',
  'category.keepOpen': 'Garder ouvert',
  'category.showCheckedAtBottom': 'Afficher les cochées en bas',
  'category.hideCheckboxes': 'Masquer les cases',
  'category.showCheckboxes': 'Afficher les cases',
  'category.uncheckAllToHide':
    'Décochez tout pour masquer les cases',
  'category.uncheckAll': 'Tout décocher',
  'category.addSubcategory': 'Ajouter une sous-catégorie',
  'category.moveTo': 'Déplacer vers…',
  'category.deleteAllChecked': 'Supprimer toutes les cochées',
  'category.deleteCategory': 'Supprimer la catégorie',
  'category.left': '{{count}} restant(s)',
  'category.nestingLimit':
    'Limite d’imbrication atteinte ! Le niveau d’imbrication maximal est {{level}}.',

  // --- En-tête de synchronisation ---
  'sync.localOnly': 'Local uniquement — connectez-vous pour synchroniser',
  'sync.connecting': 'Connexion…',
  'sync.syncing': 'Synchronisation…',
  'sync.synced': 'Synchronisé',
  'sync.offline': 'Hors ligne',
  'sync.reconnect': 'Reconnecter',
  'sync.failed': 'Échec de la synchronisation',
  'sync.connectTitle': 'Connecter pour synchroniser les données',
  'sync.retryTitle': 'Réessayer la synchronisation',
  'sync.logoutTitle': 'Se déconnecter',
  'sync.indexedDbUnavailable':
    'IndexedDB est indisponible. Les modifications ne durent que tant que cette page est ouverte.',

  // --- Codes d’erreur de synchronisation (issus de DriveSyncContext) ---
  'sync.error.unreachable':
    'Google Drive est inaccessible. Vos modifications sont enregistrées localement.',
  'sync.error.failed': 'Échec de la synchronisation avec Google Drive.',
  'sync.error.authFailed': 'Échec de l’autorisation Google.',
  'sync.error.changedRepeatedly':
    'Google Drive a changé plusieurs fois pendant la synchronisation. L’application a conservé les données locales et réessaiera.',
  'sync.error.driveDataCorrupt':
    'Le fichier de données Google Drive est invalide ou corrompu. Les données locales n’ont pas été remplacées.',
  'sync.error.reconnectRequired':
    'Reconnectez Google Drive et terminez la synchronisation finale avant de vous déconnecter.',
  'sync.error.unexpected': 'Une erreur inattendue s’est produite.',

  // --- Libellés des notifications ---
  'toast.success': 'Succès',
  'toast.error': 'Erreur',
  'toast.info': 'Info',
  'toast.dismiss': 'Fermer la notification',

  // --- Recherche ---
  'search.placeholder': 'Rechercher des tâches, catégories, listes…',
  'search.clear': 'Effacer la recherche',
  'search.close': 'Fermer la recherche',
  'search.search': 'Rechercher',
  'search.noResults': 'Aucun résultat pour « {{query}} »',
  'search.ariaLabel': 'Rechercher dans le document',

  // --- Fenêtre de déplacement ---
  'move.current': '(actuelle)',
  'move.noDestinations':
    'Aucune autre destination disponible dans ce document.',
  'move.makeMainCategory': 'En faire une catégorie principale (niveau supérieur)',
  'move.asMainCategory': 'Comme catégorie principale dans « {{list}} »',
  'move.tooDeepToFit': 'Trop profond pour cet emplacement (3 niveaux max)',
  'move.dest.topLevel': 'le niveau supérieur de « {{list}} »',
  'move.dest.fallbackList': 'la liste',
  'move.dest.fallbackCategory': 'cette catégorie',

  // --- Importation (flux de l’app + erreurs profondes d’importTextbookJson) ---
  'import.docNotReady': 'Le document n’est pas prêt.',
  'import.docChanged':
    'Votre document actif a changé pendant l’importation. Veuillez réessayer.',
  'import.couldNotImport': 'Impossible d’importer le JSON.',
  'import.successToast': '{{count}} tâches importées dans « {{list}} »{{skipped}}',
  'import.duplicatesSkipped': ' ({{count}} doublons ignorés)',
  'import.error.taskNeedsUrl': 'Chaque tâche importée doit avoir une URL.',
  'import.error.invalidUrl': 'URL de tâche invalide : {{url}}',
  'import.error.httpsOnly':
    'Les liens importés doivent être des URL HTTPS sans identifiants.',
  'import.error.categoryNeedsTitle': 'Chaque catégorie doit avoir un titre.',
  'import.error.emptyCategoryTitle':
    'Les titres de catégorie ne peuvent pas être vides.',
  'import.error.unsupportedFormat':
    'Format JSON non pris en charge. Format attendu : textbook-import-v1.',
  'import.error.missingCategories':
    'Le JSON d’importation doit contenir un tableau categories.',
  'import.error.nestingTooDeep':
    'L’imbrication des catégories ne peut pas dépasser {{level}} niveaux.',
  'import.error.invalidCategory': 'Objet catégorie invalide.',
  'import.error.invalidItemsIn':
    'Éléments ou sous-catégories invalides dans « {{title}} ».',
  'import.error.invalidTaskIn': 'Titre de tâche invalide dans « {{title}} ».',
  'import.error.noTasks': 'Aucune tâche trouvée dans ce JSON d’importation.',

  // --- Erreurs profondes de déplacement (moveUtils) ---
  'move.error.taskMustBeInCategory':
    'Une tâche ne peut être déplacée que dans une catégorie.',
  'move.error.taskNotFound': 'Tâche introuvable.',
  'move.error.alreadyInCategory': 'La tâche est déjà dans cette catégorie.',
  'move.error.targetListNotFound': 'Liste de destination introuvable.',
  'move.error.categoryNotFound': 'Catégorie introuvable.',
  'move.error.targetCategoryNotFound': 'Catégorie de destination introuvable.',
  'move.error.intoSelf':
    'Une catégorie ne peut pas être déplacée dans elle-même ou dans ses propres sous-catégories.',
  'move.error.tooDeep':
    'La destination est trop profonde pour la catégorie déplacée (3 niveaux max).',
  'move.error.notAllowed': 'Ce déplacement n’est pas autorisé.',

  // --- Sélecteur de langue ---
  'language.switch': 'Changer de langue',
  'language.current': 'Langue : {{language}}',
};

export type Dictionary = typeof en;
export type TranslationKey = keyof Dictionary;
export type TFunction = (key: TranslationKey, params?: TranslateParams) => string;

export const translations: Record<Language, Dictionary> = { en, fr };
export { en };
