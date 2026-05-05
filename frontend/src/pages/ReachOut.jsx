import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Send, Trash2, CheckCircle, Clock, AlertCircle, Mail } from 'lucide-react';
import API from '../api/axios';
import './ReachOut.css';

const c = {
    forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a',
    white: '#fff', bg: '#fafafa', slate: '#64748b', light: '#f1f5f9',
};

const ReachOut = ({ onBack }) => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replying, setReplying] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'new', 'replied', 'resolved'
    const [searchTerm, setSearchTerm] = useState('');
    const [toast, setToast] = useState('');

    const showToast = (msg) => {
        setToast(msg);
        setTimeout(() => setToast(''), 2500);
    };

    // Fetch all contact messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const { data } = await API.get('/contact/admin/all');
                setMessages(data);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                showToast('Failed to load messages');
                setLoading(false);
            }
        };
        fetchMessages();
    }, []);

    const handleBack = () => {
        if (typeof onBack === 'function') {
            onBack();
            return;
        }
        navigate('/dashboard');
    };

    // Filter messages
    const filteredMessages = messages.filter(msg => {
        const matchFilter = filter === 'all' || msg.status === filter;
        const matchSearch = 
            msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
        return matchFilter && matchSearch;
    });

    // Send reply
    const handleSendReply = async () => {
        if (!replyText.trim()) {
            alert('Please enter a reply message');
            return;
        }

        setReplying(true);
        try {
            const response = await API.put(`/contact/admin/${selectedMessage._id}/reply`, {
                adminReply: replyText
            });
            
            setMessages(messages.map(m => m._id === selectedMessage._id ? response.data.contact : m));
            setSelectedMessage(response.data.contact);
            setReplyText('');
            showToast('Reply sent successfully!');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to send reply');
        }
        setReplying(false);
    };

    // Update status
    const updateStatus = async (newStatus) => {
        try {
            const response = await API.put(`/contact/admin/${selectedMessage._id}/status`, {
                status: newStatus
            });
            setMessages(messages.map(m => m._id === selectedMessage._id ? response.data : m));
            setSelectedMessage(response.data);
            showToast(`Status updated to ${newStatus}`);
        } catch (error) {
            showToast('Failed to update status');
        }
    };

    // Delete message
    const deleteMessage = async (messageId) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;

        try {
            await API.delete(`/contact/admin/${messageId}`);
            setMessages(messages.filter(m => m._id !== messageId));
            if (selectedMessage?._id === messageId) setSelectedMessage(null);
            showToast('Message deleted');
        } catch (error) {
            showToast('Failed to delete message');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#ef4444';
            case 'replied': return '#3b82f6';
            case 'resolved': return '#10b981';
            default: return '#64748b';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'new': return <AlertCircle size={16} />;
            case 'replied': return <Mail size={16} />;
            case 'resolved': return <CheckCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: c.slate }}>Loading messages...</p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', backgroundColor: c.bg, fontFamily: "'Inter', sans-serif" }}>
            <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                <button
                    onClick={handleBack}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        color: c.forest,
                        cursor: 'pointer',
                        fontWeight: 700,
                        marginBottom: '18px'
                    }}
                >
                    <ChevronLeft size={18} /> Back to dashboard
                </button>
            </div>

            {/* Toast */}
            {toast && (
                <div style={{
                    position: 'fixed', top: '20px', right: '20px', backgroundColor: c.forest,
                    color: '#fff', padding: '12px 20px', borderRadius: '8px', fontWeight: 'bold',
                    zIndex: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {toast}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', padding: '24px', maxWidth: '1400px', margin: '0 auto', minHeight: '100vh' }}>

                {/* ─── MESSAGES LIST ─── */}
                <div style={{ backgroundColor: c.white, borderRadius: '16px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: c.chocolate }}>Customer Messages</h2>

                    {/* Search & Filter */}
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
                            borderRadius: '8px', fontSize: '13px', outline: 'none'
                        }}
                    />

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {['all', 'new', 'replied', 'resolved'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                style={{
                                    padding: '6px 12px', borderRadius: '6px', border: 'none',
                                    fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                                    backgroundColor: filter === status ? c.forest : '#f1f5f9',
                                    color: filter === status ? '#fff' : c.slate,
                                    textTransform: 'capitalize'
                                }}
                            >
                                {status === 'all' ? 'All' : status}
                            </button>
                        ))}
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {filteredMessages.length === 0 ? (
                            <p style={{ color: c.slate, textAlign: 'center', padding: '30px 0', fontSize: '13px' }}>
                                No messages found
                            </p>
                        ) : (
                            filteredMessages.map(msg => (
                                <div
                                    key={msg._id}
                                    onClick={() => setSelectedMessage(msg)}
                                    style={{
                                        padding: '12px', borderRadius: '10px', cursor: 'pointer',
                                        backgroundColor: selectedMessage?._id === msg._id ? '#f0f7ff' : c.light,
                                        border: `2px solid ${selectedMessage?._id === msg._id ? '#3b82f6' : 'transparent'}`,
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = selectedMessage?._id === msg._id ? '#f0f7ff' : '#e2e8f0'}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = selectedMessage?._id === msg._id ? '#f0f7ff' : c.light}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                        <div style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            backgroundColor: getStatusColor(msg.status)
                                        }} />
                                        <span style={{ fontSize: '12px', fontWeight: '700', color: c.chocolate, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {msg.name}
                                        </span>
                                        <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'capitalize', fontWeight: '600' }}>
                                            {msg.status}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: c.slate, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {msg.email}
                                    </p>
                                    <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {msg.subject || msg.message.substring(0, 40)}...
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ─── MESSAGE DETAIL & REPLY ─── */}
                {selectedMessage ? (
                    <div style={{ backgroundColor: c.white, borderRadius: '16px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
                        
                        {/* Header */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: c.chocolate }}>
                                    {selectedMessage.name}
                                </h3>
                                <button
                                    onClick={() => deleteMessage(selectedMessage._id)}
                                    style={{
                                        background: 'none', border: 'none', color: '#ef4444',
                                        cursor: 'pointer', fontSize: '14px', fontWeight: '700'
                                    }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: c.slate }}>
                                {selectedMessage.email}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                                {new Date(selectedMessage.createdAt).toLocaleString('en-IN')}
                            </p>
                        </div>

                        {/* Status badge */}
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: getStatusColor(selectedMessage.status), fontWeight: '700', fontSize: '12px' }}>
                                {getStatusIcon(selectedMessage.status)}
                                {selectedMessage.status.toUpperCase()}
                            </span>
                            {selectedMessage.status !== 'resolved' && (
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    {selectedMessage.status !== 'replied' && (
                                        <button
                                            onClick={() => updateStatus('replied')}
                                            style={{
                                                padding: '4px 10px', fontSize: '11px', fontWeight: '700',
                                                backgroundColor: '#3b82f6', color: '#fff', border: 'none',
                                                borderRadius: '4px', cursor: 'pointer'
                                            }}
                                        >
                                            Mark Replied
                                        </button>
                                    )}
                                    <button
                                        onClick={() => updateStatus('resolved')}
                                        style={{
                                            padding: '4px 10px', fontSize: '11px', fontWeight: '700',
                                            backgroundColor: '#10b981', color: '#fff', border: 'none',
                                            borderRadius: '4px', cursor: 'pointer'
                                        }}
                                    >
                                        Resolve
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Message content */}
                        <div style={{ backgroundColor: c.light, borderRadius: '12px', padding: '16px', borderLeft: `4px solid ${c.forest}` }}>
                            {selectedMessage.subject && (
                                <p style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '700', color: c.chocolate }}>
                                    Subject: {selectedMessage.subject}
                                </p>
                            )}
                            <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {selectedMessage.message}
                            </p>
                        </div>

                        {/* Previous reply (if exists) */}
                        {selectedMessage.adminReply && (
                            <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', padding: '16px', borderLeft: '4px solid #10b981' }}>
                                <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: '700', color: '#065f46' }}>
                                    Your Reply (sent {new Date(selectedMessage.repliedAt).toLocaleString('en-IN')}):
                                </p>
                                <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                    {selectedMessage.adminReply}
                                </p>
                                <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#065f46', fontWeight: '600' }}>
                                    From: {selectedMessage.adminEmail}
                                </p>
                            </div>
                        )}

                        {/* Reply form */}
                        {selectedMessage.status !== 'resolved' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: c.forest }}>
                                    {selectedMessage.adminReply ? 'Send Another Reply' : 'Send Reply'}
                                </h4>
                                
                                <div>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: c.slate, marginBottom: '6px', textTransform: 'uppercase' }}>
                                        Your Reply *
                                    </label>
                                    <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder="Type your reply message..."
                                        rows={4}
                                        style={{
                                            width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
                                            borderRadius: '8px', fontSize: '13px', outline: 'none',
                                            boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none'
                                        }}
                                    />
                                </div>

                                <button
                                    onClick={handleSendReply}
                                    disabled={replying}
                                    style={{
                                        padding: '12px', backgroundColor: replying ? '#94a3b8' : c.forest,
                                        color: '#fff', border: 'none', borderRadius: '8px',
                                        fontWeight: '700', cursor: replying ? 'not-allowed' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        gap: '8px', fontSize: '14px'
                                    }}
                                >
                                    <Send size={16} /> {replying ? 'Sending...' : 'Send Reply'}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ backgroundColor: c.white, borderRadius: '16px', padding: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: c.slate, fontSize: '15px', fontWeight: '600' }}>
                            👈 Select a message to view details and reply
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReachOut;
