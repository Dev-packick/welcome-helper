import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const Messages = () => {
    const { token, user } = useAuth()
    const navigate = useNavigate()
    const [conversations, setConversations] = useState([])
    const [selectedConv, setSelectedConv] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef(null)
    const pollingRef = useRef(null)

    useEffect(() => {
        if (!token) { navigate('/login'); return }
        fetchConversations()
    }, [token])

    useEffect(() => {
        if (selectedConv) {
        fetchMessages(selectedConv.id_conversation)
        // Polling toutes les 3 secondes
        pollingRef.current = setInterval(() => {
            fetchMessages(selectedConv.id_conversation)
        }, 3000)
        }
        return () => clearInterval(pollingRef.current)
    }, [selectedConv])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const fetchConversations = async () => {
        try {
        const response = await axios.get('/api/messages', {
            headers: { Authorization: `Bearer ${token}` }
        })
        setConversations(response.data.conversations)
        } catch (error) {
        console.error('Erreur conversations:', error)
        } finally {
        setLoading(false)
        }
    }

    const fetchMessages = async (convId) => {
        try {
        const response = await axios.get(
            `/api/messages/conversations/${convId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
        setMessages(response.data.messages)
        fetchConversations()
        } catch (error) {
        console.error('Erreur messages:', error)
        }
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedConv) return
        setSending(true)
        try {
        await axios.post(
            `/api/messages/conversations/${selectedConv.id_conversation}`,
            { content: newMessage },
            { headers: { Authorization: `Bearer ${token}` } }
        )
        setNewMessage('')
        fetchMessages(selectedConv.id_conversation)
        } catch (error) {
        console.error('Erreur envoi:', error)
        } finally {
        setSending(false)
        }
    }

    const formatTime = (dateStr) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now - date
        if (diff < 60000) return 'À l\'instant'
        if (diff < 3600000) return `Il y a ${Math.floor(diff/60000)} min`
        if (diff < 86400000) return date.toLocaleTimeString('fr-FR', {
        hour:'2-digit', minute:'2-digit'
        })
        return date.toLocaleDateString('fr-FR', { day:'numeric', month:'short' })
    }

    const getInitials = (prenom, nom) => {
        if (!prenom || !nom) return 'WH'
        return `${prenom[0]}${nom[0]}`.toUpperCase()
    }

    return (
        <div className="messages-container">
            <Navbar />

            <div className="messages-layout">
                {/* ── LISTE CONVERSATIONS ── */}
                <aside className="messages-sidebar">
                    <div className="messages-sidebar-head">
                        <h2 className="messages-sidebar-title">Messages</h2>
                    </div>

                    <div className="messages-search">
                        <input type="text" placeholder="Rechercher une conversation..." className="messages-search-input" aria-label="Rechercher une conversation"/>
                    </div>

                    <div className="messages-conv-list">
                        {loading ? (
                        <p className="messages-empty-state">Chargement...</p>
                            ) : conversations.length === 0 ? (
                        <p className="messages-empty-state">Aucune conversation pour l'instant</p>
                            ) : (
                            conversations.map(conv => (
                            <div key={conv.id_conversation} className={selectedConv?.id_conversation === conv.id_conversation ? 'messages-conv-item active' : 'messages-conv-item' } onClick={() => setSelectedConv(conv)}>
                                <div className="messages-conv-avatar">
                                    {getInitials(conv.autre_prenom, conv.autre_nom)}
                                </div>
                                <div className="messages-conv-info">
                                    <div className="messages-conv-head">
                                        <span className="messages-conv-name">{conv.autre_prenom} {conv.autre_nom}</span>
                                        <span className="messages-conv-time">{formatTime(conv.date_dernier_message)}</span>
                                    </div>
                                    <div className="messages-conv-preview">
                                        <span className="messages-conv-last">
                                            {conv.dernier_message
                                            ? conv.dernier_message.slice(0, 40) + (conv.dernier_message.length > 40 ? '...' : '')
                                            : conv.mission_titre || 'Nouvelle conversation'
                                            }
                                        </span>
                                        {parseInt(conv.non_lus) > 0 && (
                                            <span className="messages-conv-badge">{conv.non_lus}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                        )}
                    </div>
                </aside>

                {/* ── FIL DE MESSAGES ── */}
                <main className="messages-main">
                {!selectedConv ? (
                    <div className="messages-no-conv">
                        <div className="messages-no-conv-icon">💬</div>
                        <p>Sélectionnez une conversation</p>
                        <span>ou acceptez une mission pour démarrer</span>
                    </div>
                ) : (
                    
                    <>
                        {/* Header conversation */}
                        <div className="messages-chat-head">
                            <div className="messages-chat-avatar">{getInitials( selectedConv.autre_prenom, selectedConv.autre_nom )}</div>
                            <div>
                                <p className="messages-chat-name">{selectedConv.autre_prenom} {selectedConv.autre_nom}</p>
                                <p className="messages-chat-mission">{selectedConv.mission_titre || 'Conversation'}</p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="messages-chat-body">
                            {messages.length === 0 ? (
                            <p className="messages-chat-empty">Aucun message — commencez la conversation !</p>
                            ) : (
                            messages.map(msg => {
                                const isMine = msg.id_expediteur === user?.user_id
                                return (
                                <div key={msg.id_message} className={isMine ? 'messages-bubble-row mine' : 'messages-bubble-row' }>
                                    {!isMine && (<div className="messages-bubble-avatar">{getInitials(msg.prenom, msg.nom)}</div>)}
                                    <div className={isMine? 'messages-bubble mine': 'messages-bubble'}>
                                        <p className="messages-bubble-content">{msg.content}</p>
                                        <span className="messages-bubble-time">{new Date(msg.date_envoi).toLocaleTimeString('fr-FR',{ hour:'2-digit', minute:'2-digit' })}</span>
                                    </div>
                                </div>
                                )
                            })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input envoi */}
                        <form className="messages-input-row" onSubmit={handleSend}>
                            <button type="button" className="messages-attach-btn">📎</button>
                            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Écrire un message..." className="messages-input" aria-label="Écrire un message" disabled={sending} onKeyDown={e => {if (e.key === 'Enter' && !e.shiftKey) handleSend(e)}}/>
                            <button type="submit" className="messages-send-btn" disabled={sending || !newMessage.trim()} aria-label="Envoyer le message" >➤</button>
                        </form>
                    </>
                )}
                </main>
            </div>
        </div>
    )
}

export default Messages
