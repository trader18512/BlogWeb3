# News and Blogpost

## Introduction:

Welcome to our blogging platform! Our project aims to provide a user-friendly and feature-rich platform for bloggers to create, publish, and share their content with the world. Whether you're a seasoned writer or a newcomer to the blogging scene, our platform offers a seamless experience for expressing your thoughts, ideas, and stories.

## Key Features:

1. User-friendly Interface: Our platform boasts an intuitive and easy-to-use interface, making it effortless for users to navigate and interact with the content.

2. Blog Post Management: With our platform, bloggers can create, edit, and delete their blog posts with ease. They can also view and manage their published content from a centralized dashboard.

3. Reader Engagement: Readers can explore a wide range of blog posts covering various topics of interest. They can interact with posts by liking, commenting, and sharing them on social media platforms.

4. Rewards System: We value the contribution of our bloggers, and thus, we offer a rewards system where authors earn tokens for each read of their blog posts. This incentivizes quality content creation and encourages engagement within the blogging community.

## Features

- **React.js Setup:** The boilerplate comes with a well-structured React.js setup, making it easy to manage your frontend infrastructure.
- **ICP Canister:** ICP Canister integration is included, offering a powerful way to manage data and interactions on the Internet Computer.

-   [Installation](#installation)
-   [Deployment](#deployment)
-   [Examples](#examples)

Azle helps you to build secure decentralized/replicated servers in TypeScript or JavaScript on [ICP](https://internetcomputer.org/). The current replication factor is [13-40 times](https://dashboard.internetcomputer.org/subnets).

For more documentation please see [The Azle Book](https://demergent-labs.github.io/azle/).

Please remember that Azle is in beta and thus it may have unknown security vulnerabilities due to the following:

-   Azle is built with various software packages that have not yet reached maturity
-   Azle does not yet have multiple independent security reviews/audits
-   Azle does not yet have many live, successful, continuously operating applications deployed to ICP

## Installation

> Windows is only supported through a Linux virtual environment of some kind, such as [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)

On Ubuntu/WSL:

```bash
sudo apt-get install podman
```

On Mac:

```bash
brew install podman
```

It's recommended to use nvm and Node.js 20:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
```

Restart your terminal and then run:

```bash
nvm install 20
```

Check that the installation went smoothly by looking for clean output from the following command:

```bash
node --version
```

Install the dfx command line tools for managing ICP applications:

```bash
DFX_VERSION=0.16.1 sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

Check that the installation went smoothly by looking for clean output from the following command:

```bash
dfx --version
```

If after trying to run `dfx --version` you encounter an error such as `dfx: command not found`, you might need to add `$HOME/bin` to your path. Here's an example of doing this in your `.bashrc`:

```bash
echo 'export PATH="$PATH:$HOME/bin"' >> "$HOME/.bashrc"
```

## Deployment

```bash
dfx start --clean --host 127.0.0.1:8000

```

In a separate terminal in the `BlogWeb3` directory:

```bash
./deploy-local-ledger.sh

./deploy-local-icrc-ledger.sh

./deploy-local-identity.sh

./deploy-local-backend-canister.sh

dfx deploy frontend
```

If you are building an HTTP-based canister and would like your canister to autoreload on file changes (DO NOT deploy to mainnet with autoreload enabled):

```bash
AZLE_AUTORELOAD=true dfx deploy
```

If you have problems deploying see [Common deployment issues](https://demergent-labs.github.io/azle/deployment.html#common-deployment-issues).

View your frontend in a web browser at `http://[canisterId].localhost:8000`.

To obtain your application's [canisterId]:

```bash
dfx canister id backend
```

Communicate with your canister using any HTTP client library, for example using `curl`:

```bash
curl http://[canisterId].localhost:8000/db
curl -X POST -H "Content-Type: application/json" -d "{ \"hello\": \"world\" }" http://[canisterId].localhost:8000/db/update
```

## Examples

There are many Azle examples in the [examples directory](https://github.com/demergent-labs/azle/tree/main/examples). We recommend starting with the following:

-   [apollo_server](https://github.com/demergent-labs/azle/tree/main/examples/apollo_server)
-   [ethers](https://github.com/demergent-labs/azle/tree/main/examples/ethers)
-   [express](https://github.com/demergent-labs/azle/tree/main/examples/express)
-   [fs](https://github.com/demergent-labs/azle/tree/main/examples/fs)
-   [hello_world](https://github.com/demergent-labs/azle/tree/main/examples/hello_world)
-   [ic_evm_rpc](https://github.com/demergent-labs/azle/tree/main/examples/ic_evm_rpc)
-   [sqlite](https://github.com/demergent-labs/azle/tree/main/examples/sqlite)
-   [web_assembly](https://github.com/demergent-labs/azle/tree/main/examples/web_assembly)
