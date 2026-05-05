import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, CheckCircle, Clock, ImagePlus, MessageCircle, RefreshCw, Search, Send, XCircle } from 'lucide-react';

const c = { forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a', white: '#fff', slate: '#64748b', light: '#f1f5f9' };

const STATUS_STYLE = {
    open: { bg: '#fef3c7', text: '#92400e', label: 'Open', icon: Clock },
    answered: { bg: '#d1fae5', text: '#065f46', label: 'Answered', icon: CheckCircle },
    closed: { bg: '#f1f5f9', text: '#475569', label: 'Closed', icon: XCircle },
};

import { getImageUrl } from '../utils/helpers';

const formatTopic = (topic) => (topic || 'general').replace(/_/g, ' ');

const SupportAdmin = () => {
    const navigate = useNavigate();
    const bottomRef = useRef(null);

    const [tickets, setTickets] = useState([]);
    const [selected, setSelected] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [replyImages, setReplyImages] = useState([]);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        const { data } = await API.get('/support/admin/all');
        setTickets(data);
        setSelected((current) => {
            if (!current) return current;
            return data.find((ticket) => ticket._id === current._id) || current;
        });
        setLoading(false);
    };

    useEffect(() => {
        let isMounted = true;

        const loadTickets = async () => {
            try {
                const { data } = await API.get('/support/admin/all');
                if (!isMounted) return;
                setTickets(data);
                setSelected((current) => {
                    if (!current) return current;
                    return data.find((ticket) => ticket._id === current._id) || current;
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
            }
        };

        loadTickets();
        const interval = setInterval(() => {
            fetchTickets().catch((err) => console.error(err));
        }, 10000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selected?.messages?.length]);

    const handleReply = async () => {
        if ((!replyText.trim() && replyImages.length === 0) || !selected) return;
        setSending(true);
        try {
            const formData = new FormData();
            formData.append('message', replyText);
            replyImages.forEach((file) => formData.append('images', file));

            const { data } = await API.post(`/support/admin/${selected._id}/reply`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSelected(data);
            setTickets((prev) => prev.map((ticket) => (ticket._id === data._id ? data : ticket)));
            setReplyText('');
            setReplyImages([]);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed');
        } finally {
            setSending(false);
        }
    };

    const handleClose = async () => {
        if (!selected || !window.confirm('Close this ticket?')) return;
        try {
            const { data } = await API.put(`/support/admin/${selected._id}/close`);
            setSelected(data);
            setTickets((prev) => prev.map((ticket) => (ticket._id === data._id ? data : ticket)));
        } catch {
            alert('Failed to close');
        }
    };

    const filteredTickets = tickets.filter((ticket) => {
        const matchStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchSearch = !search
            || ticket.subject?.toLowerCase().includes(search.toLowerCase())
            || ticket.userName?.toLowerCase().includes(search.toLowerCase())
            || ticket.userEmail?.toLowerCase().includes(search.toLowerCase())
            || ticket.relatedOrderId?.toLowerCase().includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const openCount = tickets.filter((ticket) => ticket.status === 'open').length;
    const answeredCount = tickets.filter((ticket) => ticket.status === 'answered').length;

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>
            <div style={{ backgroundColor: c.forest, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                <button onClick={() => navigate('/dashboard')} style={{ border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 style={{ margin: 0, color: '#fff', fontWeight: '900', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={20} /> Customer Support Inbox
                    </h1>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                    {openCount > 0 && <span style={{ backgroundColor: '#fef3c7', color: '#92400e', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>{openCount} Open</span>}
                    {answeredCount > 0 && <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800' }}>{answeredCount} Answered</span>}
                    <button onClick={() => fetchTickets().catch((err) => console.error(err))} style={{ border: 'none', background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer', color: '#fff', display: 'flex' }}>
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                <div style={{ width: '340px', flexShrink: 0, borderRight: '1px solid #e2e8f0', backgroundColor: c.white, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={14} color={c.slate} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..." style={{ width: '100%', padding: '8px 10px 8px 30px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '13px', outline: 'none', boxSizing: 'border-box', backgroundColor: c.light }} />
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            {['all', 'open', 'answered', 'closed'].map((filter) => (
                                <button key={filter} onClick={() => setFilterStatus(filter)} style={{ flex: 1, padding: '5px 0', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '11px', textTransform: 'capitalize', backgroundColor: filterStatus === filter ? c.forest : c.light, color: filterStatus === filter ? '#fff' : c.slate }}>
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {loading ? (
                            <p style={{ padding: '20px', textAlign: 'center', color: c.slate, fontSize: '13px' }}>Loading...</p>
                        ) : filteredTickets.length === 0 ? (
                            <p style={{ padding: '24px', textAlign: 'center', color: c.slate, fontSize: '13px' }}>No tickets found</p>
                        ) : filteredTickets.map((ticket) => {
                            const ss = STATUS_STYLE[ticket.status];
                            const StatusIcon = ss.icon;
                            const isActive = selected?._id === ticket._id;
                            const latestMessage = ticket.messages[ticket.messages.length - 1];

                            return (
                                <div key={ticket._id} onClick={() => setSelected(ticket)} style={{ padding: '13px 14px', borderBottom: '1px solid #f8fafc', cursor: 'pointer', backgroundColor: isActive ? '#f0fdf4' : c.white, borderLeft: `3px solid ${isActive ? c.forest : 'transparent'}`, transition: '0.1s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                        <span style={{ fontWeight: '700', fontSize: '13px', color: c.chocolate, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '8px', backgroundColor: ss.bg, color: ss.text, flexShrink: 0, marginLeft: '6px' }}>
                                            <StatusIcon size={9} /> {ss.label}
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '12px', color: c.forest, fontWeight: '600' }}>{ticket.userName}</p>
                                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: c.slate }}>
                                        {formatTopic(ticket.topic)}{ticket.relatedOrderId ? ` • ${ticket.relatedOrderId}` : ''}
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#94a3b8' }}>
                                        {latestMessage?.text ? `${latestMessage.text.slice(0, 45)}...` : `${latestMessage?.images?.length || 0} image(s) attached`}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {selected ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: c.light }}>
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', backgroundColor: c.white, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                            <div>
                                <h3 style={{ margin: 0, color: c.forest, fontWeight: '800', fontSize: '15px' }}>{selected.subject}</h3>
                                <p style={{ margin: '2px 0 0', color: c.slate, fontSize: '12px' }}>
                                    {selected.userName} · {selected.userEmail}
                                </p>
                                <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '11px' }}>
                                    {formatTopic(selected.topic)}{selected.relatedOrderId ? ` • ${selected.relatedOrderId}` : ''}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', backgroundColor: STATUS_STYLE[selected.status].bg, color: STATUS_STYLE[selected.status].text }}>
                                    {STATUS_STYLE[selected.status].label}
                                </span>
                                {selected.status !== 'closed' && (
                                    <button onClick={handleClose} style={{ fontSize: '12px', fontWeight: '700', padding: '5px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: c.white, color: '#ef4444', cursor: 'pointer' }}>
                                        Close Ticket
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {selected.messages.map((msg, index) => {
                                const isAdmin = msg.sender === 'admin';
                                return (
                                    <div key={index} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                                        {!isAdmin && <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', color: c.chocolate, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '13px', marginRight: '8px', flexShrink: 0 }}>{selected.userName?.[0]?.toUpperCase() || '?'}</div>}
                                        <div style={{ maxWidth: '65%' }}>
                                            <div style={{ padding: '12px 16px', borderRadius: isAdmin ? '18px 18px 4px 18px' : '18px 18px 18px 4px', backgroundColor: isAdmin ? c.forest : c.white, color: isAdmin ? '#fff' : c.chocolate, fontSize: '14px', lineHeight: '1.5', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                                                {msg.text && <div>{msg.text}</div>}
                                                {msg.images?.length > 0 && (
                                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: msg.text ? '10px' : 0 }}>
                                                        {msg.images.map((image, imageIndex) => (
                                                            <a key={imageIndex} href={getImageUrl(image)} target="_blank" rel="noreferrer">
                                                                <img src={getImageUrl(image)} alt="Support attachment" style={{ width: '92px', height: '92px', objectFit: 'cover', borderRadius: '10px', border: isAdmin ? '1px solid rgba(255,255,255,0.2)' : '1px solid #e2e8f0' }} />
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <p style={{ margin: '3px 0 0', fontSize: '10px', color: '#94a3b8', textAlign: isAdmin ? 'right' : 'left' }}>
                                                {isAdmin ? 'True Eats Support' : selected.userName} · {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {isAdmin && <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: c.forest, color: c.peach, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '11px', marginLeft: '8px', flexShrink: 0 }}>TE</div>}
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {selected.status !== 'closed' ? (
                            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: c.white, display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <input value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()} placeholder="Type your reply... (Enter to send)" style={{ flex: 1, padding: '11px 14px', borderRadius: '12px', border: '2px solid #e2e8f0', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }} />
                                    <button onClick={handleReply} disabled={sending || (!replyText.trim() && replyImages.length === 0)} style={{ backgroundColor: c.forest, color: '#fff', border: 'none', borderRadius: '12px', padding: '11px 18px', cursor: sending ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', flexShrink: 0 }}>
                                        <Send size={15} /> Reply
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
                            <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center', flexShrink: 0 }}>
                                <p style={{ margin: 0, fontSize: '13px', color: c.slate }}>This ticket is closed</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', backgroundColor: c.light }}>
                        <MessageCircle size={52} color="#cbd5e1" />
                        <p style={{ color: c.slate, fontWeight: '600', margin: 0 }}>Select a ticket to reply</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportAdmin;

