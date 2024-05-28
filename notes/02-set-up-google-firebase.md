# Step 2: Set up Google Firebase

[^ Notes](./00-notes.md)

## What is Firebase?

From <https://en.wikipedia.org/wiki/Firebase>

> _"Firebase is a set of backend cloud computing services and application_
> _development platforms provided by Google. It hosts databases, services,_
> _authentication, and integration for a variety of applications, including_
> _Android, iOS, JavaScript, Node.js, Java, Unity, PHP, and C++._

## Create a Google account

Visit <https://firebase.google.com/pricing> and under ‘Spark Plan’ click the
‘Start now’ button.

Note that:
- ‘App Hosting’ is _Not applicable_
- ‘Cloud Firestore’ has fairly generous free limits
- ‘Cloud Functions’ is _Not applicable_
- ‘Hosting’ has fairly generous free limits
- ‘Realtime Database’ is limited to one database per project, but is otherwise
  quite generous

Either ‘Sign in’, or click ‘Create account’. If ‘Create account’:

- `For my personal use`
- Enter your ‘First name’ and ‘Surname’
- Enter your ‘Birthday’ and ‘Gender’
- Choose or create an email address
- Enter recovery email and phone number
- For ‘Choose your settings’ select `Manual (4 steps)`
- Choose `Don’t save Web & App Activity in my account` and click ‘Next’
- Choose `Don’t save YouTube History in my account` and click ‘Next’
- Choose `Show me generic ads` and click ‘Next’
- Don’t tick the `Privacy reminders` checkbox, so just click ‘Next’
- Click ‘Confirm’ and then ‘I Agree’

## Create a Firebase project and register a new app

You should see ‘Welcome to Firebase!’. Click ‘Create a project’.

- Enter your project name: `generic-user-server`
- Tick ‘I accept...’ amd ‘I confirm...’, and click ‘Continue’
- Keep ‘Enable Google Analytics for this project’ enabled, and click ‘Continue’
- Analytics location: choose your current location
- Tick ‘Use the default settings...’ and ‘I accept...’, and click ‘Create project’

You should see "Preparing your project, please wait", "Provisioning resources…"
and "Finishing up…". And after about 20 seconds you should see "Your Firebase
project is ready". Click ‘Continue’ - yous should see the dashboard, and a popup
which confirms that Spark $0/month is your current plan.

- Under ‘Get started by adding Firebase to your app’, click the `</>` icon (Web)
- App nickname: `generic-user-server-app`
- Tick the ‘Also set up Firebase Hosting for this app’ checkbox
- Site ID: `g-u-s` (for g-u-s.web.app)
- Click ‘Register app’

## Install `firebase-tools` and initialise the repo on your local machine

- Create a file in the top level of the repo named ‘tryout-firebase.js’
- Paste the example code into it
- Click ‘Next’
- Run `npm install -g firebase-tools` as suggested... "added 621 packages in 3m"
- Click ‘Next’
- From the root of the repo, run `firebase login` (or `firebase logout` if
  already logged in as the wrong user)
- ? Allow Firebase to collect CLI...: `n`
- A web page should open with ‘Choose an account’ - just click the account
- At ‘Sign in to Firebase CLI’, click ‘Continue’
- ‘Firebase CLI wants to access your Google Account’, click ‘Allow’
- You should see ‘Woohoo! Firebase CLI Login Successful’ - close this window
- Back on the command line, you should see ‘✔  Success! Logged in as ...’
- Run `firebase init` and use the space key to select
  `Hosting: Configure files for Firebase Hosting and (optionally) set...`
- Hit the return key
- Select `Use an existing project` and hit return 
- Select `generic-user-server`, hit return, and wait for about 10 seconds
- ? What do you want to use as your public directory?: hit return for the
  default, `public`
- ? Configure as a single-page app (rewrite all urls to /index.html)?: `y`
- ? Set up automatic builds and deploys with GitHub? `y`
- A github.com ‘Authorize Firebase CLI’ page opens - click ‘Authorize firebase’
- Type in the Authentication code
- You should see ‘Woohoo! Firebase CLI GitHub Login Successful’ - close window
- Back on the command line, you should see ‘✔  Success! Logged into GitHub ...’
- ? For which GitHub repository ... workflow?: `<GH_USER>/generic-user-server`
- ? Set up the workflow to run a build script before every deploy?: `y`
- ? What script should be run before every deploy?: hit return for the
  default, `npm ci && npm run build`
- ? Set up automatic deployment to ... PR is merged?: `y`
- ? What is the name of the GitHub branch ... live channel?: hit return for the
  default, `main`
- The <https://github.com/settings/connections/applications/89cf50f02ac6aaed3484>
  URL links to a GitHub Permissions page... I __*didn't*__ click ‘Revoke access’
- In the command line your should see `✔  Firebase initialization complete!`

## Deploy the Firebase app for the first time

You should see five new files in the repo:

```
.github/workflows/firebase-hosting-merge.yml
.github/workflows/firebase-hosting-pull-request.yml
public/index.html
.firebaserc
firebase.json
```

In public/index.html, change the text "Firebase Hosting" to "GUS" in all 3
places (this will help confirm that deployment really is working).

In firebase.json, above `"public": "public",`, add `"site": "g-u-s",`.

```bash
git add .
git status
# ...
git commit -am 'Adds initial Firebase g-u-s app'
# [main 5b60d11] Adds initial Firebase g-u-s app
#  15 files changed, 1061 insertions(+), 1045 deletions(-)
#  create mode 100644 .firebaserc
#  create mode 100644 .github/workflows/firebase-hosting-merge.yml
#  create mode 100644 .github/workflows/firebase-hosting-pull-request.yml
#  create mode 100644 firebase.json
#  create mode 100644 notes/02-set-up-google-firebase.md
#  rename notes/{ => ABANDONED}/02-set-up-aws-dynamodb.md (98%)
#  create mode 100644 notes/TODO/03-set-up-cloud-firestore.md
#  create mode 100644 public/index.html
#  create mode 100644 tryout-firebase.js
git push
# Enumerating objects: 32, done.
# Counting objects: 100% (32/32), done.
# Delta compression using up to 4 threads
# Compressing objects: 100% (22/22), done.
# Writing objects: 100% (24/24), 20.17 KiB | 4.03 MiB/s, done.
# Total 24 (delta 6), reused 0 (delta 0), pack-reused 0
# remote: Resolving deltas: 100% (6/6), completed with 5 local objects.
# To https://github.com/<GH_USER>/generic-user-server.git
#  ! [remote rejected] main -> main (refusing to allow a Personal Access Token to create or update workflow `.github/workflows/firebase-hosting-merge.yml` without `workflow` scope)
# error: failed to push some refs to 'https://github.com/<GH_USER>/generic-user-server.git'
```

## Add the 'workflow' scope to your Mac's GitHub PAT

Based on:
1. <https://github.com/orgs/community/discussions/26254#discussioncomment-6101339>
2. <https://docs.github.com/en/enterprise-server@3.4/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens>
3. <https://gist.github.com/jonjack/bf295d4170edeb00e96fb158f9b1ba3c>

- In GitHub, click your profile photo, then click ‘Settings’
- In the left sidebar, click ‘Developer settings’ (the last item)
- In the left sidebar, click ‘Personal access tokens’ and the ‘Tokens (classic)’
- Click ‘Generate new token’ and ‘Generate new token (classic)’
- Note: `My MacBook PAT 24th May 2024 for 1 year with workflow`
- Expiration: one year in the future
- Tick ‘repo’ (its 6 sub-items will tick too)
- Tick ‘workflow’
- Click ‘Generate token’
- Copy-paste the new token into a secure encrypted password app, eg Buttercup
- Click ‘Delete’ next to the PAT token your were previously using for the MacBook
- Run `git credential-osxkeychain erase`
- `host=github.com` and hit return
- `protocol=https` and hit return __*twice*__

```bash
git push
# Username for 'https://github.com':
<GH_USER>
# Password for 'https://<GH_USER>@github.com':
<THE_NEW_PAT>
# Enumerating objects: 32, done.
# Counting objects: 100% (32/32), done.
# Delta compression using up to 4 threads
# Compressing objects: 100% (22/22), done.
# Writing objects: 100% (24/24), 20.17 KiB | 4.03 MiB/s, done.
# Total 24 (delta 6), reused 0 (delta 0), pack-reused 0
# remote: Resolving deltas: 100% (6/6), completed with 5 local objects.
# To https://github.com/<GH_USER>/generic-user-server.git
#    f013da1..5b60d11  main -> main
```

I got a "Deploy to Firebase Hosting on merge: All jobs have failed" message.
After clicking ‘View workflow run’, I saw `npm ERR! Missing script: "build"`.

I added `"build": "echo 'TODO build script'",` to the `"scripts"` object of
package.json. The next time I pushed
<https://github.com/GH_USER/generic-user-server/actions> showed success.

Visit <https://g-u-s.web.app/> - you should see ‘GUS Setup Complete’, which
shows that deployment worked.

Back at <https://console.firebase.google.com/>, click ‘Continue to console’.
