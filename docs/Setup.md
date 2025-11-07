## Project setup

This project can be set up either using local npm installation or using Docker.

For Docker-based setup, see [Docker Setup](Docker.md).

For traditional local setup, follow the instructions below:

### Get access to Ferdia's npm packages

1. Create a personal access token on gitHub, under [Settings](https://github.com/settings/) > Developer settings > [Personal access tokens](https://github.com/settings/tokens)
   - As a minimum, select the following scope `read:packages`
   - If you want to use the same token for publishing packages and deleting packages, then also select the scope `write:packages` and `delete:packages`

2. Create an `.npmrc` file at root level of the code base (already in `.gitignore`), with the following contents:

   ```
   //npm.pkg.github.com/:_authToken=<TOKEN>
   @busgroup:registry=https://npm.pkg.github.com/
   user=<your github user>
   email=<you email>
   ```
3. Optional:
   - Login : `npm login --registry=https://npm.pkg.github.com/ --scope=@busgroup`
   - You can also associate a scope with a registry using `npm config set @busgroup:registry https://npm.pkg.github.com/`


### Misc

#### Testing production build

From time to time it's useful to test the production build locally.
For a quick check, simply run the following (for more advanced use, see [official vue docs](https://cli.vuejs.org/guide/deployment.html#previewing-locally)).
```bash
# The build process defined in package.json
npm run build         
# If you haven't already installed "serve" do so now  
npm install -g serve    
# Serve it up - pick another port if you like
serve -s dist -l 8081   
```