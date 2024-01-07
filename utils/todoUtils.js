
const validateTodo = ({todo})=>{

    return new Promise((resolve,reject)=>{

         if(!todo) reject("Missing todo text")

        if(typeof todo !== "string") reject("Todo should consist of letters too")

        if(todo.length<3) reject("Try writing a longer todo")

        if(todo.length>100) reject("Try writing a shorter todo")

        resolve()
    });
};

const validateUpdateTodo = ({id,todo})=>{

    return new Promise((resolve,reject)=>{
         if(!id) reject("Missing todo id")

        //  validateTodo({todo})
        // .then(()=>{
             
        //     resolve()
        // })
        // .catch((error)=>{
        //     reject(error)
        // })

        if(!todo) reject("Missing todo text")

        if(typeof todo !== "string") reject("Todo should consist of letters too")

        if(todo.length<3) reject("Try writing a longer todo")

        if(todo.length>100) reject("Try writing a shorter todo")


        resolve()
    })
}
module.exports = {validateTodo,validateUpdateTodo};