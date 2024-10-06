# Acheron
An auth system built for use with cloudflare workers and pages functions that
does all of the annoying logic and validation for various authentication
methods.

## Installation
```bash
pnpm add @axel669/acheron
```

### Installing the Worker
In order to use the auth functions provided in the library, there needs to be a
cloudflare worker deployed to the same account that will be bound to the calling
code. The library ships with a copy of the worker (minus installed packages),
but the worker can also be pulled from the repo and deployed.

> The worker can also be run locally to test things without deploying to CF

Steps:
- Install the worker dependencies
    > The worker has a package.json file that is ready to go for this
- Check the wrangler configuration
    > The worker wrangler.toml has a config that is ready to be deployed, but
    > any of the settings can be changed if needed, just be sure to note what
    > changes are made when binding to it
- Deploy the worker using wrangler

## Usage
The acheron worker is not made to be called directly, instead use one of the
library functions for the corresponding auth type, as the auth functions have
additional logic to handle being inside an application. The auth functions
should be used as middleware (run before route code) to ensure that auth is
handled before route code needs to use its results. To see specifics on how to
use the auth functions, check out the examples folder in the repo.

### Env Variables

#### Required for All Auth
- jwt_secret
    > The secret that will be used to sign and verify the JWTs used
    > by the library for auth

#### Optional for All Auth
- redirect_origin
    > If set, the library will use this origin for building the redirect URLs
    > that are required for the auth processes. If not set, the library will use
    > the origin the application is deployed on.

#### Github Variables
- github_client_id
- github_client_secret
#### Twitch Variables
- twitch_client_id
- twitch_client_secret
#### Auth0 Variables
- auth0_client_id
- auth0_client_secret
- auth0_origin
#### Okta Variables
- okta_client_id
- okta_client_secret
- okta_origin
