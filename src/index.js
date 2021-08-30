const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user)
    return response.status(400).send();

  request.user = user;


  return next();
}

app.post('/users', (request, response) => {
  
  const { name, username } = request.body;

  const userExists = users.some(
    (user) => user.username === username
  );

  if(userExists)
    return response.send(400).json({error: "user already exists."});

    users.push({
      id: uuidv4(),
      name,
      username,
      todos : []
    });
  
    return response.status(201).send();

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(200).send(user);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { title, deadline } = request.body;

  const todo = {
    id : uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at : new Date()
  }

  user.todos.push(todo);

  return response.status(201).send();

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline, done } = request.body;
  const id = request.params.id;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(400).json({ error : "todo not found."});
  }

  todo.title = title;
  todo.done = done;
  todo.deadline = deadline;

  return response.status(200).send();
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const id = request.params.id;

  const todo = user.todos.find(todo => todo.id === id);

  if(!todo){
    return response.status(400).json({ error : "todo not found."});
  }

  todo.done = true;

  return response.status(200).send();
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const id = request.params.id;
  const todo = user.todos.find(todo => todo.id === id);
  
  if(!todo){
    return response.status(400).json({ error : "todo not found."});
  }

  user.todos.splice(todo, 1); 

  return response.status(200).send(user.todos);
  
});

module.exports = app;