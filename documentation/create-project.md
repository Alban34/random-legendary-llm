# Role
You are a web software developer, architect and project manager, tasked with creating a single-page web application for the Legendary: Marvel card game. 
The application will allow users to view existing extensions, create their own collections, and start solo with randomized decks. 
The original brief asked for a single HTML file with embedded JavaScript and CSS. That implementation detail has since been superseded by an approved **static-served multi-file SPA** approach, while preserving the same browser-only runtime goals. The app must use browser storage to keep track of selected cards across games. The user interface should be visually appealing and user-friendly, providing clear instructions and feedback. Additionally, the project must be fully documented with detailed specifications for data structures, game rules, and UI design.

> **Implementation addendum (approved after Epic 1):**
> The project still targets a **single-page client app with no server-side code**, but the physical implementation is now allowed to use **multiple static files** (`index.html`, CSS, ES modules, JSON data) as long as it is served by a **static HTTP server** and keeps zero runtime backend dependencies.

# Purpose

I want to create a new project that needs to run in a single web page, without any server-side code. 
This project will allow the user to:
- see all existing extensions of the Legendary: Marvel card game
- create user own collection from those extensions
- start a solo game, randomizing the opponent, foes and the heroes decks from the user collection
- to pick the random cards, you will have to avoid selecting cards already selected in previous games, so you will have to keep track of the cards already selected in the browser storage

# Constraints
- **Superseded implementation detail:** the original brief asked for a single HTML file with embedded JavaScript and CSS. The approved implementation direction is now a **static-served multi-file SPA** with project-owned HTML, CSS, ES modules, and JSON assets.
- The project must not use any server-side code or external libraries.
- The project must use browser storage (localStorage or sessionStorage) to keep track of the cards already selected in previous games.
- The project must provide a user interface to view existing extensions, create a collection, and start games with randomized decks.
- The possible player count must be from 1 to 4 players, with the option to play the "advanced solo" mode.
- The project must include a way to reset the stored data to allow for fresh starts.
- The project must be visually appealing and user-friendly, with clear instructions and feedback for the user.
- The project must be fully documented, with detailed specifications for the data structure of the card collections, the game rules, and the user interface design.
- The project must be tested to ensure that it functions correctly and that the user interface is intuitive and responsive.
- The project must be designed to allow for future expansion, such as adding new extensions or game modes without requiring significant changes to the existing codebase.
- The project must be optimized for performance, ensuring that it runs smoothly even with large collections of cards and multiple players.
- The project must be compatible with modern web browsers and should degrade gracefully on older browsers, providing a functional experience even if some features are not available.
- The project must include error handling to manage potential issues such as invalid user input, storage limitations, or unexpected game states, providing informative feedback to the user when errors occur.
- The project must include a clear and concise README file that explains how to use the application, the rules of the game, and any other relevant information for users to get started quickly and easily.
- If you need clarifications, you will be able to ask for more details about the project requirements, constraints, or any other aspect that is not clear.
- You will have to architecture this project, defining the data structures, and the user interface design before starting to implement the code.
- You will validate with me the roadmap before starting to implement the code, and you will provide regular updates on the progress of the project, including any challenges or obstacles encountered and how they were addressed.
- Ask me whatever you may need to clarify the requirements, constraints, or any other aspect of the project before starting the implementation.
- You will prepare all the documentation for the project, including detailed specifications for the data structures and UI design, and put everything as separated markdown files in /documentation folder
- You must not start implementing anything until the architecture and roadmap are validated by me.
- Once you are good with your documentations, change the "Draft" status to "In Review".
- Once I review the documentation and validate it, I will change the status to "Approved" and you will be allowed to start implementing the code.

## Next steps
- Create the epics to achieve the different milestones of the project, and break them down into user stories and tasks.

## Helpful resources
The full cards list: https://boardgamegeek.com/wiki/page/Legendary_Marvel_Complete_Card_List
The full cards details: https://boardgamegeek.com/wiki/page/Legendary_Marvel_Complete_Card_Text
