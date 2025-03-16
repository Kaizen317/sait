import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./Navbar";
import logo from "../assets/logo.png";
import {
  Box, Typography, TextField, Button, CircularProgress,
  ThemeProvider, createTheme, IconButton, Badge, Avatar, Tooltip
} from "@mui/material";
import { Send, Mic, AttachFile, MoreVert } from "@mui/icons-material";
import { styled } from "@mui/system";

// Definir tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#70bc7e',
      light: '#a1d8ab',
      dark: '#5ea66b',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    }
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const StyledChatContainer = styled(Box)(({ isSidebarOpen }) => ({
  display: "flex",
  height: "100vh",
  backgroundColor: theme.palette.background.default,
  marginLeft: isSidebarOpen ? "250px" : "60px",
  width: isSidebarOpen ? "calc(100% - 250px)" : "calc(100% - 60px)",
  transition: "all 0.3s ease-in-out",
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
  },
}));

const StyledChatWindow = styled(Box)({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  backgroundColor: theme.palette.background.paper,
  borderRadius: "16px",
  boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
  padding: "24px",
  margin: "20px",
  [theme.breakpoints.down('sm')]: {
    margin: "10px",
    padding: "16px",
  },
});

const MessageContainer = styled(Box)({
  marginBottom: "16px",
  display: "flex",
  flexDirection: "column",
});

const StyledMessage = styled(Box)(({ sender }) => ({
  marginBottom: "4px",
  padding: "12px 16px",
  borderRadius: sender === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  maxWidth: "75%",
  width: "fit-content",
  backgroundColor: sender === "user" ? theme.palette.primary.main : "#f0f2f5",
  color: sender === "user" ? "white" : theme.palette.text.primary,
  alignSelf: sender === "user" ? "flex-end" : "flex-start",
  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  wordBreak: "break-word",
  animation: "fadeIn 0.3s ease-out",
  "@keyframes fadeIn": {
    "0%": {
      opacity: 0,
      transform: "translateY(10px)",
    },
    "100%": {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
}));

const MessageTime = styled(Typography)({
  fontSize: "0.7rem",
  color: "rgba(0, 0, 0, 0.5)",
  marginTop: "4px",
  alignSelf: "flex-end",
});

const TypingIndicator = styled(Box)({
  display: "flex",
  alignItems: "center",
  padding: "8px 16px",
  borderRadius: "18px",
  backgroundColor: "#f0f2f5",
  width: "fit-content",
  marginBottom: "16px",
  animation: "fadeIn 0.3s ease-out",
});

const Dot = styled(Box)({
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "#70bc7e",
  margin: "0 2px",
  "@keyframes blink": {
    "0%": {
      opacity: 0.4,
    },
    "50%": {
      opacity: 1,
    },
    "100%": {
      opacity: 0.4,
    },
  },
});

const ChatHeader = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "20px",
  padding: "0 0 16px 0",
  borderBottom: "1px solid #eaeaea",
});

const InputContainer = styled(Box)({
  display: "flex",
  alignItems: "flex-end",
  gap: 12,
  padding: "16px 0 0 0",
  borderTop: "1px solid #eaeaea",
  marginTop: "auto",
});

function Ia() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Formatear la hora actual
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToBottom = () => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, autoScroll]);

  // Detectar si el usuario está scrolleando manualmente
  useEffect(() => {
    const handleScroll = () => {
      if (messagesContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isScrolledToBottom = scrollHeight - scrollTop - clientHeight < 10;
        setAutoScroll(isScrolledToBottom);
      }
    };

    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { 
      text: input, 
      sender: "user",
      time: getCurrentTime()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setAutoScroll(true);

    // Simular respuesta de IA
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { 
          text: "¡Hola! Soy el Asistente Virtual de SAIT. Estoy en fase de desarrollo y muy pronto estaré completamente a su disposición para ayudarle con todas sus consultas.", 
          sender: "ai",
          time: getCurrentTime()
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <StyledChatContainer isSidebarOpen={isSidebarOpen}>
        <Sidebar setIsSidebarOpen={setIsSidebarOpen} />
        <StyledChatWindow>
          <ChatHeader>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Avatar
                src={logo}
                alt="SAIT Logo"
                sx={{
                  width: 46,
                  height: 46,
                  mr: 2,
                  bgcolor: theme.palette.primary.light
                }}
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                  Asistente Virtual
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Disponible ahora
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex" }}>
              <Tooltip title="Más opciones">
                <IconButton>
                  <MoreVert />
                </IconButton>
              </Tooltip>
            </Box>
          </ChatHeader>

          <Box
            ref={messagesContainerRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              bgcolor: "#f9f9f9",
              borderRadius: "16px",
              p: 3,
              mb: 2,
              display: "flex",
              flexDirection: "column",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                borderRadius: "10px",
                backgroundColor: "#f1f1f1",
              },
              "&::-webkit-scrollbar-thumb": {
                borderRadius: "10px",
                backgroundColor: "#c1c1c1",
                "&:hover": {
                  backgroundColor: "#a8a8a8",
                },
              },
            }}
          >
            {messages.map((msg, index) => (
              <MessageContainer key={index} sx={{ alignItems: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                <StyledMessage sender={msg.sender}>
                  {msg.text}
                </StyledMessage>
                <MessageTime>
                  {msg.time}
                </MessageTime>
              </MessageContainer>
            ))}
            
            {isTyping && (
              <TypingIndicator>
                <Dot sx={{ animation: "blink 1.4s infinite 0.0s" }} />
                <Dot sx={{ animation: "blink 1.4s infinite 0.2s" }} />
                <Dot sx={{ animation: "blink 1.4s infinite 0.4s" }} />
              </TypingIndicator>
            )}
            <div ref={messagesEndRef} />
            
            {!autoScroll && messages.length > 0 && (
              <Button
                variant="contained"
                size="small"
                color="primary"
                onClick={() => {
                  setAutoScroll(true);
                  scrollToBottom();
                }}
                sx={{
                  position: "absolute",
                  bottom: "120px",
                  right: "40px",
                  borderRadius: "50%",
                  minWidth: "40px",
                  width: "40px",
                  height: "40px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                ↓
              </Button>
            )}
          </Box>

          <InputContainer>
            <Tooltip title="Adjuntar archivo">
              <IconButton sx={{ color: theme.palette.text.secondary }}>
                <AttachFile />
              </IconButton>
            </Tooltip>
            
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Escribe un mensaje..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              multiline
              maxRows={4}
              sx={{
                bgcolor: "white",
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                  padding: '8px 16px',
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                }
              }}
            />
            
            <Tooltip title="Enviar mensaje de voz">
              <IconButton 
                sx={{ 
                  color: theme.palette.text.secondary,
                  '&:hover': { color: theme.palette.primary.main } 
                }}
              >
                <Mic />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              endIcon={<Send />}
              sx={{
                bgcolor: theme.palette.primary.main,
                "&:hover": { bgcolor: theme.palette.primary.dark },
                borderRadius: "24px",
                px: 3,
                py: 1.2,
                height: "48px",
                minWidth: '100px',
              }}
            >
              {isTyping ? "Enviando" : "Enviar"}
            </Button>
          </InputContainer>
        </StyledChatWindow>
      </StyledChatContainer>
    </ThemeProvider>
  );
}

export default Ia;