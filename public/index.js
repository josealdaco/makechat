//index.js
$(document).ready(()=>{
    let currentUser;
    const socket = io.connect();

if(localStorage.getItem('name')) {



 currentUser = localStorage.getItem('name');



 $('.username-form').remove();
 $('.main-container').css('display', 'flex');
 socket.emit('new user', currentUser);

}

if(localStorage.getItem('channel')){
    socket.emit('change Channel',localStorage.getItem('channel') )

}else{
    socket.emit('user changed channel', "General");

}

    // Get the online users from the server
    socket.emit('get online users');
    //Each user should be in the general channel by default.






  //Users can change the channel by clicking on its name.
  $(document).on('click', '.channel', (e)=>{
    let newChannel = e.target.textContent;
    localStorage.setItem('channel', newChannel);
    socket.emit('user changed channel', newChannel);
  });

   $('#logoutbtn').click((e)=>{
       localStorage.removeItem('name');


   });
  $('#create-user-btn').click((e)=>{


    if($('#username-input').val().length > 0){
    localStorage.setItem('name', $('#username-input').val());
      socket.emit('new user', $('#username-input').val());
      // Save the current user when created
      currentUser = $('#username-input').val();
      $('.username-form').remove();
      $('.main-container').css('display', 'flex');
    }
  });



  //socket listeners
  socket.on('new user', (username, channels) => {
    console.log(`${username} has joined the chat`);
    if (document.getElementById(username) == undefined){
    $('.users-online').append(`<div  id='${username}' class="user-online">${username}</div>`);

    }
    for(localchannel in channels){
        if (localchannel != "General" &&  document.getElementById(localchannel) == undefined){
        $('.channels').append(`<div id ='${localchannel}' class="channel">${localchannel}</div>`);
    }
    }
  })
  socket.on('get online users', (onlineUsers) => {
    //You may have not have seen this for loop before. It's syntax is for(key in obj)
    //Our usernames are keys in the object of onlineUsers.
    for(username in onlineUsers){
        if (document.getElementById(username) == undefined){
      $('.users-online').append(`<div  id='${username}' class="user-online">${username}</div>`);
    }
    }

    //if(localStorage.getItem('name')) {

    //    $('.users-online').append(`<div class="user-online">${localStorage.getItem('name')}</div>`);

    //}


  })

  //Refresh the online user list
  socket.on('user has left', (onlineUsers) => {
    $('.users-online').empty();
    for(username in onlineUsers){
      $('.users-online').append(`<p>${username}</p>`);
    }
  });

  //Output the new message
  socket.on('new message', (data) => {
    //Only append the message if the user is currently in that channel
    let currentChannel = $('.channel-current').text();
    if(currentChannel == data.channel){
      $('.message-container').append(`
        <div class="message">
          <p class="message-user">${data.sender}: </p>
          <p class="message-text">${data.message}</p>
        </div>
      `);
    }
  })

// Add the new channel to the channels list (Fires for all clients)
socket.on('new channel', (newChannel) => {

  $('.channels').append(`<div  id = '${newChannel}' class="channel">${newChannel}</div>`);


  //localStorage.removeItem('channels')

});

// Make the channel joined the current channel. Then load the messages.
// This only fires for the client who made the channel.
socket.on('user changed channel', (data) => {
    console.log("Data from prev channel", data)
  $('.channel-current').addClass('channel');
  $('.channel-current').removeClass('channel-current');
  $(`.channel:contains('${data.channel}')`).addClass('channel-current');
  $('.channel-current').removeClass('channel');
  $('.message').remove();
  data.messages.forEach((message) => {
    $('.message-container').append(`
      <div class="message">
        <p class="message-user">${message.sender}: </p>
        <p class="message-text">${message.message}</p>
      </div>
    `);
  });
})
$('#new-channel-btn').click( () => {
  let newChannel = $('#new-channel-input').val();

  if(newChannel.length > 0){
    // Emit the new channel to the server
    socket.emit('new channel', newChannel);
    $('#new-channel-input').val("");
  }
})

$('#send-chat-btn').click((e) => {
  e.preventDefault();
  // Get the client's channel
  let channel = $('.channel-current').text();
  let message = $('#chat-input').val();
  console.log("Channel", channel)
  if(message.length > 0){
    socket.emit('new message', {
      sender : currentUser,
      message : message,
      channel : channel,
    });
    $('#chat-input').val("");
  }
});

})
