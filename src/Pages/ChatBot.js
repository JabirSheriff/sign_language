import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  TextField,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout';
import AddIcon from '@mui/icons-material/Add';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const ChatContainer = styled(Box)({
  display: 'flex',
  position: 'fixed',
  top: '64px',
  left: 0,
  right: 0,
  bottom: 0,
  height: 'calc(100vh - 64px)',
  margin: 0,
  padding: 0,
});

const Sidebar = styled(Box)({
  width: 300,
  backgroundColor: '#F5F5F5',
  height: '100%',
  flexShrink: 0,
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'hidden',
});

const ChatArea = styled(Paper)({
  flexGrow: 1,
  height: '100%',
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

const MessageContainer = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '20px 20px 100px 20px',
  display: 'flex',
  flexDirection: 'column',
});

const MessageBubble = styled(Box)(({ isUser }) => ({
  maxWidth: '60%',
  padding: '10px 15px',
  margin: '10px 10px',
  borderRadius: '12px',
  backgroundColor: isUser ? '#007ACC' : '#E0E0E0',
  color: isUser ? 'white' : 'black',
  alignSelf: isUser ? 'flex-end' : 'flex-start',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
}));

const GeneratingBubble = styled(Box)({
  alignSelf: 'flex-start',
  padding: '10px 15px',
  margin: '10px 10px',
  display: 'flex',
  alignItems: 'center',
});

const InputContainer = styled(Box)({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '10px 20px',
  backgroundColor: '#FFFFFF',
  borderTop: '1px solid #E0E0E0',
  display: 'flex',
  alignItems: 'center',
});

const CapsuleTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: '#F0F0F0',
    transition: 'all 0.3s ease',
  },
});

const WaveformAnimation = styled(Box)({
  height: '40px',
  width: '100%',
  background: 'linear-gradient(90deg, #007ACC 0%, #E0E0E0 100%)',
  borderRadius: '20px',
  animation: 'waveform 1s infinite',
  '@keyframes waveform': {
    '0%': { transform: 'scaleY(1)' },
    '50%': { transform: 'scaleY(1.5)' },
    '100%': { transform: 'scaleY(1)' },
  },
});

const CapsuleButton = styled(Button)({
  borderRadius: '20px',
  backgroundColor: '#007ACC',
  color: 'white',
  padding: '10px 20px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#005F9E',
  },
});

const API_KEY = "b49688c1a8b81f6e2af5039126764bb90f47e3b47e6961c3007960bb42022cdb"; // Secure this in production

// Function to process and render content with headings
const renderContent = (content, isUser) => {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    // Handle bold text (*text*)
    if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
      const text = line.slice(1, -1);
      return (
        <Typography
          key={index}
          variant="subtitle1" // Slightly larger than body
          sx={{ fontWeight: 'bold', color: isUser ? 'white' : 'black', mb: 1 }}
        >
          {text}
        </Typography>
      );
    }
    // Handle side heading (----text----)
    if (line.startsWith('----') && line.endsWith('----') && line.length > 8) {
      const text = line.slice(4, -4);
      return (
        <Typography
          key={index}
          variant="h6" // Larger for side headings
          sx={{ fontWeight: 'bold', color: isUser ? 'white' : 'black', mb: 1 }}
        >
          {text}
        </Typography>
      );
    }
    // Regular text or list items
    return (
      <Typography
        key={index}
        variant="body1"
        sx={{ color: isUser ? 'white' : 'black', mb: line.match(/^\d+\.\s|-\s/) ? 1 : 0 }}
      >
        {line}
      </Typography>
    );
  });
};

function ChatBot({ user }) {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newChatName, setNewChatName] = useState('');
  const [openNewChatDialog, setOpenNewChatDialog] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messageContainerRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      const chatsCollection = collection(db, 'chats', user.uid, 'chatBot');
      const snapshot = await getDocs(chatsCollection);
      const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setChats(chatList);
    };
    fetchChats();
  }, [user]);

  useEffect(() => {
    const scrollToBottom = () => {
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
      }
    };
    setTimeout(scrollToBottom, 0);
  }, [messages, isGenerating]);

  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessageInput(transcript);
        setIsRecording(false);
      };
      recognitionRef.current.onend = () => setIsRecording(false);
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
    } else {
      console.warn('SpeechRecognition API not supported in this browser.');
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  if (!user) {
    navigate('/');
    return null;
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleDeleteChat = async (chatId) => {
    await deleteDoc(doc(db, 'chats', user.uid, 'chatBot', chatId));
    setChats(chats.filter(chat => chat.id !== chatId));
    if (selectedChat?.id === chatId) setSelectedChat(null);
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);
    setIsGenerating(false);
  };

  const handleNewChat = async () => {
    if (!newChatName.trim()) return;
    const newChat = { name: newChatName, messages: [] };
    const docRef = await addDoc(collection(db, 'chats', user.uid, 'chatBot'), newChat);
    const updatedChats = [...chats, { id: docRef.id, ...newChat }];
    setChats(updatedChats);
    setNewChatName('');
    setOpenNewChatDialog(false);
    setSelectedChat({ id: docRef.id, ...newChat });
    setMessages([]);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    const userMessage = { role: 'user', content: messageInput };
    let updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessageInput('');
    setIsGenerating(true);

    const chatRef = doc(db, 'chats', user.uid, 'chatBot', selectedChat.id);
    await updateDoc(chatRef, { messages: updatedMessages });

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          ...updatedMessages,
        ],
        max_tokens: 1024,
        temperature: 0.7,
        top_p: 0.7,
        top_k: 50,
        repetition_penalty: 1.0,
        stop: ['<|eot_id|>', '<|eom_id|>'],
        stream: true,
      }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let aiMessageContent = '';
    let aiMessageIndex = updatedMessages.length;

    updatedMessages = [...updatedMessages, { role: 'assistant', content: '' }];
    setMessages(updatedMessages);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        if (line.startsWith('data: ') && line !== 'data: [DONE]') {
          try {
            const data = JSON.parse(line.slice(6));
            const content = data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content;
            if (content) {
              aiMessageContent += content;
              const formattedContent = aiMessageContent
                .replace(/\*([^*]+)\*/g, '$1') // Remove * and keep text
                .replace(/----([^-\n]+)----/g, '$1') // Remove ---- and keep text
                .replace(/(\d+\.\s|\-\s)/g, '\n$1'); // List formatting
              updatedMessages[aiMessageIndex] = { role: 'assistant', content: formattedContent };
              setMessages([...updatedMessages]);
            }
          } catch (error) {
            console.error('Error parsing JSON chunk:', error, 'Chunk:', line);
            continue;
          }
        }
      }
    }

    setIsGenerating(false);
    if (aiMessageContent) {
      let formattedContent = aiMessageContent
        .replace(/\*([^*]+)\*/g, '$1') // Final removal of *
        .replace(/----([^-\n]+)----/g, '$1') // Final removal of ----
        .replace(/(\d+\.\s|\-\s)/g, '\n$1');
      const finalMessages = [...updatedMessages.slice(0, -1), { role: 'assistant', content: formattedContent }];
      if (formattedContent.length >= 1024) {
        finalMessages[finalMessages.length - 1].content += '\n... [response truncated due to length]';
      }
      await updateDoc(chatRef, { messages: finalMessages });
      setMessages(finalMessages);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setMessageInput('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  return (
    <ChatContainer>
      {/* Sidebar */}
      <Sidebar>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ bgcolor: '#007ACC', mr: 2 }}>{user.displayName ? user.displayName[0].toUpperCase() : '?'}</Avatar>
            <Typography variant="h6">{user.displayName}</Typography>
          </Box>
          <Typography variant="body2" sx={{ ml: 7 }}>Welcome to Chatbot</Typography>
        </Box>
        <Divider />
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenNewChatDialog(true)} sx={{ m: 2, backgroundColor: '#007ACC' }}>
          New Chat
        </Button>
        <List sx={{ flexGrow: 1, overflowY: 'auto' }}>
          {chats.map(chat => (
            <ListItem button key={chat.id} onClick={() => handleSelectChat(chat)} selected={selectedChat?.id === chat.id}>
              <ListItemText primary={chat.name} />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleDeleteChat(chat.id)}>
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Button variant="contained" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ backgroundColor: '#007ACC', width: '100%' }}>
            Logout
          </Button>
        </Box>
      </Sidebar>

      {/* Chat Area */}
      <ChatArea elevation={3}>
        <Typography variant="h5" sx={{ color: '#007ACC', p: '20px 20px 10px' }}>
          {selectedChat ? selectedChat.name : 'Select a Chat'}
        </Typography>
        <MessageContainer ref={messageContainerRef}>
          {messages.map((msg, index) => (
            <MessageBubble key={index} isUser={msg.role === 'user'}>
              {renderContent(msg.content, msg.role === 'user')}
            </MessageBubble>
          ))}
          {isGenerating && (
            <GeneratingBubble>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="textSecondary">Generating...</Typography>
            </GeneratingBubble>
          )}
          <Box sx={{ height: '100px' }} />
        </MessageContainer>
        <InputContainer>
          {isRecording ? (
            <WaveformAnimation />
          ) : (
            <CapsuleTextField
              fullWidth
              placeholder="Type your message..."
              variant="outlined"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              sx={{ mr: 2 }}
            />
          )}
          <IconButton onClick={toggleRecording} sx={{ mr: 1 }}>
            {isRecording ? <MicOffIcon /> : <MicIcon />}
          </IconButton>
          <CapsuleButton onClick={handleSendMessage}>Send</CapsuleButton>
        </InputContainer>
      </ChatArea>

      {/* New Chat Dialog */}
      <Dialog open={openNewChatDialog} onClose={() => setOpenNewChatDialog(false)}>
        <DialogTitle>Create New Chat</DialogTitle>
        <DialogContent>
          <TextField
            label="Chat Name"
            fullWidth
            margin="normal"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewChatDialog(false)}>Cancel</Button>
          <Button onClick={handleNewChat} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </ChatContainer>
  );
}

export default ChatBot;