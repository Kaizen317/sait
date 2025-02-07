import React, { useState, useEffect, useRef } from 'react';
import './Ia.css';
import Sidebar from './Navbar';
import logo from "../assets/logo.png"; // Importa tu logo

function Ia() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');

      // Simular respuesta de IA
      setTimeout(() => {
        setMessages((prevMessages) => [...prevMessages, { text: 'Esta es una respuesta simulada de IA.', sender: 'ai' }]);
      }, 1000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="ia-container">
      {/* Sidebar */}
      <div className="sidebar-container">
        <Sidebar />
      </div>

      {/* Chat Window */}
      <div className="chat-content">
        <div className="chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <img src={logo} alt="SAIT Logo" />
            <h1>Hola, soy tu asistente inteligente</h1>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                <span>{msg.text}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
            />
            <button onClick={handleSend}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ia;