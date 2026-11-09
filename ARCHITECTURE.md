textbook/
├── .github/
│ └── workflows/
│ └── deploy.yml
├── public/
│ ├── app-icon-192.png
│ ├── app-icon-512.png
│ ├── apple-touch-icon.png
│ └── favicon.png
├── docs/
│ └── ARCHITECTURE.md ← NEW
├── .clinerules
├── .env.example
├── .gitignore
├── CLINE.md
├── README.md
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
│
└── src/
├── main.tsx ← main.tsx
├── App.tsx ← App.tsx
│
├── api/
│ └── google/
│ ├── client/
│ │ ├── googleApi.client.ts ← api/googleApiService.ts
│ │ ├── googleApi.error.ts ← api/googleApiService.ts
│ │ └── googleApi.type.ts ← api/googleApiService.ts
│ └── drive/
│ ├── driveFiles.api.ts ← googleDriveSync.ts
│ ├── driveUser.api.ts ← googleDriveSync.ts
│ ├── driveFile.validation.ts ← googleDriveSync.ts
│ ├── drive.type.ts ← googleDriveSync.ts + types.ts
│ └── drive.data.ts ← googleDriveSync.ts
│
├── components/
│ ├── atoms/
│ │ ├── Icon/
│ │ │ ├── Icon.tsx ← components/Icon.tsx
│ │ │ └── Icon.type.ts ← components/Icon.tsx
│ │ ├── TodoCheckbox/
│ │ │ └── TodoCheckbox.tsx ← components/todo/TodoItem.tsx
│ │ ├── TodoStarButton/
│ │ │ └── TodoStarButton.tsx ← components/todo/TodoItem.tsx
│ │ └── SearchToggleButton/
│ │ └── SearchToggleButton.tsx ← search/SearchToggleButton.tsx
│ │
│ ├── molecules/
│ │ ├── EmptyState/
│ │ │ ├── EmptyState.tsx ← components/EmptyState.tsx
│ │ │ └── EmptyState.scss ← styles.scss
│ │ ├── Toast/
│ │ │ ├── Toast.tsx ← components/Toast.tsx
│ │ │ ├── Toast.type.ts ← components/Toast.tsx
│ │ │ └── Toast.scss ← styles.scss
│ │ ├── Modal/
│ │ │ ├── Modal.tsx ← components/Modal.tsx
│ │ │ ├── Modal.type.ts ← components/Modal.tsx
│ │ │ └── Modal.scss ← styles.scss
│ │ ├── TextPromptDialog/
│ │ │ ├── TextPromptDialog.tsx ← App.tsx + Category.tsx + useTextPrompt.tsx
│ │ │ └── TextPromptField.tsx ← hooks/useTextPrompt.tsx
│ │ ├── TodoTitleField/
│ │ │ └── TodoTitleField.tsx ← components/todo/TodoItem.tsx
│ │ ├── TodoDescriptionChip/
│ │ │ └── TodoDescriptionChip.tsx ← components/todo/TodoItem.tsx
│ │ ├── TodoDescriptionEditor/
│ │ │ └── TodoDescriptionEditor.tsx ← components/todo/TodoItem.tsx
│ │ ├── MarkdownPreviewDialog/
│ │ │ ├── MarkdownPreviewDialog.tsx ← components/todo/TodoItem.tsx
│ │ │ └── MarkdownPreviewDialog.scss ← styles.scss
│ │ ├── TodoActionsMenu/
│ │ │ └── TodoActionsMenu.tsx ← components/todo/TodoItem.tsx
│ │ ├── CategoryHeader/
│ │ │ └── CategoryHeader.tsx ← components/todo/Category.tsx
│ │ ├── CategoryActionsMenu/
│ │ │ └── CategoryActionsMenu.tsx ← components/todo/Category.tsx
│ │ ├── CategoryRemainingIndicator/
│ │ │ └── CategoryRemainingIndicator.tsx ← components/todo/Category.tsx
│ │ ├── ListTab/
│ │ │ └── ListTab.tsx ← App.tsx
│ │ ├── ListOptionsItem/
│ │ │ └── ListOptionsItem.tsx ← App.tsx
│ │ ├── SyncStatus/
│ │ │ └── SyncStatus.tsx ← components/SyncPanel.tsx
│ │ ├── SyncActions/
│ │ │ └── SyncActions.tsx ← components/SyncPanel.tsx
│ │ ├── SyncWarning/
│ │ │ └── SyncWarning.tsx ← components/SyncPanel.tsx
│ │ ├── SearchInput/
│ │ │ └── SearchInput.tsx ← search/SearchInput.tsx
│ │ ├── SearchBar/
│ │ │ ├── SearchBar.tsx ← search/SearchBar.tsx
│ │ │ └── SearchBar.scss ← styles.scss
│ │ ├── SearchResultItem/
│ │ │ ├── SearchResultItem.tsx ← search/SearchResultItem.tsx
│ │ │ └── SearchResultItem.scss ← styles.scss
│ │ └── JsonNode/
│ │ └── JsonNode.tsx ← components/JsonView.tsx
│ │
│ ├── cells/
│ │ ├── TodoItem/
│ │ │ ├── TodoItem.tsx ← components/todo/TodoItem.tsx
│ │ │ ├── TodoItem.type.ts ← components/types/todoItem.types.ts
│ │ │ ├── TodoItem.scss ← styles.scss
│ │ │ └── TodoItem.spec.tsx ← NEW
│ │ └── SearchResultsList/
│ │ └── SearchResultsList.tsx ← search/SearchResultsList.tsx
│ │
│ ├── organisms/
│ │ ├── CategoryCard/
│ │ │ ├── CategoryCard.tsx ← components/todo/Category.tsx
│ │ │ ├── CategoryCard.type.ts ← components/todo/Category.tsx
│ │ │ ├── CategoryCard.scss ← styles.scss
│ │ │ └── CategoryCard.spec.tsx ← NEW
│ │ ├── CategoryContent/
│ │ │ └── CategoryContent.tsx ← components/todo/Category.tsx
│ │ ├── ListTabs/
│ │ │ ├── ListTabs.tsx ← App.tsx
│ │ │ └── ListTabs.scss ← styles.scss
│ │ ├── ListOptionsMenu/
│ │ │ ├── ListOptionsMenu.tsx ← App.tsx
│ │ │ └── ListOptionsMenu.scss ← styles.scss
│ │ ├── ReorderList/
│ │ │ ├── ReorderList.tsx ← components/ReorderList.tsx
│ │ │ ├── ReorderList.type.ts ← components/ReorderList.tsx
│ │ │ └── ReorderList.scss ← styles.scss
│ │ ├── StarredList/
│ │ │ ├── StarredList.tsx ← components/StarredList.tsx
│ │ │ ├── StarredGroup.tsx ← components/StarredList.tsx
│ │ │ ├── StarredList.type.ts ← components/StarredList.tsx
│ │ │ └── StarredList.scss ← styles.scss
│ │ ├── SyncPanel/
│ │ │ ├── SyncPanel.tsx ← components/SyncPanel.tsx
│ │ │ ├── SyncPanel.type.ts ← components/SyncPanel.tsx
│ │ │ └── SyncPanel.scss ← styles.scss
│ │ ├── GlobalSearch/
│ │ │ ├── GlobalSearch.tsx ← search/GlobalSearch.tsx
│ │ │ ├── GlobalSearch.type.ts ← search/GlobalSearch.tsx
│ │ │ ├── GlobalSearch.scss ← styles.scss
│ │ │ └── GlobalSearch.spec.tsx ← NEW
│ │ └── JsonView/
│ │ ├── JsonView.tsx ← components/JsonView.tsx
│ │ └── JsonView.scss ← styles.scss
│ │
│ └── templates/
│ └── AppShell/
│ ├── AppShell.tsx ← App.tsx
│ └── AppShell.scss ← styles.scss
│
├── composables/
│ ├── useTextbook.ts ← App.tsx
│ ├── useListsView.ts ← App.tsx
│ ├── useStarredView.ts ← App.tsx + categoryUtils.ts
│ ├── useListNavigation.ts ← App.tsx
│ ├── useListActions.ts ← App.tsx
│ ├── useCategoryActions.ts ← App.tsx
│ ├── useTodoActions.ts ← App.tsx
│ ├── useListPrompts.ts ← App.tsx
│ ├── useCategoryPrompts.ts ← App.tsx
│ ├── useSearchNavigation.ts ← App.tsx
│ ├── useTabOptionsMenu.ts ← App.tsx
│ ├── useToast.ts ← App.tsx
│ ├── useConfirmDialog.ts ← App.tsx
│ ├── useCategoryFold.ts ← components/todo/Category.tsx
│ ├── useCategoryReveal.ts ← components/todo/Category.tsx
│ ├── useTodoEditor.ts ← components/todo/TodoItem.tsx
│ ├── useTodoDescription.ts ← components/todo/TodoItem.tsx
│ ├── useTodoClipboard.ts ← components/todo/TodoItem.tsx
│ ├── useTodoCompletionScroll.ts ← components/todo/TodoItem.tsx
│ ├── useDragReorder.ts ← components/ReorderList.tsx
│ ├── useSyncController.ts ← sync/DriveSyncContext.tsx
│ ├── useDriveConnection.ts ← sync/DriveSyncContext.tsx
│ ├── useRemoteDocumentSync.ts ← sync/DriveSyncContext.tsx
│ ├── useAutoSync.ts ← sync/DriveSyncContext.tsx
│ ├── useGlobalSearch.ts ← search/useGlobalSearch.ts
│ ├── useDropdownFlip.ts ← hooks/useDropdownFlip.ts
│ ├── useHorizontalSwipe.ts ← hooks/useHorizontalSwipe.ts
│ ├── useMediaQuery.ts ← hooks/useMediaQuery.ts
│ └── useTextPrompt.ts ← hooks/useTextPrompt.tsx
│
├── data/
│ ├── models/
│ │ ├── document.type.ts ← types.ts
│ │ ├── todo.type.ts ← types.ts
│ │ ├── category.type.ts ← types.ts
│ │ ├── list.type.ts ← types.ts
│ │ └── sync.type.ts ← types.ts
│ ├── app.data.ts ← types.ts
│ ├── storage.data.ts ← types.ts
│ ├── auth.data.ts ← auth/googleAuth.ts
│ ├── sync.data.ts ← sync/DriveSyncContext.tsx
│ ├── syncStatus.data.ts ← components/SyncPanel.tsx
│ ├── toast.data.ts ← components/Toast.tsx
│ ├── search.data.ts ← search/searchDocument.ts + SearchResultItem.tsx
│ ├── responsive.data.ts ← hooks/useMediaQuery.ts
│ └── titleConstraints.data.ts ← utils/categoryUtils.ts
│
├── plugins/
│ ├── google/
│ │ ├── googleAuth.plugin.ts ← auth/googleAuth.ts
│ │ └── googleAuth.type.ts ← auth/googleAuth.ts
│ └── storage/
│ ├── indexedDb.plugin.ts ← indexedDbStorage.ts
│ ├── indexedDb.documents.ts ← indexedDbStorage.ts
│ ├── indexedDb.queue.ts ← indexedDbStorage.ts
│ └── activeUserStorage.ts ← hooks/useDocument.ts
│
├── stores/
│ ├── document/
│ │ ├── document.store.ts ← hooks/useDocument.ts
│ │ ├── document.store.type.ts ← hooks/useDocument.ts
│ │ └── document.store.spec.ts ← NEW
│ └── sync/
│ ├── sync.store.tsx ← sync/DriveSyncContext.tsx
│ ├── sync.store.type.ts ← sync/DriveSyncContext.tsx
│ └── sync.store.spec.tsx ← NEW
│
├── utils/
│ ├── category/
│ │ ├── categoryTree.ts ← utils/categoryUtils.ts
│ │ ├── categoryMetrics.ts ← utils/categoryUtils.ts
│ │ ├── categorySort.ts ← utils/categoryUtils.ts
│ │ ├── categoryMigration.ts ← utils/categoryUtils.ts
│ │ └── categoryTitle.ts ← utils/categoryUtils.ts
│ ├── todo/
│ │ ├── todoMutations.ts ← utils/categoryUtils.ts
│ │ ├── todoStarred.ts ← utils/categoryUtils.ts
│ │ ├── todoLookup.ts ← App.tsx
│ │ └── todoLink.ts ← components/todo/TodoItem.tsx
│ ├── document/
│ │ ├── documentFactory.ts ← utils/documentUtils.ts
│ │ ├── documentValidation.ts ← utils/documentUtils.ts
│ │ ├── documentMigration.ts ← utils/documentUtils.ts
│ │ ├── documentSyncMetadata.ts ← utils/documentUtils.ts
│ │ ├── documentMerge.ts ← sync/documentMerge.ts
│ │ ├── documentMergeEntities.ts ← sync/documentMerge.ts
│ │ └── documentCompare.ts ← sync/documentMerge.ts
│ ├── search/
│ │ ├── searchDocument.ts ← search/searchDocument.ts
│ │ └── search.type.ts ← search/types.ts
│ └── uuid.ts ← utils/uuid.ts
│
├── views/
│ ├── TextbookView.tsx ← App.tsx
│ ├── ListsView.tsx ← App.tsx
│ └── StarredView.tsx ← App.tsx
│
├── styles/
│ ├── main.scss ← styles.scss + index.css
│ ├── \_tokens.scss ← index.css
│ ├── \_reset.scss ← index.css
│ ├── \_typography.scss ← index.css
│ ├── \_mixins.scss ← styles.scss
│ ├── \_buttons.scss ← styles.scss
│ ├── \_dropdowns.scss ← styles.scss
│ └── \_animations.scss ← styles.scss
│
└── test/
├── setup.ts ← NEW
├── renderWithApp.tsx ← NEW
├── App.mount.spec.tsx ← NEW
└── fixtures/
├── document.fixture.ts ← NEW
├── driveFile.fixture.ts ← NEW
└── syncConflict.fixture.ts ← NEW

Remove obsolete/unused files after verification:
src/App.css
src/sw.ts
src/components/index.ts
src/components/todo/index.ts
src/hooks/index.ts
src/search/index.ts
src/utils/index.ts
