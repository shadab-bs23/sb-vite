# MOCK SERVICE WORKER

This document will provide information on how mock service worker has been implemented [MSW](https://mswjs.io/) in this
project and how to utilize it.

- [MSW](https://mswjs.io/) : has been used in this project as it has native typescript support [docs](https://mswjs.io/docs/).
  - Running it in browser
    - just type in the terminal `npm run serve -- --mock=true` or a bash script simple type `npm run serve:mock`, which will start vue app at mock mode. Therefore, only calling the mock api's that FE team has created.
  - Running unit test
    - in the terminal type `npm run test:unit` command, it will start running all the specs files in test folder and will use [MSW](https://mswjs.io/docs/) as a backend.

