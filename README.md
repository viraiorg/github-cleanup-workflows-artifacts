# Cleanup Repos workflows

>This util is for delete all artifacts created inside the actions workflow.
>This is NOT going to delete your npm packages or docker images.

**INFO:**

- https://docs.github.com/en/billing/managing-billing-for-github-packages/viewing-your-github-packages-usage
- https://github.com/actions/upload-artifact/issues/161
- https://docs.github.com/en/rest/actions/artifacts?apiVersion=2022-11-28#delete-an-artifact
- https://docs.github.com/en/rest/actions/artifacts?apiVersion=2022-11-28#list-artifacts-for-a-repository


### 1. Generate token with necessary permissions
    - Go to your user and choose settings
    - Click Personal Access tokens
    - Create a token and asign permissions

    > https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens

### 2. Replace your token and org name in the script file "cleanup-artifacts.js"

### 3. Install 
```bash
npm install
```

### 4. Execute script
```bash
node cleanup-artifacts.js
```
