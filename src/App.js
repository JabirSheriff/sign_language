import React, { useState, useRef } from 'react';
import {
  Box,
  Flex,
  Heading,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Avatar as ChakraAvatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaComments } from 'react-icons/fa';
import Webcam from 'react-webcam';

function App() {
  const webcamRef = useRef(null);
  const [messages, setMessages] = useState([]); // Array to store all messages
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(true);
  const [chatInput, setChatInput] = useState('');

  const handleTranslate = () => {
    setMessages((prev) => [...prev, 'Hello']); // Add "Hello" as a message
  };

  const toggleMic = () => setMicOn(!micOn);
  const toggleCam = () => setCamOn(!camOn);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (chatInput.trim()) {
      setMessages((prev) => [...prev, chatInput]); // Add new message to array
      setChatInput(''); // Clear input
    }
  };

  const handleClearChat = () => {
    setMessages([]); // Clear all messages
  };

  return (
    <Flex direction="column" h="100vh" bg="gray.100">
      {/* Navbar */}
      <Box as="nav" bg="blue.600" p={4} color="white" shadow="md">
        <Flex justify="space-between" align="center" maxW="container.xl" mx="auto">
          <Heading size="md">Sign Language App</Heading>
          <HStack spacing={4}>
            <Menu>
              <MenuButton as={Button} leftIcon={<FaComments />} variant="solid" bg="blue.700">
                Chats
              </MenuButton>
              <MenuList color="black">
                <MenuItem>Current Chat</MenuItem>
                <MenuItem>Chat History</MenuItem>
              </MenuList>
            </Menu>
            <ChakraAvatar size="sm" name="User" bg="blue.300" />
          </HStack>
        </Flex>
      </Box>

      {/* Main Content */}
      <Flex flex={1} overflow="hidden">
        {/* Leftmost Section: Dummy Avatar */}
        <Box w="30%" bg="gray.50" p={4} display="flex" alignItems="center" justifyContent="center">
          <Box
            w="80%"
            h="80%"
            bg="gray.300"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text>Dummy Avatar Placeholder</Text>
          </Box>
        </Box>

        {/* Middle Section: Chat */}
        <Box flex={1} bg="white" p={4} position="relative">
          <VStack h="100%" justify="space-between" spacing={4}>
            <Box flex={1} overflowY="auto" w="100%">
              {messages.length === 0 ? (
                <Text color="gray.500" textAlign="center">
                  Chat messages will appear here
                </Text>
              ) : (
                <VStack align="flex-end" spacing={2}>
                  {messages.map((msg, index) => (
                    <Box
                      key={index}
                      bg="blue.100"
                      p={2}
                      px={4}
                      borderRadius="lg"
                      maxW="70%"
                      wordBreak="break-word"
                    >
                      <Text>{msg}</Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
            <Box w="100%">
              <form onSubmit={handleChatSubmit} style={{ width: '100%' }}>
                <HStack spacing={2} bg="gray.100" p={2} borderRadius="md">
                  <IconButton
                    icon={micOn ? <FaMicrophone /> : <FaMicrophoneSlash />}
                    colorScheme={micOn ? 'green' : 'red'}
                    onClick={toggleMic}
                    aria-label="Toggle Microphone"
                  />
                  <IconButton
                    icon={camOn ? <FaVideo /> : <FaVideoSlash />}
                    colorScheme={camOn ? 'blue' : 'red'}
                    onClick={toggleCam}
                    aria-label="Toggle Camera"
                  />
                  <Input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your message..."
                    flex={1}
                  />
                  <Button type="submit" colorScheme="blue">
                    Send
                  </Button>
                </HStack>
              </form>
              <Button
                mt={2}
                w="full"
                colorScheme="red"
                variant="outline"
                onClick={handleClearChat}
              >
                Clear Chat
              </Button>
            </Box>
          </VStack>
        </Box>

        {/* Rightmost Section: Webcam + Buttons */}
        <Box w="30%" bg="gray.50" p={4}>
          {camOn ? (
            <Webcam
              ref={webcamRef}
              width="100%"
              height="auto"
              videoConstraints={{ width: 320, height: 240 }}
              style={{ borderRadius: '8px', boxShadow: 'md' }}
            />
          ) : (
            <Box
              w="100%"
              h="240px"
              bg="gray.300"
              borderRadius="md"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text>Camera Off</Text>
            </Box>
          )}
          <HStack spacing={4} mt={4} justify="center">
            <Button
              colorScheme="blue"
              variant="outline"
              _hover={{ bg: 'blue.100', transform: 'scale(1.05)' }}
              transition="all 0.2s"
            >
              Avatar
            </Button>
            <Button
              colorScheme="green"
              variant="outline"
              _hover={{ bg: 'green.100', transform: 'scale(1.05)' }}
              transition="all 0.2s"
            >
              Voice
            </Button>
            <Button
              colorScheme="purple"
              variant="outline"
              _hover={{ bg: 'purple.100', transform: 'scale(1.05)' }}
              transition="all 0.2s"
            >
              Text
            </Button>
          </HStack>
        </Box>
      </Flex>
    </Flex>
  );
}

export default App;