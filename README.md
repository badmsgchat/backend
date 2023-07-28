# badmsgplatform ![repo size](https://img.shields.io/github/repo-size/badmsgchat/backend)
a simple, small size, room based messaging platform written in nodejs, express and socket.io.

## setup
### the new way
you can now use [the deploy script here](https://github.com/badmsgchat/deploy#readme) for linux systems.

### the old way
modules are ~30MB so you can host this on a raspberry pi or anything.
```sh
git clone https://github.com/badmsgchat/backend && cd backend
git submodule update --init --recursive
npm i
node ./frontend/rebuild.js
```
**↓↓↓**
### setting up the config
assuming you've cloned this repo, you have to create a configuration file first. 

create a file name `config.js`, and copy paste the content below. i'd recommend changing the key
```js
module.exports = {
    PORT: 80, // or process.env.PORT
    SECRETKEY: "whateveryouwant"
}
```
after this you're good to go! to start, run `npm start`

## license
badmsgplatform is licensed under apache license 2.0
