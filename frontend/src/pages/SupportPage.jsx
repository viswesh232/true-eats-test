import React, { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import { ArrowLeft, CheckCircle, ImagePlus, MessageCircle, Plus, Send, X } from 'lucide-react';
import { getImageUrl } from '../utils/helpers';

const c = { forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a', white: '#fff', slate: '#64748b', light: '#f1f5f9' };

const STATUS_STYLE = {
    open: { bg: '#fef3c7', text: '#92400e', label: 'Open' },
    answered: { bg: '#d1fae5', text: '#065f46', label: 'Answered' },
    closed: { bg: '#f1f5f9', text: '#475569', label: 'Closed' },
};

const SUPPORT_TOPICS = [
    { id: 'order_issue', label: 'Order Issue', subject: 'Help with my order', suggestions: ['Wrong item received', 'Item missing from my order', 'Need order status update'], needsOrder: true },
    { id: 'delivery', label: 'Delivery Help', subject: 'Delivery help needed', suggestions: ['Order is delayed', 'Delivery address needs correction', 'Courier update needed'], needsOrder: true },
    { id: 'payment', label: 'Payment Problem', subject: 'Payment issue', suggestions: ['Payment completed but order failed', 'Need help with refund', 'COD or online payment question'], needsOrder: false },
    { id: 'account', label: 'Account Support', subject: 'Need help with my account', suggestions: ['Unable to log in', 'Need to update profile details', 'Discount or coupon not applying'], needsOrder: false },
    { id: 'general', label: 'General Help', subject: 'Need support', suggestions: ['Need product information', 'Need help before ordering', 'Other question'], needsOrder: false },
];

const EMPTY_FORM = { topic: 'general', subject: 'Need support', message: '', relatedOrderId: '' };

const topicLabel = (topicId) => SUPPORT_TOPICS.find((topic) => topic.id === topicId)?.label || 'General Help';

const SupportPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const bottomRef = useRef(null);

    const [tickets, setTickets] = useState([]);
    const [selected, setSelected] = useState(null);
    const [orders, setOrders] = useState([]);
    const [replyText, setReplyText] = useState('');
    const [replyImages, setReplyImages] = useState([]);
    const [sending, setSending] = useState(false);
    const [showNewForm, setShowNewForm] = useState(false);
    const [newForm, setNewForm] = useState(EMPTY_FORM);
    const [newTicketImages, setNewTicketImages] = useState([]);
    const [loading, setLoading] = useState(true);

    const activeTopic = SUPPORT_TOPICS.find((topic) => topic.id === newForm.topic) || SUPPORT_TOPICS[SUPPORT_TOPICS.length - 1];

    const refreshTickets = async () => {
        const { data } = await API.get('/support/mine');
        setTickets(data);
        setSelected((current) => {
            if (!current) return current;
            return data.find((ticket) => ticket._id === current._id) || current;
        });
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return undefined;
        }

        let isMounted = true;

        const loadData = async () => {
            try {
                const [{ data: supportData }, { data: orderData }] = await Promise.all([
                    API.get('/support/mine'),
                    API.get('/orders/myorders'),
                ]);

                if (!isMounted) return;

                setTickets(supportData);
                setOrders(orderData);
                setSelected((current) => {
                    if (!current) return current;
                    return supportData.find((ticket) => ticket._id === current._id) || current;
                });
            } catch (err) {
                console.error(err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadData();
        const interval = setInterval(() => {
            refreshTickets().catch((err) => console.error(err));
        }, 10000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [user, navigate]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selected?.messages?.length]);

    const updateTopic = (topicId) => {
        const nextTopic = SUPPORT_TOPICS.find((topic) => topic.id === topicId) || SUPPORT_TOPICS[0];
        setNewForm((current) => ({
            ...current,
            topic: nextTopic.id,
            subject: nextTopic.subject,
            relatedOrderId: nextTopic.needsOrder ? current.relatedOrderId : '',
        }));
    };

    const appendSuggestion = (suggestion) => {
        setNewForm((current) => ({
            ...current,
            message: current.message ? `${current.message}\n${suggestion}` : suggestion,
        }));
    };

    const handleNewTicket = async () => {
        if (!newForm.subject.trim()) return alert('Please enter a ticket subject');
        if (activeTopic.needsOrder && !newForm.relatedOrderId) return alert('Please choose an order');
        if (!newForm.message.trim() && newTicketImages.length === 0) return alert('Please write a message or attach an image');

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('topic', newForm.topic);
            formData.append('subject', newForm.subject);
            formData.append('message', newForm.message);
            formData.append('relatedOrderId', newForm.relatedOrderId);
            newTicketImages.forEach((file) => formData.append('images', file));

            const { data } = await API.post('/support', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setTickets((prev) => [data, ...prev]);
            setSelected(data);
            setNewForm(EMPTY_FORM);
            setNewTicketImages([]);
            setShowNewForm(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create ticket');
        } finally {
            setSending(false);
        }
    };

    const handleReply = async () => {
        if ((!replyText.trim() && replyImages.length === 0) || !selected) return;
        if (selected.status === 'closed') return alert('This ticket is closed');

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('message', replyText);
            replyImages.forEach((file) => formData.append('images', file));

            const { data } = await API.post(`/support/${selected._id}/reply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSelected(data);
            setTickets((prev) => prev.map((ticket) => (ticket._id === data._id ? data : ticket)));
            setReplyText('');
            setReplyImages([]);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send');
        } finally {
            setSending(false);
        }
    };

    const inp = { width: '100%', padding: '10px 13px', borderRadius: '10px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', backgroundColor: c.white };

    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh', backgroundColor: c.light, fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
            <div style={{ backgroundColor: c.forest, padding: '16px 32px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                <button onClick={() => navigate('/')} style={{ border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 style={{ margin: 0, color: '#fff', fontWeight: '900', fontSize: '18px' }}>Customer Support</h1>
                    <p style={{ margin: 0, color: 'rgba(252,213,206,0.8)', fontSize: '12px' }}>Pick a query type, attach images, and chat live with support</p>
                </div>
                <button onClick={() => setShowNewForm(true)} style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '7px', backgroundColor: c.peach, color: c.chocolate, border: 'none', padding: '9px 18px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>
                    <Plus size={15} /> New Ticket
                </button>
            </div>

            {showNewForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ backgroundColor: c.white, borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '560px', boxShadow: '0 20px 60px rgba(0,0,0,0.18)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: c.forest, fontWeight: '900', fontSize: '18px' }}>New Support Ticket</h2>
                            <button onClick={() => setShowNewForm(false)} style={{ border: 'none', background: c.light, padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex' }}>
                                <X size={16} color={c.slate} />
                            </button>
                        </div>

                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: c.slate, marginBottom: '5px', textTransform: 'uppercase' }}>Support Type *</label>
                        <select value={newForm.topic} onChange={(e) => updateTopic(e.target.value)} style={{ ...inp, marginBottom: '14px' }}>
                            {SUPPORT_TOPICS.map((topic) => <option key={topic.id} value={topic.id}>{topic.label}</option>)}
                        </select>

                        {activeTopic.needsOrder && (
                            <>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: c.slate, marginBottom: '5px', textTransform: 'uppercase' }}>Select Order *</label>
                                <select value={newForm.relatedOrderId} onChange={(e) => setNewForm({ ...newForm, relatedOrderId: e.target.value })} style={{ ...inp, marginBottom: '14px' }}>
                                    <option value="">Choose an order</option>
                                    {orders.map((order) => (
                                        <option key={order._id} value={order.orderId || order._id}>
                                            {(order.orderId || order._id)} - {order.status}
                                        </option>
                                    ))}
                                </select>
                            </>
                        )}

                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: c.slate, marginBottom: '5px', textTransform: 'uppercase' }}>Subject *</label>
                        <input value={newForm.subject} onChange={(e) => setNewForm({ ...newForm, subject: e.target.value })} placeholder="Summarize your issue" style={{ ...inp, marginBottom: '14px' }} />

                        <div style={{ marginBottom: '14px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: c.slate, marginBottom: '8px', textTransform: 'uppercase' }}>Quick Suggestions</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {activeTopic.suggestions.map((suggestion) => (
                                    <button key={suggestion} type="button" onClick={() => appendSuggestion(suggestion)} style={{ border: 'none', backgroundColor: '#eefbf3', color: c.forest, padding: '7px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: c.slate, marginBottom: '5px', textTransform: 'uppercase' }}>Message *</label>
                        <textarea value={newForm.message} onChange={(e) => setNewForm({ ...newForm, message: e.target.value })} placeholder="Describe your issue in detail..." rows={4} style={{ ...inp, resize: 'none', marginBottom: '14px' }} />

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: '700', color: c.forest, marginBottom: '8px' }}>
                                <ImagePlus size={14} /> Attach Images
                            </label>
                            <input type="file" multiple accept="image/*" onChange={(e) => setNewTicketImages(Array.from(e.target.files || []).slice(0, 4))} style={{ ...inp, padding: '10px' }} />
                            {newTicketImages.length > 0 && <p style={{ margin: '8px 0 0', fontSize: '12px', color: c.slate }}>{newTicketImages.length} image(s) ready to send</p>}
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setShowNewForm(false)} style={{ flex: 1, padding: '12px', backgroundColor: c.light, border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', color: c.slate }}>Cancel</button>
                            <button onClick={handleNewTicket} disabled={sending} style={{ flex: 2, padding: '12px', backgroundColor: c.forest, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                <Send size={14} /> {sending ? 'Sending...' : 'Submit Ticket'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="support-container" style={{ display: 'flex', flex: 1, height: 'calc(100vh - 68px)', overflow: 'hidden' }}>
                <div className="support-sidebar" style={{ width: '320px', flexShrink: 0, borderRight: '1px solid #e2e8f0', backgroundColor: c.white, overflowY: 'auto' }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: c.chocolate }}>My Tickets</h3>
                    </div>

                    {loading ? (
                        <p style={{ padding: '20px', color: c.slate, fontSize: '13px', textAlign: 'center' }}>Loading...</p>
                    ) : tickets.length === 0 ? (
                        <div style={{ padding: '32px 20px', textAlign: 'center' }}>
                            <MessageCircle size={36} color="#cbd5e1" style={{ marginBottom: '10px' }} />
                            <p style={{ color: c.slate, fontSize: '14px', margin: '0 0 16px' }}>No tickets yet</p>
                            <button onClick={() => setShowNewForm(true)} style={{ backgroundColor: c.forest, color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                                Start a conversation
                            </button>
                        </div>
                    ) : tickets.map((ticket) => {
                        const ss = STATUS_STYLE[ticket.status];
                        const isActive = selected?._id === ticket._id;
                        const latestMessage = ticket.messages[ticket.messages.length - 1];

                        return (
                            <div key={ticket._id} onClick={() => setSelected(ticket)} style={{ padding: '14px 16px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', backgroundColor: isActive ? '#f0fdf4' : c.white, borderLeft: isActive ? `3px solid ${c.forest}` : '3px solid transparent', transition: '0.1s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span style={{ fontWeight: '700', fontSize: '13px', color: c.chocolate, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</span>
                                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px', backgroundColor: ss.bg, color: ss.text, flexShrink: 0, marginLeft: '6px' }}>{ss.label}</span>
                                </div>
                                <p style={{ margin: '0 0 4px', fontSize: '11px', color: c.forest, fontWeight: '700' }}>
                                    {topicLabel(ticket.topic)}{ticket.relatedOrderId ? ` • ${ticket.relatedOrderId}` : ''}
                                </p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                                    {latestMessage?.text ? `${latestMessage.text.slice(0, 50)}...` : `${latestMessage?.images?.length || 0} image(s) attached`}
                                </p>
                                <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#cbd5e1' }}>
                                    {new Date(ticket.lastMessageAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {selected ? (
                    <div className="support-main" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: c.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <div>
                                <h3 style={{ margin: 0, color: c.forest, fontWeight: '800', fontSize: '15px' }}>{selected.subject}</h3>
                                <p style={{ margin: '2px 0 0', color: c.slate, fontSize: '12px' }}>
                                    {selected.messages.length} messages • {topicLabel(selected.topic)}{selected.relatedOrderId ? ` • ${selected.relatedOrderId}` : ''}
                                </p>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', backgroundColor: STATUS_STYLE[selected.status].bg, color: STATUS_STYLE[selected.status].text }}>
                                {STATUS_STYLE[selected.status].label}
                            </span>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {selected.messages.map((msg, index) => {
                                const isUser = msg.sender === 'user';
                                return (
                                    <div key={index} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                                        {!isUser && <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: c.forest, color: c.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', marginRight: '8px', flexShrink: 0 }}>T</div>}
                                        <div style={{ maxWidth: '70%' }}>
                                            <div style={{ padding: '12px 16px', borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px', backgroundColor: isUser ? c.forest : c.white, color: isUser ? '#fff' : c.chocolate, fontSize: '14px', lineHeight: '1.5', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                                {msg.text && <div>{msg.text}</div>}
                                                {msg.images?.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: msg.text ? '10px' : 0 }}>
                                                        {msg.images.map((image, imageIndex) => (
                                                            <a key={imageIndex} href={getImageUrl(image)} target="_blank" rel="noreferrer">
                                                                <img src={getImageUrl(image)} alt="Support attachment" style={{ width: '92px', height: '92px', objectFit: 'cover', borderRadius: '10px', border: isUser ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0' }} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#94a3b8', textAlign: isUser ? 'right' : 'left' }}>
                                                {isUser ? 'You' : 'True Eats Support'} · {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {selected.status !== 'closed' ? (
                            <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: c.white, display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()} placeholder="Type your message... (Enter to send)" style={{ flex: 1, padding: '12px 14px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
                                    <button onClick={handleReply} disabled={sending || (!replyText.trim() && replyImages.length === 0)} style={{ backgroundColor: c.forest, color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 18px', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px' }}>
                                        <Send size={15} /> Send
                                    </button>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: c.forest, fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}>
                                        <ImagePlus size={14} />
                                        Add images
                                        <input type="file" multiple accept="image/*" onChange={(e) => setReplyImages(Array.from(e.target.files || []).slice(0, 4))} style={{ display: 'none' }} />
                                    </label>
                                    {replyImages.length > 0 && <span style={{ fontSize: '12px', color: c.slate }}>{replyImages.length} image(s) attached</span>}
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', textAlign: 'center', flexShrink: 0 }}>
                                <p style={{ margin: 0, color: c.slate, fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                    <CheckCircle size={14} /> This ticket is closed. <span onClick={() => setShowNewForm(true)} style={{ color: c.forest, fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}>Open a new one?</span>
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                        <MessageCircle size={52} color="#cbd5e1" />
                        <p style={{ color: c.slate, fontWeight: '600', margin: 0 }}>Select a ticket to view the conversation</p>
                        <button onClick={() => setShowNewForm(true)} style={{ backgroundColor: c.forest, color: '#fff', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer' }}>
                            + New Ticket
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportPage;

