var socket = io.connect('http://localhost:3001');

var Chat = (function(){
    var chat,
        userList,
        chatInput,
        userNameInput,
        username,
        userID,
        self = this;

    this.username = false;

    function attachEvents(){
        var self = this;
        chatInput.on('keyup', function(e){
            if(e.keyCode === 13){
                var el = $(this);
                var message = el.val()
                var user = self.user
                socket.emit('sendMessage', {user : self.username, message : message});
                el.val('');
            }
        });

        userNameInput.on('keyup', function(e){
            if(e.keyCode === 13){
                var el = $(this);
                var username = el.val()
                socket.emit('updateUser', username)
                self.username = username;
                el.val('')
                activity('you are now "' + username+'"');
            }
        });

        $(document).on('click', '[trigger-video]', function(e){
            var userID = $(this).attr('userid')
            triggerVideoChat(userID);
        });

        $('#set-notifications').on('click', function(e){
            setNotifications()
        });

        // socket events
        socket.on('connect', function(client){ 
            socket.on('setClientID', function(id){
                //cache current users id
                userID = id;
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
                if(confirm('Would you like to video chat with ' + data.user + '?')){
                    console.log(data.id)
                   $('[userid="'+data.id+'"]').modal('show');
                }
            });

            socket.on('chatUpdate', function(data){
                updateChat(data.user, data.message);
            });

            socket.on('userUpdate', function(data){
                updateUserList(data.id, data.user);           
            });
        });
    }

    function addUser(id){
        user = userList.find('[userid='+id+']');

        if(!user.length){
            userList.append('<li><a href="#video-modal" trigger-video="true" userid="'+id+'" data-toggle="modal">'+id+'</a></li>');
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
        if(this.id !== user && this.username !== user){
            this.triggerNotification(user, message)
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
        user = userList.find('[userid='+id+']');
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

    function triggerVideoChat(user) {
        user = username || user
        VideoChat.start({name : user, id : userID});
    }

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
