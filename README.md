This is a fork from: https://github.com/cwbuecheler/node-tutorial-for-frontend-devs

to get it running first run: npm install
to load dependencies

then: npm start

you will need to have a mongodb server running as well, and if you want to use the existing sample database located in /data you may also have to repair the files using: mongod --dbpath=data --repair

todos:
* add ability to create & edit playlists
* add html5 audio controls to skip songs
* search function
* paginate results from initial database query
* add user authentication
* allow authenticated users to save & share playlists
* 
