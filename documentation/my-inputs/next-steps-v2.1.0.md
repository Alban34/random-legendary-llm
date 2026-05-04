# List of needs for v2.1.0

- [x] We should no longer have any mjs files, even for testing: please compile the ts file if needed for tests
- [x] "Active expansions" should be layouted the same way as the "Forced Picks" and should be moved below "Forced Picks"
- [x] There should no longer be any .js files
- [x] All unit tests should be associated to the file they test: you need to refactor everything to match this (e.g.: browse-utils.ts is tested by browse-utils.test.ts)
- [x] expanding "Forced picks" breaks the layout: please fix it
- [x] the dropdown does not look too nice: could you ask a UX expert agent how we could improve this?
- [x] in "collection/browse cards", could have a grouping fieldset around each categories, just like we have in game history
- [x] In "My collection", remove the "latest action" info and the notice about storage.
- [x] Add back the notice about storage only if there is an error that the user must be aware of
- [x] Add space below the buttons (everywhere that they are sticking the conext below)
- [x] Remove the useless "Selected mode" information in the setup engine preview pane
- [x] Remove the focus border when clicking on the games in the history tab
- [x] In "Show details" of the browse tab, there is no need to add a separator by cards: please keep only the category separator
- [x] In history, we lack the percentage of use per expansions: it would be very nice to have this too
- [x] e2e tests should be named by their feature, not their epic
- [x] package.json file should not contain that a dedicated script for each e2e test: it should test everything at once and give the possibility to start one specific test if needed
- [x] Browsing card "by category" should have all categories expended by default
- [x] Browsing card "by expansion" should have the same visual as the "by category", replacing a category name by an expansion name (e.g.: "Heroes" is displayed the same way as "Ant-Man" expansion)
- [x] In game history, the filter buttons (mastermind, scheme...) are cut off on top when hovering them (this is not the case for the "All", "Won"... filter).

