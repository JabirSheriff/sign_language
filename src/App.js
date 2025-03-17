import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  TextField,
  Paper,
  IconButton,
  CircularProgress,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { styled } from '@mui/system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // New: Copy icon
import VolumeUpIcon from '@mui/icons-material/VolumeUp'; // New: Speaker icon
import { auth, db } from './firebase'; // Adjust path as needed
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const Container = styled(Box)({
  display: 'flex',
  height: 'calc(100vh - 64px)', // Adjusted for AppBar height
  flexDirection: 'row',
  marginTop: '64px', // Offset for fixed AppBar
});

const LeftSection = styled(Box)({
  width: '20%',
  backgroundColor: '#F5F5F5',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const MiddleSection = styled(Paper)({
  width: '60%',
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
});

const RightSection = styled(Box)({
  width: '20%',
  backgroundColor: '#F5F5F5',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  overflowY: 'auto',
});

const ChatContainer = styled(Box)({
  flexGrow: 1,
  overflowY: 'auto',
  padding: '20px 20px 20px 20px',
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
  position: 'relative', // For positioning icons
  '&:hover .message-actions': {
    opacity: 1, // Show icons on hover for AI messages
  },
}));

const MessageActions = styled(Box)({
  position: 'absolute',
  bottom: '5px',
  right: '5px',
  display: 'flex',
  gap: '5px',
  opacity: 0, // Hidden by default
  transition: 'opacity 0.2s ease',
});

const GeneratingBubble = styled(Box)({
  alignSelf: 'flex-start',
  padding: '10px 15px',
  margin: '10px 10px',
  display: 'flex',
  alignItems: 'center',
});

const InputContainer = styled(Box)({
  position: 'sticky',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '10px 20px',
  backgroundColor: '#FFFFFF',
  borderTop: '1px solid #E0E0E0',
  display: 'flex',
  alignItems: 'center',
  zIndex: 1,
});

const LongTextField = styled(TextField)({
  '& .MuiOutlinedInput-root': {
    borderRadius: '20px',
    backgroundColor: '#F0F0F0',
    paddingRight: '40px',
    transition: 'all 0.3s ease',
  },
  flexGrow: 1,
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

const SmallSendButton = styled(Button)({
  borderRadius: '20px',
  backgroundColor: '#007ACC',
  color: 'white',
  padding: '10px',
  minWidth: '60px',
  textTransform: 'none',
  marginLeft: '10px',
  '&:hover': {
    backgroundColor: '#005F9E',
  },
});

const ClearChatButton = styled(Button)({
  borderRadius: '20px',
  backgroundColor: '#FF4444',
  color: 'white',
  padding: '10px 20px',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#CC0000',
  },
});

const CapsuleButton = styled(Button)({
  borderRadius: '20px',
  backgroundColor: '#007ACC',
  color: 'white',
  padding: '10px 20px',
  textTransform: 'none',
  margin: '10px 0',
  width: '100%',
  '&:hover': {
    backgroundColor: '#005F9E',
    transform: 'scale(1.05)',
    transition: 'all 0.3s ease',
  },
});

const PreviousChatsSidebar = styled(Box)(({ open }) => ({
  position: 'fixed',
  top: '64px',
  right: open ? 0 : '-300px',
  width: '300px',
  height: 'calc(100vh - 64px)',
  backgroundColor: '#F5F5F5',
  boxShadow: '-2px 0 5px rgba(0,0,0,0.2)',
  transition: 'right 0.3s ease',
  overflowY: 'auto',
  zIndex: 1000,
}));

const CameraPlaceholder = styled(Box)({
  width: '100%',
  height: '350px',
  backgroundColor: '#E0E0E0',
  borderRadius: '8px',
  marginBottom: '20px',
  position: 'relative',
  overflow: 'hidden',
});

const VideoStream = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '8px',
  position: 'absolute',
  top: 0,
  left: 0,
});

const StyledAppBar = styled(AppBar)({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: '#007ACC',
  height: '64px',
});

const API_KEY = "b49688c1a8b81f6e2af5039126764bb90f47e3b47e6961c3007960bb42022cdb"; // Secure this in production

const renderContent = (content, highlightedIndex, isUser) => {
  const lines = content.split('\n');
  return lines.map((line, index) => {
    const isHighlighted = index === highlightedIndex;
    if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
      const text = line.slice(1, -1);
      return (
        <Typography
          key={index}
          variant="subtitle1"
          sx={{
            fontWeight: 'bold',
            color: isUser ? 'white' : 'black',
            mb: 1,
            backgroundColor: isHighlighted ? 'rgba(255, 255, 0, 0.5)' : 'transparent',
          }}
        >
          {text}
        </Typography>
      );
    }
    if (line.startsWith('----') && line.endsWith('----') && line.length > 8) {
      const text = line.slice(4, -4);
      return (
        <Typography
          key={index}
          variant="h6"
          sx={{
            fontWeight: 'bold',
            color: isUser ? 'white' : 'black',
            mb: 1,
            backgroundColor: isHighlighted ? 'rgba(255, 255, 0, 0.5)' : 'transparent',
          }}
        >
          {text}
        </Typography>
      );
    }
    return (
      <Typography
        key={index}
        variant="body1"
        sx={{
          color: isUser ? 'white' : 'black',
          mb: line.match(/^\d+\.\s|-\s/) ? 1 : 0,
          backgroundColor: isHighlighted ? 'rgba(255, 255, 0, 0.5)' : 'transparent',
        }}
      >
        {line}
      </Typography>
    );
  });
};

function App() {
  const [user, setUser] = useState(null);
  const [openAuthDialog, setOpenAuthDialog] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('anonymousChat');
    return saved ? JSON.parse(saved) : [];
  });
  const [messageInput, setMessageInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [showPreviousChats, setShowPreviousChats] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stream, setStream] = useState(null);
  const [openNewChatDialog, setOpenNewChatDialog] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const [speakingMessageIndex, setSpeakingMessageIndex] = useState(null); // Track which message is being read
  const [highlightedLineIndex, setHighlightedLineIndex] = useState(-1); // Track highlighted line
  const messageContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const speechSynthesisRef = useRef(window.speechSynthesis);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setMessages([]);
        localStorage.removeItem('anonymousChat');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('anonymousChat', JSON.stringify(messages));
    } else {
      const fetchChats = async () => {
        const chatsCollection = collection(db, 'chats', user.uid, 'chatBot');
        const snapshot = await getDocs(chatsCollection);
        const chatList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setChats(chatList);
      };
      fetchChats();
    }
  }, [user, messages]);

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
    }
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  useEffect(() => {
    if (isCameraOn && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
    }
  }, [isCameraOn, stream]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setOpenAuthDialog(false);
      setEmail('');
      setPassword('');
      setError('');
      setTimeout(() => setLoading(false), 1000);
    } catch (err) {
      setLoading(false);
      setError('Wrong email or password!');
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: fullName });
      setSignupSuccess(true);
      setEmail('');
      setPassword('');
      setFullName('');
      setError('');
      setTimeout(() => {
        setOpenAuthDialog(false);
        setSignupSuccess(false);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setLoading(false);
      setError('Signup failed—check your email/password!');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setSelectedChat(null);
    setMessages([]);
    setAnchorEl(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraOn(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    await deleteDoc(doc(db, 'chats', user.uid, 'chatBot', chatId));
    setChats(chats.filter(chat => chat.id !== chatId));
    if (selectedChat?.id === chatId) setSelectedChat(null);
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages(chat.messages || []);
    setShowPreviousChats(false);
  };

  const handleOpenNewChatDialog = () => {
    setOpenNewChatDialog(true);
  };

  const handleCloseNewChatDialog = () => {
    setOpenNewChatDialog(false);
    setNewChatName('');
  };

  const handleSaveNewChat = async () => {
    if (!newChatName.trim()) return;
    if (user) {
      const newChat = {
        name: newChatName,
        messages: [],
        timestamp: new Date().toISOString(),
      };
      const chatRef = await addDoc(collection(db, 'chats', user.uid, 'chatBot'), newChat);
      setChats([...chats, { id: chatRef.id, ...newChat }]);
      setSelectedChat({ id: chatRef.id, ...newChat });
      setMessages([]);
    } else {
      setMessages([]);
      localStorage.setItem('anonymousChat', JSON.stringify([]));
    }
    setShowPreviousChats(false);
    handleCloseNewChatDialog();
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;

    const userMessage = { role: 'user', content: messageInput };
    let updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setMessageInput('');
    setIsGenerating(true);

    if (user && selectedChat) {
      const chatRef = doc(db, 'chats', user.uid, 'chatBot', selectedChat.id);
      await updateDoc(chatRef, { messages: updatedMessages });
    }

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
                .replace(/\*([^*]+)\*/g, '$1')
                .replace(/----([^-\n]+)----/g, '$1')
                .replace(/(\d+\.\s|\-\s)/g, '\n$1');
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
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/----([^-\n]+)----/g, '$1')
        .replace(/(\d+\.\s|\-\s)/g, '\n$1');
      const finalMessages = [...updatedMessages.slice(0, -1), { role: 'assistant', content: formattedContent }];
      if (formattedContent.length >= 1024) {
        finalMessages[finalMessages.length - 1].content += '\n... [response truncated due to length]';
      }
      setMessages(finalMessages);
      if (user && selectedChat) {
        await updateDoc(doc(db, 'chats', user.uid, 'chatBot', selectedChat.id), { messages: finalMessages });
      }
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

  const toggleCamera = async () => {
    if (isCameraOn) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setIsCameraOn(false);
    } else {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(mediaStream);
        setIsCameraOn(true);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setIsCameraOn(false);
      }
    }
  };

  const togglePreviousChats = () => {
    setShowPreviousChats(prev => !prev);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMyAccount = () => {
    console.log('Navigate to My Account');
    handleMenuClose();
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClearChat = () => {
    setMessages([]);
    localStorage.removeItem('anonymousChat');
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      console.log('Message copied to clipboard');
    }).catch(err => {
      console.error('Failed to copy message:', err);
    });
  };

  const handleSpeakMessage = (content, messageIndex) => {
    if (speechSynthesisRef.current.speaking) {
      speechSynthesisRef.current.cancel();
      setSpeakingMessageIndex(null);
      setHighlightedLineIndex(-1);
      return;
    }

    setSpeakingMessageIndex(messageIndex);
    const lines = content.split('\n').filter(line => line.trim());
    let currentLineIndex = 0;

    const speakLine = () => {
      if (currentLineIndex >= lines.length) {
        setSpeakingMessageIndex(null);
        setHighlightedLineIndex(-1);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(lines[currentLineIndex]);
      utterance.onstart = () => {
        setHighlightedLineIndex(currentLineIndex);
      };
      utterance.onend = () => {
        currentLineIndex++;
        speakLine();
      };
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setSpeakingMessageIndex(null);
        setHighlightedLineIndex(-1);
      };
      speechSynthesisRef.current.speak(utterance);
    };

    speakLine();
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (speechSynthesisRef.current.speaking) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [stream]);

  return (
    <>
      <StyledAppBar>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => {}}>
            {/* Removed ArrowBackIcon */}
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            SignVerse
          </Typography>
          {user ? (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: '#FFFFFF', color: '#007ACC', mr: 1 }}>
                  {user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}
                </Avatar>
                <IconButton color="inherit" onClick={handleMenuOpen}>
                  <ArrowDropDownIcon />
                </IconButton>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMyAccount}>My Account</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
              <IconButton color="inherit" onClick={togglePreviousChats}>
                <MenuIcon />
              </IconButton>
            </>
          ) : (
            <Button color="inherit" onClick={() => setOpenAuthDialog(true)}>
              Login/Signup
            </Button>
          )}
        </Toolbar>
      </StyledAppBar>

      <Container>
        <LeftSection>
          <Box sx={{ width: 200, height: 200, backgroundColor: '#E0E0E0', borderRadius: '50%' }} />
        </LeftSection>

        <MiddleSection elevation={3}>
          <ChatContainer ref={messageContainerRef}>
            {!user && messages.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <ClearChatButton startIcon={<ClearIcon />} onClick={handleClearChat}>
                  Clear Chat
                </ClearChatButton>
              </Box>
            )}
            {messages.map((msg, index) => (
              <MessageBubble key={index} isUser={msg.role === 'user'}>
                {renderContent(
                  msg.content,
                  speakingMessageIndex === index ? highlightedLineIndex : -1,
                  msg.role === 'user'
                )}
                {msg.role === 'assistant' && (
                  <MessageActions className="message-actions">
                    <IconButton
                      size="small"
                      onClick={() => handleCopyMessage(msg.content)}
                      sx={{ color: 'black' }}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleSpeakMessage(msg.content, index)}
                      sx={{ color: 'black' }}
                    >
                      <VolumeUpIcon fontSize="small" />
                    </IconButton>
                  </MessageActions>
                )}
              </MessageBubble>
            ))}
            {isGenerating && (
              <GeneratingBubble>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">Generating...</Typography>
              </GeneratingBubble>
            )}
          </ChatContainer>
          <InputContainer>
            {isRecording ? (
              <WaveformAnimation />
            ) : (
              <Box sx={{ position: 'relative', flexGrow: 1 }}>
                <LongTextField
                  fullWidth
                  placeholder="Type your message..."
                  variant="outlined"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <IconButton
                  onClick={toggleRecording}
                  sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                >
                  {isRecording ? <MicOffIcon /> : <MicIcon />}
                </IconButton>
              </Box>
            )}
            <SmallSendButton onClick={handleSendMessage}>Send</SmallSendButton>
          </InputContainer>
        </MiddleSection>

        <RightSection>
          <CameraPlaceholder>
            {isCameraOn && stream ? (
              <VideoStream ref={videoRef} autoPlay muted />
            ) : (
              <Box sx={{ width: '100%', height: '100%', backgroundColor: '#E0E0E0', borderRadius: '8px' }} />
            )}
            <IconButton
              onClick={toggleCamera}
              sx={{ position: 'absolute', bottom: 8, right: 8 }}
            >
              {isCameraOn ? <VideocamIcon fontSize="large" /> : <VideocamOffIcon fontSize="large" />}
            </IconButton>
          </CameraPlaceholder>
          <CapsuleButton>Avatar</CapsuleButton>
          <CapsuleButton>Voice</CapsuleButton>
          <CapsuleButton>Text</CapsuleButton>
        </RightSection>

        <PreviousChatsSidebar open={showPreviousChats}>
          <Typography variant="h6" sx={{ p: 2 }}>Previous Chats</Typography>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenNewChatDialog}
              sx={{ borderRadius: '20px', width: '100%' }}
            >
              New Chat
            </Button>
          </Box>
          <List>
            {chats.map(chat => (
              <ListItem button key={chat.id} onClick={() => handleSelectChat(chat)}>
                <ListItemText primary={chat.name} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleDeleteChat(chat.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </PreviousChatsSidebar>
      </Container>

      <Dialog open={openAuthDialog} onClose={() => !loading && setOpenAuthDialog(false)}>
        <DialogTitle>{isLogin ? 'Login to SignVerse' : 'Sign Up for SignVerse'}</DialogTitle>
        <DialogContent>
          {loading ? (
            signupSuccess ? (
              <Typography variant="h6" align="center">
                Thank you for signing up! You are being redirected to SignVerse...
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            )
          ) : (
            <>
              {!isLogin && (
                <TextField
                  label="Full Name"
                  fullWidth
                  margin="normal"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              <TextField
                label="Email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error && <Typography color="error">{error}</Typography>}
              {isLogin ? (
                <Typography sx={{ mt: 1 }}>
                  New here?{' '}
                  <Button color="primary" onClick={() => setIsLogin(false)}>
                    Create an account
                  </Button>
                </Typography>
              ) : (
                <Typography sx={{ mt: 1 }}>
                  Already have an account?{' '}
                  <Button color="primary" onClick={() => setIsLogin(true)}>
                    Sign in
                  </Button>
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        {!loading && !signupSuccess && (
          <DialogActions>
            <Button onClick={() => setOpenAuthDialog(false)}>Cancel</Button>
            <Button onClick={isLogin ? handleLogin : handleSignup} color="primary">
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Dialog open={openNewChatDialog} onClose={handleCloseNewChatDialog}>
        <DialogTitle>Create New Chat</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chat Name"
            fullWidth
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseNewChatDialog}>Cancel</Button>
          <Button onClick={handleSaveNewChat} color="primary" disabled={!newChatName.trim()}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;