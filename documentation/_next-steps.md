# Ideas of improvements

- [x] Add possibility to do 2-handed solo
- [x] Add possibility to save the score of a given game, and to keep track of the score history across games
- [ ] Add possibility to export the collection and score history as a JSON file, and to import it back to the app
- [x] Add stats on games played, win/loss ratio, most played cards, etc.
- [x] Add a "forced" mode where the user can select a card that must be included in the next setup, and the app will generate a setup that includes that card if possible
- [x] Toasts should be floating from the bottom of the screen, not taking space in the layout, and should stack if multiple toasts are triggered at the same time
- [ ] Investigate if using 3rd party CSS libs could improve visual and simplify code, while keeping the "no external dependencies at runtime" constraint (e.g. by inlining the CSS in a static file)
- [ ] Add a "dark mode" toggle to the UI, and persist the user's preference in browser storage
- [x] No need for a toast when re-using an already played card, as the card list already shows which cards have been used or not.
- [x] Toasts should dismiss automatically after a few seconds, and should also be dismissible by the user (e.g. by clicking on them) unless they are critical errors that require user attention (e.g. "no more cards available for the selected collection and player count")
- [x] Add an introductory tutorial or walkthrough for first-time users, explaining the main features and how to use the app effectively
- [x] Improve the welcome page, it looks too crowded and overwhelming, maybe by adding some spacing, grouping related information, and using a more visually appealing layout
- [x] Do not display developers information by default, it should be hidden behind a "About this project" link or button, to avoid overwhelming users who just want to use the app without being interested in the development details
- [x] Game history should be first in the History page
- [ ] Interface localisation (fr, es, de, it)
- [ ] Group games in history (by mastermind? player count? something else?)
