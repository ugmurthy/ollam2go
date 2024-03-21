# Ollama2Go

`Ollama2Go` is a Single page application building using the REMIX-SPA framework.
Here is a [starter repo](https://github.com/ugmurthy/remix-spa) for building a SPA is

`Ollama2Go` uses a local LLM and is just for fun and is a basic chat application.
You can select any local Ollama supported models and chat.

# Installation

## 1. Install Ollama

[Instruction for installing Ollama](https://github.com/ollama/ollama/blob/main/README.md)

## 2. Install Ollam2Go for dev

2.1 Clone this repo
2.2 `npm install`
2.2 `npm run dev` and open the app in browse [Ollama2Go](http://localhost:5173)

## Production

When you are ready to build a production version of your app, `npm run build` will generate your assets and an `index.html` for the SPA.

```shellscript
npm run build
```

### Preview

You can preview the build locally with [vite preview](https://vitejs.dev/guide/cli#vite-preview) to serve all routes via the single `index.html` file:

```shellscript
npm run preview
```

> ![WARNING] `vite preview` is not designed for use as a production server

### Deployment

You can then serve your app from any HTTP server of your choosing. The server should be configured to serve multiple paths from a single root `/index.html` file (commonly called "SPA fallback"). Other steps may be required if the server doesn't directly support this functionality.

For a simple example, you could use [sirv-cli](https://www.npmjs.com/package/sirv-cli):

```shellscript
npx sirv-cli build/client/ --single
```

[remix-vite-docs]: https://remix.run/docs/en/main/future/vite
