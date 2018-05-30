# Bloody Health Cycle Tracker

A menstrual cycle tracking app that's open-source and leaves your data on your phone. Use it to track your menstrual cycle or for fertility awareness!

## Development setup

1. Start a virtual device in Android Studio (or make sure it's already running, you should see a phone on your screen)

2. Clone this repository:

    ```
    git clone git@gitlab.com:bloodyhealth/drip.git
    cd drip
    ```

4. Run `npm install`
5. Run `npm start`
6. In another terminal tab or window, run `npm run android`
7. In yet another tab, run `npm run log` to see logging output
8. Run `adb shell input keyevent 82` and select enable hot reloading (see https://facebook.github.io/react-native/docs/debugging.html)
9. We recommend installing an [ESLint plugin in your editor](https://eslint.org/docs/user-guide/integrations#editors). There's an `.eslintrc` file in this project which will be used by the plugin to check your code for style errors and potential bugs.

## Tests
You can run the tests with `npm test`.