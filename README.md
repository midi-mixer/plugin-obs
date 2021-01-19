# MIDI Mixer Template Plugin

Use this template to quickly create a plugin for MIDI Mixer. It uses [TypeScript](https://www.typescriptlang.org/), [Parcel](https://parceljs.org/), and [jpwilliams/midi-mixer-plugin](https://github.com/jpwilliams/midi-mixer-plugin) to provide an easy API and development environment with hot-loading built in!

## Usage

- Create a repository using this as a template
- Clone your repository in to `%appdata%/midi-mixer-app/plugins`

``` bash
# start dev environment
npm run dev

# production build
npm build
```

To ensure that the created plugin is easy to use for other users, make sure to commit your `dist` folder with any changes so that it can be downloaded and placed directly in to the `plugins` folder with no build step for the user.

## API

See [jpwilliams/midi-mixer-plugin](https://github.com/jpwilliams/midi-mixer-plugin) for API documentation.
