var socket = io.connect('http://localhost:3000');

var Chat = function(){

    //cache DOM elemen references
    this.$chat = $('#chat-window ul'),
    this.$userList = $('#users ul'),
    this.$chatInput = $('#chat-input'),
    this.$userNameInput = $('#username-input');
    this.user = {};
    this.attachEvents();

    // check to see if notifications are enabled
    //if not, show the set notifications button
    if (window.webkitNotifications.checkPermission() !== 0) {
        $('#set-notifications').show()
    }
};

Chat.prototype.attachEvents = function(){
    var self = this;

    //when the enter key is pressed send a message to teh server and clear the input
    this.$chatInput.on('keyup', function(e){
        if(e.keyCode === 13){
            var el = $(this);
            var message = el.val()
            var user = self.user.name
            socket.emit('sendMessage', {user : user, message : message});
            el.val('');
        }
    });

    //when "enter" is pressed, send an update to the server and update your activity in the chat
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

    //when the Allow Notifications button is clicked, request permission
    $('#set-notifications').on('click', function(e){
        self.setNotificationPermissions()
    });

    // socket events

    //initial data from the server about the connected client
    socket.on('setClientID', function(id){
        //cache current users id
        self.user.id = id;
        self.user.name = id;
    });

    //when the user list needs updated
    socket.on('updateList', function(data){
        self.updateUserList(data)
    });

    //when a user leaves the room
    socket.on('userLeft', function(data){
        //remove the user from the user list
        var user = $('[userid='+data.id+']')
        var username = user.length ? user.text() : data.id
        self.activity(username + ' has left the room.')
    });

    //when a user enters the room
    socket.on('userEntered', function(data){
        console.log('user entered')
        // add the user to the list
        self.activity(data.id + ' has entered the room.')
    });

    //when the chatroom recieves a message
    socket.on('chatUpdate', function(data){
        self.updateChat(data.user, data.message);
    });
}

Chat.prototype.addUser = function(id){
    if(id){
        //add the user to the user list 
        this.$userList.append('<li>'+unescape(id)+'</li>');
    }
}

Chat.prototype.updateChat = function(user, message){

    //add the message to the chat room
    this.$chat.append('<li><b>'+user + '</b> : ' + message+'</li>');

    //scroll to the bottom of the window when a message is received
    var parent = this.$chat.parent();
    parent[0].scrollTop = parent[0].scrollHeight;
    
    //if the user isn't the sender, then trigger a notification
    if(this.user.id !== user && this.user.name !== user){
        this.triggerNotification(user, message)
    }
}

// update the room that a global message has been recieved
Chat.prototype.activity = function(message){
    message = message || '';

    //append the activity message to the chat room
    this.$chat.append('<li><i>'+message+'</i></li>')
}

//find a user and update their name
Chat.prototype.updateUserList = function(list){
    // clear the user list
    this.$userList.html('');

    //populate the list
    for(var i in list){
        user = list[i].nickname || i;
        this.addUser(user);
    }
}

//set permissions for notifications
Chat.prototype.setNotificationPermissions = function(e){
    //get permission for notifications
    if (window.webkitNotifications.checkPermission() !== 0) {
        window.webkitNotifications.requestPermission();
    }
}

Chat.prototype.triggerNotification = function(user, message){

    if (window.webkitNotifications.checkPermission() == 0) {     
        var notification = window.webkitNotifications.createNotification('', user, message);
        notification.show();
    }
}

