var socket = io.connect('http://localhost:3000');

var Chat = function(){

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

    socket.on('userEntered', function(data){
        console.log('user entered')
        // add the user to the list
        self.addUser(data.id)
        self.activity(data.id + ' has entered the room.')
    });

    socket.on('updateList', function(data){
        self.updateUserList(data)
    });

    socket.on('userLeft', function(data){
        //remove the user from the user list
        var user = $('[userid='+data.id+']')
        var username = user.length ? user.text() : data.id
        self.removeUser(data.id);
        self.activity(username + ' has left the room.')
    });

    socket.on('chatUpdate', function(data){
        self.updateChat(data.user, data.message);
    });

    socket.on('userUpdate', function(data){
        self.updateUserList(data.id, data.user);           
    });
}

Chat.prototype.addUser = function(id){
    if(id){
        this.$userList.append('<li>'+unescape(id)+'</li>');
    }
}

Chat.prototype.removeUser = function(id){
    this.$userList.find('[userid='+id+']').parent().remove();
}

Chat.prototype.updateChat = function(user, message){
    this.$chat.append('<li><b>'+user + '</b> : ' + message+'</li>');
    var parent = this.$chat.parent();
    parent[0].scrollTop = parent[0].scrollHeight;
    
    //if the user isn't the sender, then trigger a notification
    if(this.user.id !== user && this.user.name !== user){
        this.triggerNotification(user, message)
    }
}

Chat.prototype.triggerNotification = function(user, message){
    if (window.webkitNotifications.checkPermission() == 0) {     
        var notification = window.webkitNotifications.createNotification('', user, message);
        notification.show();
    }
}
// update the room that a global message has been recieved
Chat.prototype.activity = function(message){
    message = message || '';
    this.$chat.append('<li><i>'+message+'</i></li>')
}

//find a user and update their name
Chat.prototype.updateUserList = function(list){
    console.log('data', list)
    this.$userList.html('')
    for(var i in list){
        user = list[i].nickname || i;
        this.addUser(user);
    }
}

//set permissions for notifications
Chat.prototype.setNotifications = function(e){
    //get permission for notifications
    if (window.webkitNotifications.checkPermission() !== 0) {
        window.webkitNotifications.requestPermission();
    }
}

