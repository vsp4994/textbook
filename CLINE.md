# AI Coding Agent Instructions & Pre-Generation Checklist
Must review and verify these rules before generating, modifying, refactoring, or reviewing code for this codebase.

---

## 1. Core Operating Principles & Rule Priority (Rules 1–12)
1. Optimize code in strict priority order: 1. Correctness, 2. Security, 3. Type safety, 4. Architecture consistency, 5. Readability, 6. Maintainability, 7. Simplicity, 8. Reusability, 9. Testability, 10. Accessibility, 11. Performance, 12. DX.
2. Never sacrifice correctness or readability to reduce line count.
3. Never introduce complexity solely for theoretical architectural purity.
4. Always prefer clear code that another developer can understand six months later.
5. Never consider code complete merely because it compiles or passes linting.
6. Verify behavior, error paths, type safety, security, and edge cases before returning generated code.
7. Treat existing project conventions as authoritative over external or common patterns.
8. Distinguish strict correctness/security defects from personal stylistic preferences.
9. Do not blindly follow user requests if they contain architectural violations, bugs, or security risks.
10. When a requested approach is unsafe, explain the concern briefly and implement the safer solution.
11. Optimize code to be correct, secure, predictable, and maintainable—never to be clever or fashionable.
12. Ensure all implementations strictly satisfy the functional goal without adding speculative fluff.

---

## 2. AI Agent Pre-Generation Procedure (Rules 13–22)
13. Inspect related files and directory structures before introducing any new pattern.
14. Search for existing helper functions, constants, types, components, and hooks before creating new ones.
15. Inspect and match existing naming conventions, file paths, and linting rules.
16. Follow the 7-step procedure: 1. Understand, 2. Search, 3. Design, 4. Implement, 5. Self-review, 6. Validate, 7. Diff review.
17. Identify data flow and architectural boundaries before writing code.
18. Choose the smallest, simplest solution that fits into the existing codebase architecture.
19. Re-read the full diff silently before returning code to catch accidental edits.
20. Confirm whether a duplicate value represents the same domain responsibility before merging code.
21. Verify whether inherited configs, parser options, or scope boundaries are impacted before altering files.
22. Silently perform a 24-question self-review prior to finalizing output.

---

## 3. Minimal Change Policy (Rules 23–32)
23. Make the smallest change necessary to solve the requested task.
24. Do not refactor unrelated files or modules.
25. Do not rename unrelated variables or parameters.
26. Do not reformat unrelated code blocks or change code formatting styles.
27. Do not reorganize directories or file structures without explicit necessity.
28. Do not modify public APIs or component contracts unless explicitly required.
29. Do not introduce new abstractions unless they directly solve an existing, concrete problem.
30. Preserve existing working behavior unless a behavior change is explicitly requested.
31. Never allow a simple bug fix to secretly turn into an architecture rewrite.
32. Leave unrelated code untouched to keep Git diffs minimal and reviewable.

---

## 4. Correctness & Edge-Case Verification (Rules 33–44)
33. Test and verify success paths, failure paths, and empty states.
34. Explicitly handle `null`, `undefined`, empty strings (`""`), empty arrays (`[]`), and empty objects (`{}`).
35. Verify behavior against malformed API responses, unexpected payloads, and missing optional fields.
36. Check for inverted boolean conditions and logical operator errors (`&&` vs `||`).
37. Ensure all execution branches have explicit, correct return statements.
38. Verify that all asynchronous calls with promises are properly awaited or handled.
39. Eliminate unreachable code and accidental fall-through in control flow.
40. Prevent state mutation and unintended side effects inside pure logic.
41. Handle invalid route parameters, invalid form inputs, and permission failures gracefully.
42. Guard against race conditions, duplicate user actions, and stale state updates.
43. Always clear loading states in a `finally` block regardless of operation success or failure.
44. Differentiate between empty responses (valid, no data) and actual request failures (errors).

---

## 5. Function Style & Control Flow (Rules 45–54)
45. Prefer arrow functions assigned to `const` (`const getUser = () => {}`) over `function` declarations.
46. Avoid class-based application logic unless strictly required by an external framework.
47. Use guard clauses and early returns to eliminate deep nested logic.
48. Avoid `else` blocks after an early `return` statement.
49. Extract complex, multi-variable boolean conditions into descriptive named variables (`const canSubmit = ...`).
50. Keep control flow linear and easy to scan from top to bottom.
51. Replace long, complex `switch` statements with typed object lookup maps when clearer.
52. Avoid boolean parameters whose meaning is unclear at call sites (`doSomething(true, false)`).
53. Avoid side effects inside array transformation callbacks (`map`, `filter`, `reduce`).
54. Keep functions small and focused (investigate functions over 30–50 lines).

---

## 6. TypeScript Strictness & Type Safety (Rules 55–69)
55. Never use `any` in production code, mocks, adapters, hooks, stores, or utility functions.
56. Use `unknown` for unvalidated external data, then validate, normalize, and map to strongly-typed models.
57. Avoid type assertions (`as Type`) to force TypeScript to accept unvalidated data.
58. Use narrow type assertions only when TypeScript cannot infer guaranteed facts and no safer alternative exists.
59. Never use double casts (`as unknown as TargetType`) to bypass compiler type errors.
60. Avoid generic utility types like `Record<string, any>`; define domain-specific interfaces.
61. Use discriminated union types for restricted string/state sets (`type Status = "idle" | "loading" | "success" | "error"`).
62. Search for existing domain types before creating duplicate or slightly different interface variants.
63. Keep component-specific type definitions inside or adjacent to the component file.
64. Use nullish coalescing (`??`) when falling back for `null`/`undefined`; do not use `||` if `0`, `false`, or `""` are valid.
65. Use optional chaining (`?.`) safely for nested optional properties.
66. Avoid non-null assertions (`!`); use explicit runtime validation checks instead.
67. Use immutable updates (`[...array].sort()` or `toSorted()`) instead of mutating original arrays/objects.
68. Make impossible application states unrepresentable using discriminated union state types.
69. Ensure all exported functions, parameters, and return types are strictly typed.

---

## 7. Naming Conventions (Rules 70–79)
70. Use intent-descriptive names (`isLoading`, `hasPermission`, `canSubmit`, `selectedUser`).
71. Never use vague variable names like `data1`, `temp`, `obj`, `flag`, `val`, `doIt`, or `process`.
72. Name boolean variables using prefixes: `is`, `has`, `can`, `should`, `was`, or `did`.
73. Name collection variables using plural nouns (`users`, `items`, `orders`).
74. Name single domain objects using singular nouns (`user`, `item`, `order`).
75. Name functions with clear action verbs (`fetchUsers`, `updateUser`, `validateEmail`, `handleSubmit`).
76. Name custom React hooks starting with `use` (`useUser`, `useSearch`).
77. Use semantic SCSS class names (`.user-card`, `.user-card__header`) instead of visual/structural names (`.red-box`).
78. Replace unexplained magic numbers and magic strings with named domain constants.
79. Keep constant names uppercase for static values (`REQUEST_TIMEOUT_MS`) and group them by domain.

---

## 8. DRY, KISS, YAGNI & Abstraction Rules (Rules 80–89)
80. Actively detect duplication in logic, conditions, constants, types, and styling.
81. Confirm duplicated code shares the exact same domain responsibility before extracting helpers.
82. Do not merge separate code blocks merely because they share identical values if their lifecycles or scopes differ.
83. Keep abstractions simple; do not create generic helpers with only a single caller.
84. Avoid premature factories, dependency injection, or wrappers around native browser APIs.
85. Do not build speculative features, generic types, or extension points for hypothetical future needs (YAGNI).
86. Build what is required now while keeping the software structure clean for future extension.
87. Follow the Single Responsibility Principle: one primary purpose per function, component, or store.
88. Three lines of similar code do not automatically require a helper function.
89. Never extract code solely to satisfy DRY if doing so reduces clarity or increases coupling.

---

## 9. Architecture & Layer Responsibilities (Rules 90–104)
90. Respect clear architectural boundaries: `API -> Adapter -> Mapper -> Store/Hook -> Component -> View`.
91. Keep infrastructure concerns (HTTP method, URL, headers, status codes) strictly inside the API layer.
92. Prevent UI labels, formatting, toasts, or DOM logic from leaking into the API layer.
93. Use Adapters exclusively to normalize backend/external structures into internal domain models.
94. Keep Mappers pure: format data, attach UI labels/icons, and sort collections without side effects.
95. Never allow Mappers to trigger API calls, navigate, update stores, or display toasts.
96. Stores own application/shared state, persistence, caching, and business orchestration.
97. Prevent Stores from generating HTML/JSX templates or becoming unstructured data dumps.
98. Hooks represent reusable stateful logic and must expose explicit, meaningful return objects.
99. Components handle rendering, props, UI events, local UI state, and composition.
100. Prevent Components from performing raw backend normalization or heavy sorting/filtering in render loops.
101. Page views coordinate routing, page hooks, stores, and layout composition.
102. Follow Atomic Design levels (Atoms, Molecules, Organisms) by responsibility, not component size.
103. Do not create random utility folders (`common/`, `helpers/`) without clear, distinct responsibilities.
104. Keep public module surfaces as small as practical; do not export internal values "just in case".

---

## 10. Async, Promises & Side-Effect Management (Rules 105–116)
105. Explicitly handle both success and failure outcomes for every asynchronous operation.
106. Always set loading state to `true` before initiating an async call and `false` in `finally`.
107. Always `await` promises or explicitly return them; use `void asyncFunc()` only when floating promises are intentional.
108. Never create `new Promise(async ...)` executor functions.
109. Prevent duplicate execution and race conditions on rapid inputs or route changes using `AbortController` or guards.
110. Keep side effects (API calls, storage writes, DOM edits, timers) explicit and isolated.
111. Never hide side effects inside innocent-looking mapper or utility functions.
112. Store timer IDs and clear them (`clearTimeout`, `clearInterval`) on component unmount.
113. Remove manual DOM event listeners (`removeEventListener`) during cleanup cycles.
114. Validate required request parameters at API boundaries before initiating network requests.
115. Return consistent action semantics (e.g., `Promise<boolean>` where `true` = success, `false` = failure).
116. Centralize error normalization (`normalizeHttpError`) rather than repeating parsing logic.

---

## 11. State Management & Data Flow (Rules 117–126)
117. Ensure every piece of state has a single authoritative owner (component, context, or store).
118. Derive values dynamically during render rather than storing synchronized duplicate state (`fullName = ...`).
119. Keep state as local as practical; elevate to context or store only when shared by multiple consumers.
120. Avoid large, unstructured contexts that trigger unnecessary re-renders across unrelated consumers.
121. Use IndexedDB as the primary local database for full application state persistence in PWA projects.
122. Keep IndexedDB schema versions separate from application document versions.
123. Validate and migrate stored local data and incoming remote JSON before applying to active application state.
124. Maintain offline-first data flow: persist mutations to IndexedDB first, then attempt remote sync.
125. Safely handle storage failures (incognito mode, quota exceeded) with temporary in-memory fallbacks.
126. Wrap `JSON.parse()` calls on local storage in `try/catch` blocks to prevent runtime crashes.

---

## 12. React Modern Best Practices (Rules 127–141)
127. Write modern functional React components; avoid class components and `this`.
128. Follow the Rules of Hooks: call hooks at the top level, never inside loops, conditions, or nested functions.
129. Do not use `useEffect` for state calculations that can be derived during render.
130. Use `useEffect` strictly for external synchronization (subscriptions, browser APIs, lifecycle sync).
131. Never suppress `useEffect` dependency warnings without understanding the underlying cause.
132. Do not automatically wrap calculations in `useMemo` unless profiling shows expensive operations or referential stability is required.
133. Do not wrap every callback in `useCallback` prematurely.
134. Always supply a stable, unique item identifier (`key={item.id}`) for list iterations in JSX.
135. Never use array index as a React key when items can be reordered, inserted, or deleted.
136. Keep JSX clean: extract complex inline calculations, nested ternaries, and render transformations.
137. Define explicit prop types; never use `React.FC<any>` or generic unconstrained props.
138. Never mutate React props or state objects directly.
139. Use React `refs` for DOM focus management, measurements, and imperative API integration.
140. Use Error Boundaries at key application boundaries to gracefully recover from rendering crashes.
141. Ensure dropdown menus and modals close on Escape key press, outside clicks, and item selection.

---

## 13. Security, Authentication & Secret Protection (Rules 142–151)
142. Never hardcode passwords, API secrets, private keys, or privileged tokens in frontend source code.
143. Assume all code, assets, and bundle files shipped to the browser are public and inspectable.
144. Store OAuth access tokens in memory; never persist tokens to IndexedDB, localStorage, or JSON files.
145. Request the narrowest practical scope for OAuth (e.g., `drive.appdata` scope for Google Drive sync).
146. Use frontend-only Google OAuth 2.0 Web Client IDs; never require or expose a Client Secret.
147. Perform sanitization on untrusted HTML strings; avoid `dangerouslySetInnerHTML` whenever possible.
148. Validate and sanitize external URLs; prevent `javascript:` scheme execution and double-encoding bugs.
149. Never log sensitive data (tokens, passwords, PII, authorization headers) to browser consoles.
150. Remember that frontend permission checks improve UX but backend authorization enforces security.
151. Do not commit `.env` files or secret configurations into Git repositories.

---

## 14. Styling & SCSS Rules (Rules 152–161)
152. Use SCSS for application styling; avoid CSS-in-JS, Tailwind, or utility CSS libraries when prohibited.
153. Organize styles into modular files (`_variables.scss`, `_mixins.scss`, `_base.scss`, `_layout.scss`, `_components.scss`).
154. Use SCSS variables for colors, spacing, typography, borders, shadows, breakpoints, and z-indexes.
155. Keep CSS selector specificity low and avoid deep SCSS nesting.
156. Use SCSS mixins for repeated patterns like focus states, buttons, and responsive breakpoints.
157. Include clear visible focus indicators using `:focus-visible` for keyboard navigation.
158. Use CSS/SCSS indentation, spacing, and typography to make nested hierarchies visually distinct.
159. Use SCSS pseudo-elements or native Unicode symbols for fold/unfold arrows and menu icons (no icon libraries).
160. Provide explicit hover, active, focus, and disabled styling states for all interactive controls.
161. Respect user accessibility preferences with `@media (prefers-reduced-motion)`.

---

## 15. Accessibility (a11y) & UX States (Rules 162–171)
162. Use semantic HTML elements (`<button>`, `<nav>`, `<main>`, `<header>`, `<article>`, `<label>`, `<input>`).
163. Use `<button>` for user actions and `<a>` for navigation links; do not use `<div>` for clickable elements.
164. Ensure all interactive controls are fully navigable using keyboard alone (Tab, Enter, Space, Escape, Arrows).
165. Never remove visible focus outlines without supplying an accessible alternative.
166. Maintain sufficient color contrast and never rely solely on color to communicate state.
167. Provide explicit ARIA labels (`aria-label`, `aria-expanded`, `aria-hidden`) for icons and collapsible headers.
168. Support all essential UI states: Initial, Loading, Success, Empty, Error, Refreshing, Disabled, and Unauthorized.
169. Display actionable error messages instead of raw error stack traces or technical codes.
170. Use toasts for transient feedback only; do not use toasts for critical data users must retain.
171. Use visual skeletons or inline loaders to prevent layout shifts during async data loading.

---

## 16. Performance & Resource Management (Rules 172–181)
172. Profile code before applying memoization, caching, or complex optimization techniques.
173. Prevent unnecessary renders, duplicate API calls, and repeated heavy array transformations in render paths.
174. Clean up subscriptions, event listeners, timers, sockets, and observer instances in component unmount phases.
175. Avoid virtualizing or chunking small lists; consider virtualization only for massive datasets.
176. Use code-splitting (`React.lazy`, dynamic `import()`) for major route boundaries when bundle size dictates.
177. Optimize asset sizes, formats, and dimensions; provide proper `alt` text for images.
178. Prevent memory leaks by avoiding hidden timers or uncleaned listeners inside reusable helpers.
179. Use stable cache keys based on domain IDs, never array indices or UI labels.
180. Define explicit TTL, invalidation, and ownership strategies for cached data.
181. Ensure manual data refresh operations bypass invalid or stale cache entries.

---

## 17. Linting, Formatting & Code Hygiene (Rules 182–190)
182. Run and pass code formatting, ESLint rules, and TypeScript type-checks before finalizing code.
183. Fix underlying code issues instead of placing global or blanket `// eslint-disable` comments.
184. When disabling a lint rule locally, keep the scope minimal and state the exact reason in a comment.
185. Remove unused imports, variables, unused default imports, and dead code before committing.
186. Avoid barrel files (`index.ts`) that hide dependencies or introduce circular import chains.
187. Prevent circular dependencies (`store -> helper -> store`, `component -> mapper -> component`).
188. Follow consistent import ordering: external libraries first, internal modules second, styles last.
189. Group constants by domain responsibility instead of maintaining one giant unstructured file.
190. Never edit lockfiles (`package-lock.json`) manually; use package managers.

---

## 18. Documentation, Comments & Git Hygiene (Rules 191–196)
191. Document *why* non-obvious code exists (business constraints, workaround reasons), not *what* code does.
192. Keep comments accurate; update or remove obsolete comments when altering adjacent code.
193. Avoid vague `// TODO` comments; include context and tracking tags (`// TODO(PROJ-123): ...`).
194. Do not add JSDoc comments to obvious functions where TypeScript types provide sufficient context.
195. Keep Git commits focused on a single coherent change; do not mix refactoring, formatting, and features.
196. Review `git diff` to ensure no temporary mock data, debug console statements, or secret files are committed.

---

## 19. AI Pre-Response Self-Review Checklist (Rules 197–200)
197. **Verification**: Silently ask: Is the code correct? Is it secure? Are types strict without `any` or forced `as` assertions? Are edge cases handled?
198. **Architecture**: Is business logic strictly separated from presentation components? Are layer boundaries respected?
199. **Async & Failure**: Are loading states cleared in `finally` blocks? Are promises handled cleanly without race conditions?
200. **Final Gate**: Would this implementation pass a rigorous senior developer code review? If any check fails, correct the issue before returning the final response.
