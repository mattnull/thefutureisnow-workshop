
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , fs = require('fs')
  , app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var server = http.createServer(app);

var webRTC = require('webrtc.io').listen(server);

var io = require('socket.io').listen(3001);

// client object
var clients = {};

io.sockets.on('connection', function (socket) {
  // ------ CHAT
  //when the user connects add them to our users object
  clients[socket.id] = {id : socket.id, nickname : false};

  //immediately tell the chat room someone has connected
  socket.broadcast.emit('userEntered', {id : socket.id});
  socket.broadcast.emit('userList', clients);
  socket.emit('userList', clients);
  socket.emit('setClientID', socket.id);
  socket.on('sendMessage', function (data) {
    var message = data.message || '';
    var user = data.user || socket.id;
    //sanitize 
    message.replace(/</g, '&lt;');
    //broadcast the update and send it to the sender
    socket.broadcast.emit('chatUpdate', {user : user, message : message});
    socket.emit('chatUpdate', {user : user, message : message});
  });

  socket.on('updateUser', function(user){
    //update their nickname in memory
    clients[socket.id].nickname = user;
    socket.broadcast.emit('userUpdate', {id : socket.id, user: user});
    socket.emit('userUpdate', {id : socket.id, user: user});
  });

  socket.on('disconnect', function(){
    console.log('DISCONNECT')
    delete clients[socket.id];
    socket.broadcast.emit('userLeft', {id : socket.id})
    socket.emit('userList', clients);
  });

  socket.on('invite', function(data){
    io.sockets.sockets[data.remoteID].emit('privateInvite', data);
  })

});


server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

//Routes
app.get('/', function(req, res) {
  res.header({'Content-Type' : 'text/html'});
  res.send(fs.readFileSync(__dirname + '/index.html'));
});

app.get('/private', function(req, res) {
  res.header({'Content-Type' : 'text/html'});
  res.send(fs.readFileSync(__dirname + '/private.html'));
});





