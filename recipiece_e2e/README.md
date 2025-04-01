# Recipiece E2E
This directory contains end to end tests for Recipiece.
To run the tests here, you will need to serve Recipiece using

```
yarn serve:test
```

in the root of the repository.
Then you can run `yarn test` to run all playwright tests.

## Unit Tests
The `unit` folder under `tests` contains the "unit" tests for single pages.
These tests just test the behaviors possible on a single page.

## Story Tests
The `story` folder under `tests` contains the "user story" tests, which
test common user flows that users will go through.
These tests may encompass moving around multiple pages and performing lots of actions.