import React, { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { chatWithAssistant } from '../services/aiService';
import { supabase } from '../supabaseClient';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: '¡Hola! Soy tu asistente virtual. ¿En qué te puedo ayudar hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load catalog context once when opened
  useEffect(() => {
    if (isOpen && !catalog) {
      const fetchCatalog = async () => {
        const { data, error } = await supabase
          .from('productos')
          .select('nombre, descripcion, precio, categoria')
          .eq('disponible', true);
        if (!error && data) {
          setCatalog(data);
        }
      };
      fetchCatalog();
    }
  }, [isOpen, catalog]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await chatWithAssistant(userMessage, catalog || [], messages.slice(1)); // exclude initial greeting from history optionally, or keep it
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', content: 'Lo siento, tuve un problema al procesar tu solicitud.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          backgroundColor: 'var(--neon-accent)',
          color: 'white',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.2s',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        <Icon icon={isOpen ? "mdi:close" : "mdi:robot-outline"} style={{ fontSize: '30px' }} />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '90px',
          right: '20px',
          width: '350px',
          height: '500px',
          backgroundColor: 'var(--surface)',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          border: '1px solid var(--border-soft)',
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            backgroundColor: 'var(--neon-accent)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <Icon icon="mdi:robot-outline" style={{ fontSize: '24px' }} />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>Asistente Virtual</h3>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg)'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'var(--neon-accent)' : 'var(--surface-alt)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: '10px 14px',
                borderRadius: '12px',
                maxWidth: '80%',
                fontSize: '14px',
                lineHeight: '1.4',
                borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                borderBottomLeftRadius: msg.role === 'model' ? '4px' : '12px',
              }}>
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '12px' }}>
                <Icon icon="mdi:dots-horizontal" className="animate-pulse" style={{ fontSize: '24px' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} style={{
            padding: '12px',
            borderTop: '1px solid var(--border-soft)',
            display: 'flex',
            gap: '8px',
            backgroundColor: 'var(--surface)'
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '20px',
                border: '1px solid var(--border-soft)',
                backgroundColor: 'var(--bg)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                border: 'none',
                backgroundColor: input.trim() && !loading ? 'var(--neon-accent)' : 'var(--border-soft)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                transition: 'background-color 0.2s'
              }}
            >
              <Icon icon="mdi:send" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
