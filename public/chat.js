var socket = io.connect('http://10.0.1.6:3001');

var Chat = (function(){
    var chat,
        userList,
        chatInput,
        userNameInput,
        username,
        userID,
        self = this;

    var USER = {}

    function attachEvents(){
        var self = this;
        chatInput.on('keyup', function(e){
            if(e.keyCode === 13){
                var el = $(this);
                var message = el.val()
                var user = USER.name
                socket.emit('sendMessage', {user : user, message : message});
                el.val('');
            }
        });

        userNameInput.on('keyup', function(e){
            if(e.keyCode === 13){
                var el = $(this);
                var username = el.val()
                socket.emit('updateUser', username)
                USER.name = username;
                el.val('')
                activity('you are now "' + username+'"');
            }
        });

        $('#set-notifications').on('click', function(e){
            setNotifications()
        });

        $(document).on('click', '[trigger-private]', function(e){
            e.preventDefault();
            var id = $(this).attr('userid');
            var room = createRoom();
            socket.emit('invite', {
                remoteID : id,
                userID : USER.id,
                userName : USER.name,
                room : room
            });
           window.location.href = '/private/#'+room;
        });
    }

    function addUser(id){
        user = userList.find('[userid='+id+']');

        if(!user.length){
            userList.append('<li><a href="/private/#'+id+'" target="_blank" userid="'+id+'" trigger-private="true">'+unescape(id)+'</a></li>');
        }
    }

    function removeUser(id){
        userList.find('[userid='+id+']').parent().remove();
    }

    function updateChat(user, message){
        chat.append('<li><b>'+user + '</b> : ' + message+'</li>');
        var parent = chat.parent();
        parent[0].scrollTop = parent[0].scrollHeight;
        
        //if the user isn't the sender, then trigger a notification
        if(USER.id !== user && USER.name !== user){
            triggerNotification(user, message)
        }
    }

    function triggerNotification(user, message){
        if (window.webkitNotifications.checkPermission() == 0) {     
            var notification = window.webkitNotifications.createNotification('', user, message);
            notification.show();
        }
    }

    function activity(message){
        message = message || '';
        chat.append('<li><i>'+message+'</i></li>')
    }

    function updateUserList(id, username){
        user = userList.find('[userid='+escape(id)+']');
        if(user.length){
            user.text(username);
        }
    }

    function setNotifications(e){
        //get permission for notifications
        if (window.webkitNotifications.checkPermission() !== 0) {
            window.webkitNotifications.requestPermission();
        }
    }

    function createRoom(){
        var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
        var string_length = 8;
        var randomstring = '';
        for (var i=0; i<string_length; i++) {
          var rnum = Math.floor(Math.random() * chars.length);
          randomstring += chars.substring(rnum,rnum+1);
        }

        return randomstring;
    }

    // socket events
    socket.on('setClientID', function(id){
        //cache current users id
        USER.id = id;
        USER.name = id;
    });

    socket.on('userEntered', function(data){
        console.log('user entered')
        // add the user to the list
        addUser(data.id)
        activity(data.id + ' has entered the room.')
    });

    socket.on('userList', function(data){
        console.log('data', data)
        for(var i in data){
            user = data[i].nickname || i;
            addUser(user);
        }
    });

    socket.on('userLeft', function(data){
        //remove the user from the user list
        var user = $('[userid='+data.id+']')
        var username = user.length ? user.text() : data.id
        removeUser(data.id);
        activity(username + ' has left the room.')
    });

    socket.on('privateInvite', function(data){
        if(confirm('Would you like to video chat with ' + data.userName + '?')){
            window.location.href = '/private/#'+data.room;
        }
    });

    socket.on('chatUpdate', function(data){
        updateChat(data.user, data.message);
    });

    socket.on('userUpdate', function(data){
        updateUserList(data.id, data.user);           
    });

    // public methods
    return {

        init : function(){
            console.log('init')
            chat = $('#chat-window ul');
            userList = $('#users ul');
            chatInput = $('#chat-input');
            userNameInput = $('#username-input');
            attachEvents();

            if (window.webkitNotifications.checkPermission() !== 0) {
                $('#set-notifications').show()
            }
        }
    };


})();


