# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## THIS PROJECT HAS BEEN UPDATED
Jamming up here is working with Vite 22, use of ngrok and authorization code with PKCE (inside of Spotify.js). Far more modern in easy to upgrate to newer version in the future as this has been done by me, MrCots in early November 2025.
To make this codeacademy updated template work you will need to add your spotify ID and redirect address that ngrok provides you once you make it work (yes, you will have to create an account, install it, etc but that's easy) and insert both you ID and this address into the.env file in order to make it work and in vite.config.js.
Hope you fin these quick instructions easy and for any further enquire do not hesitate to contact me via GitHub.