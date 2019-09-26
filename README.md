## Registry PoC

This is a proof-of-concept "open-discovery" registry. It shows what might be possible when implementing real-time service advertisting, discovery, and health-check/renwals.

After forking the repo locally, you can run `npm install` and `node app.js` to run the local instance.

You can find a (sometimes) running public instance of this project here: http://rwmbook-registry.herokuapp.com/

_NOTE: The heroku instance is restarted every 25 hours or so. That means any service records added within the previous 24 hours are purged out._


### Run with Docker
Run:
`make build` to build the image and then run `make start` to bring up the container.

Run: `make help` to get a description of the commands in the Makefile.