const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const inputMSG = document.getElementById('msg')
const startHeight = 290
const dodgers = ["Gość", "Spryciarz", "Cwaniak", "Oszust", "Kajtek", "Leniwiec", "Małpa", "Kombinator", "Maniak", "Chytrus", "Nieznajomy", "Alberto", "Łysy", "Szpieg", "Cygan", "Faryzeusz", "Zdrajca", "Intrygant", "Prowokator", "Złoczyńca", "Przemądrzalec", "Krętacz", "Manipulator", "Frant", "Gagatek", "Hultaj", "Bajerant", "Ziółko"]

// Get username and room from URL
let { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

// If the user change nick in url
if (username.length > 18 || username.length < 5 || username.includes('<') && username.includes('>')) {
  username = dodgers[Math.floor(Math.random() * dodgers.length)];
}

// If the user change room in url
if (room.length == 0 || room.length > 18) {
  room = "Nora kreta"
}

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  changeMaxHeight(users.length)
  outputUsers(users);
});

// Show feedback
inputMSG.addEventListener('focus', ({ username }) => {
  socket.emit('typing', username)
})

// Hide feedback
inputMSG.addEventListener('blur', ({ username }) => {
  socket.emit('no-typing', username)
})

// Show feedback
socket.on('typing', ({ username }) => {
  const span = document.createElement('span')
  span.classList.add('feedback')
  span.classList.add('mt-1')
  span.innerHTML = `<b>${username}</b> pisze wiadomość...`;
  document.querySelector('.chat-messages').appendChild(span);
  chatMessages.scrollTop = chatMessages.scrollHeight;
})

// Hide feedback
socket.on('no-typing', ({ username }) => {
  const feedback = document.querySelectorAll('.feedback')
  feedback.forEach(element => {
    if (element.innerText.includes(username)) {
      element.remove()
    }
  })
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
  let msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Hide feedback
  socket.emit('no-typing', username)

  // Clear input
  e.target.elements.msg.value = '';
  socket.emit('typing', username)
  inputMSG.disabled = true
  setTimeout(() => {
    inputMSG.disabled = false
    e.target.elements.msg.focus();
  }, 700)
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  const span = document.createElement('span');
  const p1 = document.createElement('p');
  const p2 = document.createElement('p');
  const hr = document.createElement('hr');
  div.classList.add('message');
  p1.classList.add('meta')
  p1.innerText = message.username + " - "
  span.classList.add('time')
  span.innerText = message.time
  p1.appendChild(span)
  p2.classList.add('text')
  p2.innerText = message.text
  div.appendChild(p1)
  div.appendChild(p2)
  // div.innerHTML = `<p class="meta">${message.username} - <span class="time">${message.time}</span></p>
  // <p class="text">
  //   ${message.text}
  // </p>`;
  var feedback = document.querySelector('.feedback')
  if (feedback) {
    document.querySelector('.chat-messages').insertBefore(div, feedback)
    document.querySelector('.chat-messages').insertBefore(hr, feedback)
  } else {
    document.querySelector('.chat-messages').appendChild(div);
    document.querySelector('.chat-messages').appendChild(hr);
  }
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

// Change MaxHeight property 
function changeMaxHeight(members) {
  const neededHeight = (members - 1) * 28
  document.querySelector('.chat-sidebar').style.maxHeight = startHeight + neededHeight + 'px'
}