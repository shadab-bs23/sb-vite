# Maintainance

## Routines

At regular intervalts...

1. ...check for package updates: Run `vue ui` and then check the [Dependencies](http://localhost:8000/dependencies) tab. You can also run the [`npm-outdated`](https://docs.npmjs.com/cli/v7/commands/npm-outdated) command. Note that not all packages can / should be updated because of compatability issues (should be documented here).
2. ...assure that only relevant code is included in build:
   - Run `vue ui` and trigger production build ("Tasks" tab), then hit the "Analyzer" and analyze...
   - Run `npm run serve:prod` and / or `npm run build:prod -- --local`, then check output from Webpack Bundle Analyzer (should be automatically served from http://127.0.0.1:8888 and / or http://127.0.0.1:8888 after build - depending on whether or not we're building in [modern mode](https://cli.vuejs.org/guide/browser-compatibility.html#modern-mode)).

## Inpection and debugging

- You can use [vue-cli-service inspect](https://cli.vuejs.org/guide/cli-service.html#vue-cli-service-inspect) (run `npx vue-cli-service inspect` or `vue inspect`) to [inspect the webpack config](https://cli.vuejs.org/guide/webpack.html#inspecting-the-project-s-webpack-config).
