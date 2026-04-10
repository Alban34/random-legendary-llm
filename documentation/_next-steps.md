# Ideas of improvements

- [ ] Add possibility to do 2-handed solo
- [ ] Add possibility to save the score of a given game, and to keep track of the score history across games
- [ ] Add possibility to export the collection and score history as a JSON file, and to import it back to the app
- [ ] Add stats on games played, win/loss ratio, most played cards, etc.
- [ ] Add a "forced" mode where the user can select a card that must be included in the next setup, and the app will generate a setup that includes that card if possible
- [x] Toasts should be floating from the bottom of the screen, not taking space in the layout, and should stack if multiple toasts are triggered at the same time
- [ ] Investigate if using 3rd party CSS libs could improve visual and simplify code, while keeping the "no external dependencies at runtime" constraint (e.g. by inlining the CSS in a static file)
- [ ] Add a "dark mode" toggle to the UI, and persist the user's preference in browser storage
- [ ] No need for a toast when re-using an already played card, as the card list already shows which cards have been used or not.
- [ ] Toasts should dismiss automatically after a few seconds, and should also be dismissible by the user (e.g. by clicking on them) unless they are critical errors that require user attention (e.g. "no more cards available for the selected collection and player count")
