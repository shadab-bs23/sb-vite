## To manage and switch between different Node.js versions, follow these steps:

### Install and Use Node Version Manager (nvm)

1. **Install nvm**:

   - Visit the [nvm GitHub repository](https://github.com/nvm-sh/nvm) and follow the installation instructions for your operating system.

2. **Switch to the Desired Node.js Version**:
   - Once `nvm` is installed, you can switch to a specific Node.js version using the following command according to project setting which is defined in .nvmrc :
     ```bash
     nvm use
     ```
     **Note:** Ensure the required Node.js version is installed using `nvm install <version>` if it is not already available.