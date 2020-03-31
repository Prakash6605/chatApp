//const moment = require("moment");

let socket=io();

socket.on('connect',function(){
    console.log('user just got connected to the server');
    let params=window.location.search.substring(1);
    let validation=JSON.parse('{"'+ decodeURI(params).replace(/&/g,'","').replace(/\+/g,' ').replace(/=/g,'":"')+'"}')
     
     socket.emit('join',validation,function(err){
         if(err){
             alert(err);
             window.location.href='/'
         }
         else{
             console.log('no error')
         }
     })
    
})
/*socket.emit('createMessage',{
    from:'prakash',
    text:'hi server...:)'
})*/
//grading the last li element inside the ol('#messages') , so that user can see the lastest message

function scrollToBottom(){
    let messages=document.querySelector('#messages').lastElementChild;
    messages.scrollIntoView();
}

// receving the message
socket.on('newMessage',(data)=>{
    
    // this was done using javascript
    /*console.log(" printing the message "+data.from+" :"+data.text+" created at "+data.createdAt );

    const formattedTime=moment(data.createdAt).format('LT');

    let li=document.createElement('li');
    li.innerText=`${data.from} ${formattedTime} : ${data.text}`

    document.querySelector('body').appendChild(li);*/

    // mustache
    const formattedTime=moment(data.createdAt).format('LT');

    const template=document.querySelector('#message-template').innerHTML;
    // rendring the script
    const html=Mustache.render(template,{
        from : data.from,
        text : data.text,
        createdAt : formattedTime
    });
    const div=document.createElement('div');
    div.innerHTML=html;

    document.querySelector('#messages').appendChild(div);
    scrollToBottom();
})  

// receving the location messgae
socket.on('newLocationMessage',function(message){

    /*console.log('newLocationMessage',message);
    const formattedTime=moment(message.createdAt).format('LT');

    let li=document.createElement('li');
    let a=document.createElement('a');
    a.setAttribute('target','_blank');
    a.setAttribute('href',message.url);
    a.innerText='My current location';
    li.innerText=`${message.from} ${formattedTime}: `


    li.appendChild(a);
    document.querySelector('body').appendChild(li);*/
   
    //mustache
    const formattedTime=moment(message.createdAt).format('LT');
   // const formattedTime=moment(data.createdAt).format('LT');

    const template=document.querySelector('#location-message-template').innerHTML;
    // rendring the script
    const html=Mustache.render(template,{
        from : message.from,
        url: message.url,
        createdAt : formattedTime
    });

    const div=document.createElement('div');
    div.innerHTML=html;
    document.querySelector('#messages').appendChild(div);
    scrollToBottom();
   
})


socket.on('disconnect',function(){
    console.log('user disconnected');
})

// displaying the list of user in a particular rooom
socket.on('updateUsersList',function(users){
    console.log(users);

    let ol=document.createElement('ol');

    users.forEach(function(user){
        let li=document.createElement('li');
        li.innerHTML=user;
        ol.appendChild(li);
    })

    let usersList=document.querySelector('#users');
    usersList.innerHTML="";
    usersList.appendChild(ol);

    
})


console.log(document.getElementsByName('sbtn'));
// preventing the form from refresing the page
document.querySelector("#submit-btn").addEventListener('click',function(e){
    e.preventDefault();// this will stop the page from refresing

    socket.emit('createMessage',{
        from:'user',
        text:document.querySelector('input[name="message"]').value
    },function(){})
    let msg=document.getElementById('msg');
    msg.value='';
})

// sending location here

document.querySelector('#send-location').addEventListener('click',function(e){
    if(!navigator.geolocation){
        return alert(' Your Browser Does Not Support Geo-Location');
    }

    navigator.geolocation.getCurrentPosition(function(position){

        console.log(position)
        // creating the emit message to send the loaction to every one in the group

        socket.emit('createLocationMessage',{
            lat : position.coords.latitude,
            lng: position.coords.longitude
        })

    },function(){

        alert('Unable to fetch the location')

    })
})