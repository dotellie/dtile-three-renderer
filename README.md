# DTile Three Renderer
[![Build Status](https://travis-ci.org/magnonellie/dtile-three-renderer.svg?branch=master)](https://travis-ci.org/magnonellie/dtile-three-renderer)

dtile-three-renderer is a renderer made with [Three.js](https://threejs.org/)
for rendering [dtile-tilemap](https://github.com/magnonellie/dtile-tilemap)
tilemaps.

## It's slow.
Trust me, it is. I made some (questionable) decisions while coding this together
which has had the result of this being quite slow. I always appreciate when people
send in PR's or give me suggestions to fix these kind of things, so if you have
an idea, contact me on Twitter ([@magnonellie](https://twitter.com/magnonellie))!

### Design decisions
- Tiles are ***not*** rendered with sprites, but instead use planes. This allows us to bring DTile to the third dimension in the future, but for now is quite slow since it disables all kind of batching.
- It's ***not*** continuously updating. You have to manually update the renderer when you make a change to camera, tiles, size, etc. This is to save performance when it's not in use. This may backfire in the future once we start involving animations, but for now, I think this works.
- There are ***no*** tests. I find it incredibly difficult to find a good way to test front-end stuff and since this is essentially just a layer over three, I decided tests wouldn't be too useful for now. Therefore, the test command just executes a lint.
- There is probably a whole lot more which belongs to this section, but I can't come to think of them right now. xP

## Contributing
Any contribution, be it bugs, suggestions, code or whatever, is ***hugely*** appreciated, so don't be shy, please!

To set up your development environment, follow these steps:

1. Clone the repo with `git clone https://github.com/magnonellie/dtile-three-renderer.git`.
2. Run `npm install`.
3. Run `npm run dev` to start a local web-server. You should then be able to open `localhost:8080/demo` in your browser where you can try out your changes.
4. Feel free to add stuff to `demo/index.html` so that it can be used as a full-featured demo!

You should also keep in mind that this project uses es6 without transpiling, so you need to have a recent browser that supports es6! I personally recommend Chrome. ;P
