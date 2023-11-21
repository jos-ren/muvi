CLIENT VS SERVER COMPS
- server-side components are responsible for generating the initial HTML on the server sidec
- client-side components are responsible for handling dynamic user interactions and updates in the user's browser.
- have two folders oine for client outside app, server comps inside app

CONTEXT
- for login, users

HOOKS 
for global hooks used everywhere in project
- can also use some inside individual components as well, not all need toi be in hooks folder
- examples:
    hooks/
        useAuthentication.js: Custom hook for managing user authentication.
        useAPI.js: Custom hook for making API requests.
        useLocalStorage.js: Custom hook for working with local storage.
        useFormValidation.js: Custom hook for form validation and handling form state.

VENDOR
- where yoiur external apis will be, keep functions related to tmdb here

Server Actions
- useserver

AUTH

API

