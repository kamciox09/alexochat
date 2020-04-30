const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const inputMSG = document.getElementById('msg')
const startHeight = 260

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  changeMaxHeight(users.length)
  outputUsers(users);
});

inputMSG.addEventListener('focus', ({ username }) => {
  socket.emit('typing', username)
})

inputMSG.addEventListener('blur', ({ username }) => {
  socket.emit('no-typing', username)
})

socket.on('typing', ({ username }) => {
  const span = document.createElement('span')
  span.classList.add('feedback')
  span.classList.add(username)
  span.classList.add('mt-1')
  span.innerHTML = `<b>${username}</b> pisze wiadomość...`;
  document.querySelector('.chat-messages').appendChild(span);
  // chatMessages.scrollTop = chatMessages.scrollHeight;
})

socket.on('no-typing', ({ username }) => {
  const feedback = document.querySelector('.' + username)
  feedback.remove()
})

// Message from server
socket.on('message', message => {
  // console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;
  if (!msg.includes('>')) {
    // Emit message to server
    socket.emit('chatMessage', msg);
  }

  socket.emit('no-typing', username)

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
  socket.emit('typing', username)
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  const hr = document.createElement('hr');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} - <span class="time">${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
  document.querySelector('.chat-messages').appendChild(hr);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}

function changeMaxHeight(members) {
  const neededHeight = (members - 1) * 28
  document.querySelector('.chat-sidebar').style.maxHeight = startHeight + neededHeight + 'px'
}