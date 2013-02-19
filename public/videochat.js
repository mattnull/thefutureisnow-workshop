var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection;

//video chat class
var VideoChat = (function(){
	// define some private variables
	var videos = [];

	return {
		// 1. define an init method that instantiates our app
		init : function(){
		},

		adjustVideo : function(video) {
		    video.style.float = "left";
			video.style.width = '25%'
		},

		cloneVideo : function(domId, socketId) {
		    var video = document.getElementById(domId);
		    var clone = video.cloneNode(false);
		    clone.id = "remote" + socketId;
		    document.getElementById('videos').appendChild(clone);
		    videos.push(clone);
		    this.adjustVideo(clone);
		    return clone;
		},
		removeVideo : function(socketId) {
		    var video = document.getElementById('remote' + socketId);
		    if (video) {
		        videos.splice(videos.indexOf(video), 1);
		        video.parentNode.removeChild(video);
		    }
	  	},
	  	createRoom : function(){
	  		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
            var string_length = 8;
            var randomstring = '';
            for (var i=0; i<string_length; i++) {
              var rnum = Math.floor(Math.random() * chars.length);
              randomstring += chars.substring(rnum,rnum+1);
            }

            return randomstring;
	  	},
	  	start : function(user, room){
	  		room = room || false;
	  		var self = this;
	  		if(PeerConnection){
      			rtc.createStream({"video": true}, function(stream) {
      				console.log('stream')
			        var video = document.getElementById('you');
			        video.src = URL.createObjectURL(stream);
			        videos.push(video);
			        self.adjustVideo(video)
			     });
		    }
		    else{
		      alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
		    }
		   
			var room = room || self.createRoom();
			var url = "ws:"+window.location.href.substring(window.location.protocol.length);
		    var hash = url.indexOf('#');
		    url = (hash !== -1) ? url.substring(0, hash) : url;
			rtc.connect(url, room);

			rtc.on('add remote stream', function(stream, socketId) {
			  var clone = self.cloneVideo('you', socketId);
			  document.getElementById(clone.id).setAttribute("class", "");
			  rtc.attachStream(stream, clone.id);
			});

			rtc.on('disconnect stream', function(data) {
			    self.removeVideo(data);
			});

			//send an invite to the user
			socket.emit('invite', {user : user.name, room : room, id : user.id});
	  	}
		 
	};

})();