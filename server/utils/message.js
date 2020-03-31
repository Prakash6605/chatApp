const moment=require('moment')

function generateMessage(from , text){
   return {
       from,
       text,
       //createdAt: new Date().getTime()
       createdAt:moment().valueOf()
   }
}

function generateLocationMessage(from,lat,lng){
    return{
        from:from,
        url:`https://www.google.com/maps?q=${lat},${lng}`,
        createdAt:moment().valueOf()
        //createdAt: new Date().getTime()
    }
}

module.exports={generateMessage,generateLocationMessage};