# Release Checklist

**TODO**: This release checklist is a copy of the corresponding checklist for the `teq-frontend`. It will need to be adapted somewhat...

## Using release branches

See [general documentation](https://ferdia.atlassian.net/l/c/jFC11Er4) and [specifically for FE](https://ferdia.atlassian.net/wiki/spaces/TEQ/pages/92274697/CI+CD+pipeline+teq-frontend#The-FE-git-workflow)

## Checklist

- Run `npm run test:unit` to make sure that everything works, and assure that everything is
  properly tested in [test environment](https://bs23-test.teq.app/v4/).
- Update [CHANGELOG.md](../CHANGELOG.md), so that it reflects current status
- Create a release branch, e.g. `release/v.0.1.0`
- Open a pull request with the above change (to release/next and development), and get it approved
- Update your local `main` branch after the pull request is merged
- Prepare changelog ([example](https://github.com/js-temporal/temporal-polyfill/releases/tag/v0.2.0))
  - Make extract of repos' global [CHANGELOG.md](../CHANGELOG.md) and summarize the major changes
  - Look at the log (e.g. `git log -p v0.1.0..`)
  - Thank everyone who contributed to the release (e.g. `git shortlog v0.1.0..` to see the contributors)
- Create the new release on GitHub https://github.com/busgroup/teq-frontend/releases/new
  - Don't forget the `v` in the version tag, e.g. `v0.2.0`
  - Check the "This is a pre-release" box unless we've decided to release a production version
- Update repos' global [CHANGELOG.md](../CHANGELOG.md) with new reference to release
  (so everything until then under "Unreleased" will be under new relelease).
- Make sure that [Confluence page for this repo](https://ferdia.atlassian.net/wiki/spaces/TEQ/pages/111214624/teq-frontend)
  is up to date.
- Finally, update the [Confluence release section of our repo page](https://ferdia.atlassian.net/wiki/spaces/TEQ/pages/111214624/teq-frontend#Releases)
  with the new release.

---

## For reusable components

- Run `npm publish` for reusable components, or other setup (TBD)

## After release branch is created

- Determine next version number (0.1.0 → 0.2.0 for breaking changes, 0.1.0 → 0.1.1 for non-breaking changes)
- Increment the version number in `package.json`
- Open a pull request with the above change (to release/next and development), and get it approved
