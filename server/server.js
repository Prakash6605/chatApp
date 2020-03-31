const path=require('path');
const http=require('http')
const express=require('express');
const socketIO=require('socket.io');
const {generateMessage,generateLocationMessage}=require('./utils/message')
const {isRealString}=require('./utils/isRealString')
const {Users}=require('./utils/users')

const port=process.env.PORT||3000
const publicpath=path.join(__dirname,'/../public')
// making http server
let app=express();
let server=http.createServer(app);
let io=socketIO(server);
// made http server

// intantiating user
let users=new Users();

app.use(express.static(publicpath))


// listing a event
io.on('connection',(socket)=>{
    console.log('connection made ')

    socket.on('createMessage',(msg,callback)=>{
        console.log(msg.from+" says "+msg.text);
        
        //getting the name of the user from getUser method
        let user=users.getUser(socket.id);
        
        if(user && isRealString(msg.text)){
            io.to(user.room).emit('newMessage',generateMessage(user.name,msg.text));
        }
        
         

        // broadcasting the message from single user to every user in the network
       // io.emit('newMessage',generateMessage(msg.from,msg.text));
        /*io.emit('newMessage',{
            from: msg.from,
            text: msg.text,
            createdAt : new Date().getTime()
        })*/
    })
        //socket.emit('newMessage',message('admin','welcome to chat app'));
        /*socket.emit('newMessage',{
            from:'admin',
            text:'welcome to chat app',
            createdAt:new Date().getTime()
        })*/
        //socket.broadcast.emit('newMessage',message('admin','a new user joined'))

        /*socket.broadcast.emit('newMessage',{
            from : 'admin',
            text:'a new user joined',
            createdAt: new Date().getTime()
        })*/
    //JSON.parse('{"'+ decodeURI(params).replace(/&/g,'","').replace(/\+/g,' ').replace(/=/g,'":"')+'"}')
     // receving the location message and sending to evry user in the group
     
    // listing for the join room
    socket.on('join',(validations,callback)=>{
           
        if(!isRealString(validations.name) || !isRealString(validations.room)){
            return callback('A valid Username and RoomName is required')
        }


        // joining a particular room
        socket.join(validations.room);

        // after joining the room we want to add the user , but before make user join a room we have to see that whether the user is the part of any other room or not if the user is the part of other room , we have to remove the user from that room and then add him into the new room.
        users.removeUser(socket.id);
        users.addUser(socket.id,validations.name,validations.room);

         io.to(validations.room).emit('updateUsersList',users.getUserList(validations.room));

        socket.emit('newMessage',generateMessage('Admin',`welcome to ${validations.room}!`));

        socket.broadcast.to(validations.room).emit('newMessage',generateMessage('Admin','New User Joined'))
        //socket.broadcast.emit('newMessage',message('admin','a new user joined'))


        callback();
    }) 
    


     socket.on('createLocationMessage',(coords)=>{

        let user=users.getUser(socket.id);
        if(user){
            io.to(user.room).emit('newLocationMessage',generateLocationMessage(user.name,coords.lat,coords.lng));
        }
        //io.emit('newLocationMessage',generateLocationMessage('admin',coords.lat,coords.lng)); 
        /*io.emit('newLocationMessage',{
             from:'admin',
             text: `${coords.lat} ${coords.lng}`
         })*/
     })

    socket.on('disconnect',()=>{
        console.log('disconnected');

        // whenever a user is disconnected or the page is refreshed we need to remove the user from the room and update the user list and send evry other participant int the room that the user just left.
        
        
        let user = users.removeUser(socket.id);
        console.log(users.getUserList(user.room));
        //console.log(`removing the user  ${user.name}`);

        if(user){
            // if the user is succesfully removed do the further task
            console.log(' user left ');
            io.to(user.room).emit('updateUsersList',users.getUserList(user.room));
            io.to(user.room).emit('newMessage',generateMessage('Admin',`${user.name} has left ${user.room} chat room!`))
        }
        //window.location.href='/';
    })
})



server.listen(port,()=>{
    console.log(`http://localhost:${port}`)
})