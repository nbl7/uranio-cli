## Uranio CLI

Uranio command line interface.

### Table of Contents

- [What is it](#what-is-it)
- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Getting started](#getting-started)
- [How to develop](#how-to-develop)

### What is it

*Uranio CLI* is the only package you need in order to work with Uranio.

**Uranio** is a framework that helps you build CRUD API.

Uranio can be installed as one of the following module: `core`, `api`, `trx`, `adm`.

Each module includes the previous one.

##### Core

*Uranio Core* generates classes needed to interact with the database.

Uranio can run the following databases: [MongoDB](https://www.mongodb.com/) // More in the future.

##### Api

*Uranio API* run a service with CRUD API.

Uranio can run the API on [Express.js](https://expressjs.com/) or on [Netlify](https://www.netlify.com/).

##### TRX

*Uranio TRX* creates Hooks that can be used to query the API.

##### ADM

*Uranio Admin* creates a full Administration Panel that interact with the API.



### Installation

Uranio CLI requires [Node.js](https://nodejs.org). To install it, run the following command from any directory in your terminal:

```bash
npm install uranio-cli -g
```
or if you are using yarn
```bash
yarn global add uranio-cli
```

When using the CLI in a CI environment we recommend installing it locally as a development dependency, instead of globally.
To install locally, run the following command from the root directory of your project:

```bash
npm install --save-dev uranio-cli
```
or if you are using yarn
```bash
yarn add --dev uranio-cli
```

### Usage

Installing the CLI globally provides access to the `uranio` command.

```sh-session
uranio [command]
```
Run `help` for detailed information about CLI commands
```
uranio help
```

### Commands

#### init

```
uranio init
```
##### Flags

- `-s --root` (*string*) - Set project root. If empty Uranio will auto detect the closest repo.
- `-r --repo` (*string*) - Set Uranio repo [core, api, trx, adm]
- `-f --force` (*boolean*) - Run without prompts.
- `-d --deploy` (*string*) - Set deploy [express, netlify]
- `-p --pacman` (*string*) - Set package manager [npm, yarn]
- `-k --docker` (*boolean*) - Compile and run inside a Docker container - Docker must be installed on the machine.
- `--docker_db` (*boolean*) - Run a DB in a Docker container - Docker must be installed on the machine.
- `--db` (*string*) - Set docker DB [mongo] - Docker must be installed on the machine.

This command initialize the repository. It will download and install all
dependencies and copy all the files needed in order to start developing.


#### dev

```
uranio dev
```
This command starts a local development server.

| Subcommand | description  |
|:------------ |:-----|
| `dev:server` | Run development only for server  |
| `dev:client` | Run development only for client  |


#### deinit

```
uranio deinit
```
This command deletes everything uranio created and return the repo in its
initial state.


#### info

```
uranio info
```
This command prints the information uranio was initialized with.


#### help

```
uranio help
```
This command prints the list of all commands, parameters and options.


#### version

```
uranio version

#or

uranio
```
This command prints `uranio-cli` version.


### Output options

- `-v --verbose` (*boolean*) - log in verbose mode.
- `-u --debug` (*boolean*) - log in debug mode.
- `-n --hide` (*boolean*) - do not output log.
- `-b --blank` (*boolean*) - log with no colors.
- `-w --fullwidth` (*boolean*) - log in full width.
- `-x --prefix` (*string*) - set a log prefix.
- `-t --time` (*boolean*) - log with timestamp.
- `-a --context` (*boolean*) - log with context.
- `-l --filelog` (*boolean*) - save log on file.
- `-i --spin` (*boolean*) - log with spinner.
- `-e --native` (*boolean*) - log in native mode.
- `-c --color_log` (*string*) - log color.
- `-o --color_verbose` (*string*) - verbose log color.
- `-q --color_debug` (*string*) - debug log color.


### Getting started

Change directory to your npm repo:

```bash
cd /path/to/my/repo
```

If not already, run:
```bash
npm init
#or
yarn init
```

Then initialize Uranio with:

```bash
uranio init -vu
```

The command will prompt with the question regarding the repo you want to initialize.

- Choose the package manager [yarn, npm]
- Choose if you want to run and compile inside a Docker container.
- Choose if you want Uranio to create a Docker container with a database.
- If the previous answer was affirmative, choose the database type.
- Choose the uranio module you want to use: [core, api, trx, adm]
- If the previous answer was `api` or above, choose how you want to deploy the service [express, netlify]

This might take a while, depending on your internet connection.

After it is done, your repo is ready for development.

In order to start developing you will need to create and run a development server. Run:

```bash
uranio dev
```
Here you will see all the logs, also it will print the IP of the client in the case of the `adm` module.

Now you can start developing.


### How to develop

