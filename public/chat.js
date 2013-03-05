var socket = io.connect('http://thefutureisnow.nullempire.com:80');

var Chat = function(){

    this.$chat = $('#chat-window ul'),
    this.$userList = $('#users ul'),
    this.$chatInput = $('#chat-input'),
    this.$userNameInput = $('#username-input');

    this.user = {};

    this.attachEvents();

    if (window.webkitNotifications.checkPermission() !== 0) {
        $('#set-notifications').show()
    }
};

Chat.prototype.attachEvents = function(){
    var self = this;

    this.$chatInput.on('keyup', function(e){
        if(e.keyCode === 13){
            var el = $(this);
            var message = el.val()
            var user = self.user.name
            socket.emit('sendMessage', {user : user, message : message});
            el.val('');
        }
    });

    this.$userNameInput.on('keyup', function(e){
        if(e.keyCode === 13){
            var el = $(this);
            var username = el.val()
            socket.emit('updateUser', username)
            self.user.name = username;
            el.val('')
            self.activity('you are now "' + username+'"');
        }
    });

    $('#set-notifications').on('click', function(e){
        self.setNotifications()
    });

    // socket events
    socket.on('setClientID', function(id){
        //cache current users id
        self.user.id = id;
        self.user.name = id;
    });

    //event from server, when a user has entered the room
    socket.on('userEntered', function(data){

    });

    //event from the server, when the userList needs updated
    socket.on('roomUpdate', function(data){

    });

    //event from the server, when a user has left the room
    socket.on('userLeft', function(data){

    });

    //a new message has been sent to the room
    socket.on('chatUpdate', function(data){
    
    });
}

Chat.prototype.addUser = function(id){
}

Chat.prototype.removeUser = function(id){
}

Chat.prototype.updateChat = function(user, message){

}

Chat.prototype.triggerNotification = function(user, message){

}
// update the room that a global message has been recieved
Chat.prototype.activity = function(message){

}

//find a user and update their name
Chat.prototype.updateUserList = function(id, username){

}

//set permissions for notifications
Chat.prototype.setNotifications = function(e){

}

