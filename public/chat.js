// Connect to the server
var socket = io.connect('http://localhost:3000');

//define our chat class
var Chat = function(){

    //cache DOM elemen references
    this.$chat = $('#chat-window ul'),
    this.$userList = $('#users ul'),
    this.$chatInput = $('#chat-input'),
    this.$userNameInput = $('#username-input');
    this.user = {}; //used for caching user info
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

    });

    //when "enter" is pressed, send an update to the server and update your activity in the chat
    this.$userNameInput.on('keyup', function(e){

    });

    //when the Allow Notifications button is clicked, request permission
    $('#set-notifications').on('click', function(e){
    
    });

    // --- socket events

    //initial data from the server about the connected client
    //cache the user data on the client for future use
    socket.on('setClientID', function(id){

    });

    //when the user list needs updated
    //this is called when a user enters the room, leaves the room, or changes their user name
    socket.on('updateList', function(data){

    });

    //when a user leaves the room
    socket.on('userLeft', function(data){

    });

    //when a user enters the room
    socket.on('userEntered', function(data){
  
    });

    //when the chatroom recieves a message
    socket.on('chatUpdate', function(data){

    });
}

//add a user to $userList
Chat.prototype.addUser = function(id){

    //add the user to the user list 

}

//update the chat when someone says something
Chat.prototype.updateChat = function(user, message){

}

// update the room with a general message from the server
Chat.prototype.activity = function(message){

}

//find a user and update their name
Chat.prototype.updateUserList = function(list){

}

//set permissions for notifications
Chat.prototype.setNotificationPermissions = function(e){

}

//show the a notification with the user name and the message 
Chat.prototype.triggerNotification = function(user, message){

}

