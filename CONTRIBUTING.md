# Contributing to Recipiece
Recipiece is (mostly) open source and welcomes contributions and bugfixes as appropriate.

# Branches, Versioning, and Releases
Recipiece uses semi-semantic versioning.
The latest release candidate branch will be named after the version that will deploy.
<!-- VERSION:UPDATE -->
The current release candidate branch is `stand_mixer`.

# Environment
Recipiece uses `dotenvx` to manage environment setup on the backend.
Before serving anything, you should create a `.env.dev` file that matches the environment variables specified in `.env.prod`. 
You will need to change the values, as the production environment is not decrypt-able without the magical keys.

The easiest way to run Recipiece locally is to just start up the `docker-compose.dev.yaml` in the repository root.
Shell into the backend container and run `yarn prisma-dev` and `yarn seed`.
You should be able to login as `dev@recpiece.org` with the password `password`.

Recipiece is built primarily in TypeScript, with a little Python sprinkled on top.
Recipiece needs a running Redis database and a Postgres database to work properly.

# Enhancements
If you have an idea or wish to propose some sort of functionality, you may submit a ticket and tag it with the `enhancement` tag.
Please verify that an enhancement issue doesn't already exist.

After discussion and approval by Recipiece's code owners, you may also implement the enhancement if you feel so inclined.
To implement an enhancement, make a branch off of the release candidate branch with the format `<author>/<issue_number>/<brief_description>`.
Implement your changes and make a pull request against the release candidate branch.

After approval and validation, your enhancement will be merged and the branch deleted.

# Bug Fixes
If you've noticed a bug and would like to bring it to attention, open an issue for it and tag the issue with the `bug` tag.
Please verify that a bug issue does not already exist.

If you would like to fix the bug, even better!

Fixes affecting an **in-production** version are made off the corresponding branch, and the version string is updated with an increment to the version number.
When fixes are deployed, the fix branch is merged into its corresponding release branch, and then the release branch is merged back into `main`, and the fix branch is deleted.

For example, the first version of Recipiece was called `cast_iron_skillet`, and the second version was called `stand_mixer`.
During the development on the `stand_mixer` version, a bug was discovered that affected the in-production `cast_iron_skillet` release.
A fix branch was opened off of the `cast_iron_skillet` branch called `<author>/<issue_number>/<description_of_issue>`.
On this branch, the author fixed the bug and bumped the version string from `cast_iron_skillet.0` to `cast_iron_skillet.1`. 
The bug was fixed, the fix branch was merged back into `cast_iron_skillet`, and `cast_iron_skillet` back into `main`.
Recipiece was deployed off of `main`.

Fixes affecting a non-deployed branch follow the same pattern and process as an enhancement.

## Mostly open source? How can you be _mostly_ open source?
The production instance of Recipiece is hosted at [https://recipiece.org](https://recipiece.org), and the api is hosted at [https://api.recipiece.org](https://api.recipiece.org).
While the code that powers the API and frontends is all open source, the gritty infrastructure details are hidden away.
If your fix/feature needs extra infrastructure, or you need clarification on an infrastructure related question, please ask in your issue.