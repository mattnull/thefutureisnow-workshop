var PeerConnection = window.PeerConnection || window.webkitPeerConnection00 || window.webkitRTCPeerConnection;

//video chat class
var VideoChat = (function(){
	// define some private variables
	var videos = [];

	return {

		adjustVideo : function(video) {
		    video.style.float = "left";
		    video.style.width = '25%';
		},

		cloneVideo : function(domId, socketId) {
		    var video = document.getElementById(domId);
		    var clone = video.cloneNode(false);
		    clone.id = "remote" + socketId;
		    console.log('CLONE')
		    $('#videos').find('.loader').remove();
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
	  	start : function(){

	  		var self = this;

	  		if(PeerConnection){
      			rtc.createStream({"video": true, "audio" : true}, function(stream) {
      				console.log('createStream', stream)
			        var video = document.getElementById('you');
			        video.src = window.webkitURL.createObjectURL(stream);
			        videos.push(video);

			     });
		    }
		    else{
		      alert('Your browser is not supported or you have to turn on flags. In chrome you go to chrome://flags and turn on Enable PeerConnection remember to restart chrome');
		    }
		    
    		var url = "ws:"+window.location.href.substring(window.location.protocol.length);
		    var hash = url.indexOf('#');
		    url = (hash !== -1) ? url.substring(0, hash) : url;
		    room = (hash !== -1) ? url.substring(hash, url.length) : false;

    		rtc.connect(url, room);
		    rtc.on('add remote stream', function(stream, socketId) {
				console.log('remote stream added')
				var clone = self.cloneVideo('you', socketId);
				$('#'+clone.id)[0].setAttribute("class", "");
				rtc.attachStream(stream, clone.id);
			});

			rtc.on('disconnect stream', function(data) {
				console.log('stream disconnected')
				self.removeVideo(data)
			});
	  	}
		 
	};

})();