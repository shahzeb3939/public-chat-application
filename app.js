const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesDiv = document.getElementById('messages');

// Generate a random sender ID for this session
const currentSenderId = 'user_' + Math.random().toString(36).substr(2, 9);

// Keep track of the latest messages
let currentMessages = [];

// Function to format date
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString();
};

// Function to render messages
const renderMessages = (messages) => {
    const wasAtBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop <= messagesDiv.clientHeight + 100;
    
    const messageHTML = messages.map(msg => {
        const isOwnMessage = msg.sender_id === currentSenderId;
        return `
            <div class="message ${isOwnMessage ? 'own-message' : 'other-message'}">
                <div class="message-content">
                    <span class="time">${formatDate(msg.created_at)}</span>
                    <p>${msg.content}</p>
                </div>
            </div>
        `;
    }).join('');
    
    // Only update DOM if content has changed
    if (messagesDiv.innerHTML !== messageHTML) {
        messagesDiv.innerHTML = messageHTML;
        
        // If was at bottom, keep at bottom after new messages
        if (wasAtBottom) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }
};

// Function to fetch messages
const fetchMessages = async () => {
    try {
        const response = await fetch('http://localhost:4000/api/messages');
        const messages = await response.json();
        
        // Check if messages have changed
        if (JSON.stringify(messages) !== JSON.stringify(currentMessages)) {
            currentMessages = messages;
            renderMessages(messages);
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }
};

// Function to send message
const sendMessage = async () => {
    const message = messageInput.value;
    if (!message.trim()) return;

    try {
        const response = await fetch('http://localhost:4000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                senderId: currentSenderId
            }),
        });

        if (response.ok) {
            messageInput.value = '';
            await fetchMessages();
            // Always scroll to bottom after sending a message
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    } catch (error) {
        console.error('Error sending message:', error);
    }
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        sendMessage();
    });
    
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    });

    // Initial fetch and set up polling
    fetchMessages();
    setInterval(fetchMessages, 3000);

    // Set initial scroll position to bottom
    setTimeout(() => {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 100);
});
