import React, { useState, useEffect, useRef } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import {
    Trash2, Utensils, IndianRupee, Tag,
    ToggleLeft, ToggleRight, Pencil, Check, X,
    ArrowLeft, Plus, Upload, Link, ChevronLeft, ChevronRight, Image
} from 'lucide-react';
import { getImageUrl } from '../utils/helpers';

const c = {
    forest: '#1a4331', peach: '#fcd5ce', chocolate: '#4a2c2a',
    white: '#ffffff', bg: '#f4f7fe', slate: '#64748b', light: '#f1f5f9',
    purple: '#4318FF',
};

const inp = {
    padding: '10px 14px', borderRadius: '10px', border: '1px solid #e0e5f2',
    backgroundColor: '#f8fafc', fontSize: '14px', outline: 'none',
    width: '100%', boxSizing: 'border-box', fontFamily: 'inherit',
};

// ── Image builder — used in both Add and Edit forms ──────────────────────────
const useImageBuilder = (initialImages = []) => {
    const [urlRows, setUrlRows] = useState(
        initialImages.length > 0 ? initialImages : ['']
    );
    const [fileRows, setFileRows] = useState([]);

    const addUrl    = ()        => setUrlRows(r => [...r, '']);
    const removeUrl = (i)       => setUrlRows(r => r.filter((_, idx) => idx !== i));
    const updateUrl = (i, val)  => setUrlRows(r => r.map((v, idx) => idx === i ? val : v));
    const addFile   = (files)   => setFileRows(r => [...r, ...Array.from(files)]);
    const removeFile= (i)       => setFileRows(r => r.filter((_, idx) => idx !== i));

    const buildFormData = (fields) => {
        const fd = new FormData();
        Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
        urlRows.filter(u => u.trim()).forEach(u => fd.append('urlImages', u.trim()));
        fileRows.forEach(f => fd.append('images', f));
        return fd;
    };

    const resetImages = () => { setUrlRows(['']); setFileRows([]); };
    return { urlRows, fileRows, addUrl, removeUrl, updateUrl, addFile, removeFile, buildFormData, resetImages };
};

// ── Small image carousel for product cards ───────────────────────────────────
const ImageCarousel = ({ images = [], unavailable }) => {
    const [idx, setIdx] = useState(0);
    const list = images.length > 0 ? images : [];

    if (list.length === 0) return (
        <div style={{ height: '190px', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Image size={40} color="#cbd5e1" />
        </div>
    );

    return (
        <div style={{ height: '190px', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
            <img
                src={getImageUrl(list[idx])}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.2s' }}
                onError={e => { e.target.src = 'https://placehold.co/400x200?text=No+Image'; }}
            />
            {unavailable && (
                <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ backgroundColor: '#ef4444', color: '#fff', fontWeight: '900', fontSize: '13px', padding: '6px 16px', borderRadius: '20px' }}>UNAVAILABLE</span>
                </div>
            )}
            {list.length > 1 && (
                <>
                    <button onClick={() => setIdx(i => (i - 1 + list.length) % list.length)}
                        style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setIdx(i => (i + 1) % list.length)}
                        style={{ position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'rgba(0,0,0,0.45)', color: '#fff', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronRight size={16} />
                    </button>
                    <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '4px' }}>
                        {list.map((_, i) => (
                            <div key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? '16px' : '6px', height: '6px', borderRadius: '3px', backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.5)', cursor: 'pointer', transition: '0.2s' }} />
                        ))}
                    </div>
                </>
            )}
            <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.92)', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', color: '#64748b' }}>
                {idx + 1}/{list.length}
            </div>
        </div>
    );
};

// ── Image input section (reused in both Add and Edit) ────────────────────────
const ImageInputSection = ({ urlRows, fileRows, addUrl, removeUrl, updateUrl, addFile, removeFile }) => {
    const fileRef = useRef();

    return (
        <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e0e5f2' }}>
            <p style={{ margin: '0 0 12px', fontSize: '13px', fontWeight: '700', color: c.slate, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Image size={14} /> Images (URL or upload — both optional, add as many as you want)
            </p>

            {urlRows.map((url, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, border: '1px solid #e0e5f2', borderRadius: '10px', backgroundColor: c.white, overflow: 'hidden' }}>
                        <div style={{ padding: '0 10px', color: c.slate, flexShrink: 0 }}><Link size={14} /></div>
                        <input
                            value={url}
                            onChange={e => updateUrl(i, e.target.value)}
                            placeholder={`Image URL ${i + 1} (optional)`}
                            style={{ ...inp, border: 'none', backgroundColor: 'transparent', padding: '10px 10px 10px 0' }}
                        />
                        {url && (
                            <img src={url} alt="" style={{ width: '36px', height: '36px', objectFit: 'cover', flexShrink: 0, margin: '4px' }}
                                onError={e => { e.target.style.display = 'none'; }} />
                        )}
                    </div>
                    <button type="button" onClick={() => removeUrl(i)}
                        style={{ border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', width: '34px', height: '34px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <X size={14} />
                    </button>
                </div>
            ))}

            <button type="button" onClick={addUrl}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px dashed #cbd5e1', background: 'none', color: c.slate, borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', fontSize: '13px', marginBottom: '12px' }}>
                <Plus size={13} /> Add another URL
            </button>

            <div style={{ borderTop: '1px dashed #e0e5f2', paddingTop: '12px' }}>
                <input ref={fileRef} type="file" multiple accept="image/*" style={{ display: 'none' }}
                    onChange={e => { addFile(e.target.files); e.target.value = ''; }} />
                <button type="button" onClick={() => fileRef.current.click()}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: c.white, border: '1px solid #e0e5f2', borderRadius: '10px', padding: '9px 16px', cursor: 'pointer', color: c.forest, fontWeight: '600', fontSize: '13px' }}>
                    <Upload size={14} /> Upload from device
                </button>

                {fileRows.length > 0 && (
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                        {fileRows.map((file, i) => (
                            <div key={i} style={{ position: 'relative' }}>
                                <img src={URL.createObjectURL(file)} alt=""
                                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e0e5f2' }} />
                                <button type="button" onClick={() => removeFile(i)}
                                    style={{ position: 'absolute', top: '-6px', right: '-6px', width: '18px', height: '18px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                                    ✕
                                </button>
                                <div style={{ fontSize: '10px', color: c.slate, textAlign: 'center', marginTop: '2px', maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// ────────────────────────────────────────────────────────────────────────────
const EditMenu = () => {
    const navigate = useNavigate();
    const [products, setProducts]   = useState([]);
    const [loading, setLoading]     = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [toast, setToast]         = useState('');

    const [addFields, setAddFields] = useState({ name: '', category: '', description: '', ingredients: '', shelfLife: '', instructions: '' });
    const [addWeights, setAddWeights] = useState([{ weight: '250gm', price: '' }]);
    const addImages = useImageBuilder([]);

    const [editFields, setEditFields] = useState({ name: '', category: '', description: '', ingredients: '', shelfLife: '', instructions: '' });
    const [editWeights, setEditWeights] = useState([]);
    const [editImages, setEditImages] = useState({ urlRows: [''], fileRows: [] });

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

    const fetchProducts = async () => {
        try {
            const { data } = await API.get('/products?all=true');
            setProducts(data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fd = addImages.buildFormData({
                name:        addFields.name,
                price:       addWeights[0]?.price || 0,
                category:    addFields.category,
                description: addFields.description,
                ingredients: addFields.ingredients,
                shelfLife:   addFields.shelfLife,
                instructions:addFields.instructions,
                weights:     JSON.stringify(addWeights),
                isAvailable: 'true',
            });
            await API.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setAddFields({ name: '', category: '', description: '', ingredients: '', shelfLife: '', instructions: '' });
            setAddWeights([{ weight: '250gm', price: '' }]);
            addImages.resetImages();
            fetchProducts();
            showToast('Dish published successfully');
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this dish from the live menu?')) return;
        try {
            await API.delete(`/products/${id}`);
            fetchProducts();
            showToast('Dish removed');
        } catch { alert('Error deleting dish'); }
    };

    const handleToggleAvailable = async (p) => {
        try {
            await API.put(`/products/${p._id}`, { isAvailable: !p.isAvailable });
            setProducts(prev => prev.map(x => x._id === p._id ? { ...x, isAvailable: !x.isAvailable } : x));
            showToast(`${p.name} marked ${!p.isAvailable ? 'Available' : 'Sold Out'}`);
        } catch { alert('Failed to update availability'); }
    };

    const handleToggleHidden = async (p) => {
        try {
            await API.put(`/products/${p._id}`, { isHidden: !p.isHidden });
            setProducts(prev => prev.map(x => x._id === p._id ? { ...x, isHidden: !x.isHidden } : x));
            showToast(`${p.name} is now ${!p.isHidden ? 'hidden from menu' : 'visible on menu'}`);
        } catch { alert('Failed to update visibility'); }
    };

    const startEdit = (p) => {
        setEditingId(p._id);
        setEditFields({ name: p.name, category: p.category, description: p.description, ingredients: p.ingredients || '', shelfLife: p.shelfLife || '', instructions: p.instructions || '' });
        setEditWeights(p.weights?.length ? p.weights : [{ weight: '250gm', price: p.price || '' }]);
        const existingUrls = (p.images || []).filter(img => img.startsWith('http'));
        setEditImages({
            urlRows: existingUrls.length > 0 ? existingUrls : [''],
            fileRows: [],
        });
    };

    const saveEdit = async (id) => {
        try {
            const fd = new FormData();
            fd.append('name',        editFields.name);
            fd.append('price',       editWeights[0]?.price || 0);
            fd.append('category',    editFields.category);
            fd.append('description', editFields.description);
            fd.append('ingredients', editFields.ingredients);
            fd.append('shelfLife',   editFields.shelfLife);
            fd.append('instructions',editFields.instructions);
            fd.append('weights',     JSON.stringify(editWeights));
            fd.append('isAvailable', 'true');

            editImages.urlRows.filter(u => u.trim()).forEach(u => fd.append('urlImages', u.trim()));
            editImages.fileRows.forEach(f => fd.append('images', f));

            await API.put(`/products/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setEditingId(null);
            fetchProducts();
            showToast('Changes saved');
        } catch (err) {
            alert('Failed to save: ' + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div style={{ padding: '40px 50px', fontFamily: "'Inter', sans-serif", backgroundColor: c.bg, minHeight: '100vh', color: '#1b2559' }}>
            {toast && (
                <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: c.forest, color: '#fff', padding: '14px 28px', borderRadius: '50px', fontWeight: 'bold', zIndex: 999, fontSize: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    ✓ {toast}
                </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '36px' }}>
                <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', padding: '10px', backgroundColor: c.white, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                    <ArrowLeft size={20} color={c.forest} />
                </div>
                <div style={{ backgroundColor: c.purple, padding: '12px', borderRadius: '14px' }}>
                    <Utensils color="#fff" size={26} />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '900' }}>True Eats Menu</h1>
                    <p style={{ margin: 0, fontSize: '13px', color: c.slate }}>{products.length} items · Toggle availability, edit details, or add new items</p>
                </div>
            </div>

            <div style={{ backgroundColor: c.white, padding: '32px', borderRadius: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.04)', marginBottom: '40px', border: '1px solid #e0e5f2' }}>
                <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px', color: c.forest, fontSize: '16px', fontWeight: '800' }}>
                    <Plus size={18} /> Add New Item
                </h3>
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '14px' }}>
                        <input style={inp} placeholder="Dish Name" value={addFields.name} onChange={e => setAddFields({ ...addFields, name: e.target.value })} required />
                        <input style={inp} placeholder="Category (e.g. Starters)" value={addFields.category} onChange={e => setAddFields({ ...addFields, category: e.target.value })} required />
                        <textarea style={{ ...inp, height: '44px', resize: 'none' }} placeholder="Description..." value={addFields.description} onChange={e => setAddFields({ ...addFields, description: e.target.value })} required />
                        <input style={inp} placeholder="Ingredients" value={addFields.ingredients} onChange={e => setAddFields({ ...addFields, ingredients: e.target.value })} />
                        <input style={inp} placeholder="Shelf Life (e.g. 2 Months)" value={addFields.shelfLife} onChange={e => setAddFields({ ...addFields, shelfLife: e.target.value })} />
                        <textarea style={{ ...inp, height: '44px', resize: 'none' }} placeholder="Instructions..." value={addFields.instructions} onChange={e => setAddFields({ ...addFields, instructions: e.target.value })} />
                        
                        <div style={{ gridColumn: '1 / -1', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e0e5f2' }}>
                            <label style={{ fontSize: '13px', fontWeight: '700', color: c.slate, display: 'block', marginBottom: '8px' }}>Weights & Pricing</label>
                            {addWeights.map((w, i) => (
                                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                                    <input style={{ ...inp, flex: 1 }} placeholder="Weight (e.g. 250gm)" value={w.weight} onChange={e => { const nw = [...addWeights]; nw[i].weight = e.target.value; setAddWeights(nw); }} required />
                                    <input style={{ ...inp, flex: 1 }} type="number" placeholder="Price (₹)" value={w.price} onChange={e => { const nw = [...addWeights]; nw[i].price = e.target.value; setAddWeights(nw); }} required />
                                    {addWeights.length > 1 && (
                                        <button type="button" onClick={() => setAddWeights(addWeights.filter((_, idx) => idx !== i))} style={{ border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '8px', padding: '0 12px', cursor: 'pointer' }}><X size={14}/></button>
                                    )}
                                </div>
                            ))}
                            <button type="button" onClick={() => setAddWeights([...addWeights, { weight: '', price: '' }])} style={{ background: 'none', border: '1px dashed #cbd5e1', color: c.slate, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>+ Add another weight</button>
                        </div>
                    </div>

                    <ImageInputSection
                        urlRows={addImages.urlRows}
                        fileRows={addImages.fileRows}
                        addUrl={addImages.addUrl}
                        removeUrl={addImages.removeUrl}
                        updateUrl={addImages.updateUrl}
                        addFile={addImages.addFile}
                        removeFile={addImages.removeFile}
                    />

                    <button type="submit" style={{ width: '100%', marginTop: '16px', padding: '16px', backgroundColor: c.purple, color: '#fff', border: 'none', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(67,24,255,0.2)' }}>
                        Publish Item
                    </button>
                </form>
            </div>

            {loading ? (
                <p style={{ textAlign: 'center', color: c.slate, padding: '40px' }}>Loading menu...</p>
            ) : products.length === 0 ? (
                <p style={{ textAlign: 'center', color: c.slate, padding: '40px' }}>No items yet. Add your first dish above.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))', gap: '28px' }}>
                    {products.map(p => {
                        const isEditing = editingId === p._id;
                        const images = p.images || (p.image ? [p.image] : []);

                        return (
                            <div key={p._id} style={{
                                backgroundColor: c.white, borderRadius: '20px', overflow: 'hidden',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
                                border: `2px solid ${p.isHidden ? '#fef3c7' : !p.isAvailable ? '#fecdd3' : '#eef2f6'}`,
                                opacity: p.isHidden ? 0.7 : p.isAvailable ? 1 : 0.85, transition: '0.2s'
                            }}>

                                {!isEditing && (
                                    <div style={{ position: 'relative' }}>
                                        <ImageCarousel images={images} unavailable={!p.isAvailable} />
                                        <div style={{ position: 'absolute', bottom: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.92)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', color: c.purple, display: 'flex', alignItems: 'center', gap: '4px', zIndex: 2 }}>
                                            <Tag size={10} /> {p.category}
                                        </div>
                                        <button onClick={() => handleDelete(p._id)} style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#fff', border: 'none', borderRadius: '10px', width: '34px', height: '34px', cursor: 'pointer', color: '#ff5c5c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', zIndex: 2 }}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                )}

                                <div style={{ padding: '20px' }}>
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input value={editFields.name} onChange={e => setEditFields({ ...editFields, name: e.target.value })} style={inp} placeholder="Name" />
                                            <input value={editFields.category} onChange={e => setEditFields({ ...editFields, category: e.target.value })} style={inp} placeholder="Category" />
                                            <textarea value={editFields.description} onChange={e => setEditFields({ ...editFields, description: e.target.value })} style={{ ...inp, height: '60px', resize: 'none' }} placeholder="Description" />
                                            <input value={editFields.ingredients} onChange={e => setEditFields({ ...editFields, ingredients: e.target.value })} style={inp} placeholder="Ingredients" />
                                            <input value={editFields.shelfLife} onChange={e => setEditFields({ ...editFields, shelfLife: e.target.value })} style={inp} placeholder="Shelf Life" />
                                            <textarea value={editFields.instructions} onChange={e => setEditFields({ ...editFields, instructions: e.target.value })} style={{ ...inp, height: '40px', resize: 'none' }} placeholder="Instructions" />
                                            
                                            <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e0e5f2' }}>
                                                <label style={{ fontSize: '12px', fontWeight: '700', color: c.slate, display: 'block', marginBottom: '6px' }}>Weights & Pricing</label>
                                                {editWeights.map((w, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                                                        <input style={{ ...inp, flex: 1, padding: '6px 10px' }} placeholder="Weight" value={w.weight} onChange={e => { const nw = [...editWeights]; nw[i].weight = e.target.value; setEditWeights(nw); }} required />
                                                        <input style={{ ...inp, flex: 1, padding: '6px 10px' }} type="number" placeholder="Price ₹" value={w.price} onChange={e => { const nw = [...editWeights]; nw[i].price = e.target.value; setEditWeights(nw); }} required />
                                                        {editWeights.length > 1 && (
                                                            <button type="button" onClick={() => setEditWeights(editWeights.filter((_, idx) => idx !== i))} style={{ border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', padding: '0 8px', cursor: 'pointer' }}><X size={12}/></button>
                                                        )}
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => setEditWeights([...editWeights, { weight: '', price: '' }])} style={{ background: 'none', border: '1px dashed #cbd5e1', color: c.slate, padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}>+ Add Weight</button>
                                            </div>

                                            <div style={{ backgroundColor: '#f8fafc', borderRadius: '12px', padding: '14px', border: '1px solid #e0e5f2' }}>
                                                <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: '700', color: c.slate }}>IMAGES (edit or replace)</p>
                                                {editImages.urlRows.map((url, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', flex: 1, border: '1px solid #e0e5f2', borderRadius: '8px', backgroundColor: c.white, overflow: 'hidden' }}>
                                                            <div style={{ padding: '0 8px', color: c.slate }}><Link size={13} /></div>
                                                            <input value={url} onChange={e => setEditImages(prev => ({ ...prev, urlRows: prev.urlRows.map((v, idx) => idx === i ? e.target.value : v) }))}
                                                                placeholder="Image URL" style={{ ...inp, border: 'none', backgroundColor: 'transparent', padding: '8px 8px 8px 0', fontSize: '13px' }} />
                                                            {url && <img src={url} alt="" style={{ width: '30px', height: '30px', objectFit: 'cover', margin: '4px', borderRadius: '4px' }} onError={e => { e.target.style.display = 'none'; }} />}
                                                        </div>
                                                        <button type="button" onClick={() => setEditImages(prev => ({ ...prev, urlRows: prev.urlRows.filter((_, idx) => idx !== i) }))}
                                                            style={{ border: 'none', background: '#fee2e2', color: '#ef4444', borderRadius: '6px', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button type="button" onClick={() => setEditImages(prev => ({ ...prev, urlRows: [...prev.urlRows, ''] }))}
                                                    style={{ fontSize: '12px', border: '1px dashed #cbd5e1', background: 'none', color: c.slate, borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', marginBottom: '8px' }}>
                                                    <Plus size={11} style={{ marginRight: '4px' }} /> Add URL
                                                </button>

                                                <div>
                                                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: c.white, border: '1px solid #e0e5f2', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer', fontSize: '12px', color: c.forest, fontWeight: '600' }}>
                                                        <Upload size={12} /> Upload from device
                                                        <input type="file" multiple accept="image/*" style={{ display: 'none' }}
                                                            onChange={e => { setEditImages(prev => ({ ...prev, fileRows: [...prev.fileRows, ...Array.from(e.target.files)] })); e.target.value = ''; }} />
                                                    </label>
                                                    {editImages.fileRows.length > 0 && (
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                                                            {editImages.fileRows.map((file, i) => (
                                                                <div key={i} style={{ position: 'relative' }}>
                                                                    <img src={URL.createObjectURL(file)} alt="" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                                                                    <button type="button" onClick={() => setEditImages(prev => ({ ...prev, fileRows: prev.fileRows.filter((_, idx) => idx !== i) }))}
                                                                        style={{ position: 'absolute', top: '-5px', right: '-5px', width: '16px', height: '16px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', cursor: 'pointer', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => saveEdit(p._id)} style={{ flex: 1, padding: '10px', backgroundColor: c.forest, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
                                                    <Check size={15} /> Save Changes
                                                </button>
                                                <button onClick={() => setEditingId(null)} style={{ flex: 1, padding: '10px', backgroundColor: c.light, color: c.slate, border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '13px' }}>
                                                    <X size={15} /> Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: c.chocolate }}>{p.name}</h3>
                                                <div style={{ color: c.purple, fontWeight: '900', fontSize: '15px', display: 'flex', alignItems: 'center' }}>
                                                    <IndianRupee size={13} />{p.weights?.[0]?.price || p.price || 0}
                                                    {p.weights?.length > 1 && <span style={{ fontSize: '11px', color: c.slate, marginLeft: '4px', fontWeight: 'normal' }}>+</span>}
                                                </div>
                                            </div>
                                            <p style={{ color: '#a3aed0', fontSize: '13px', lineHeight: '1.5', margin: '0 0 14px', height: '38px', overflow: 'hidden' }}>{p.description}</p>
                                            <div style={{ fontSize: '11px', color: c.slate, marginBottom: '12px' }}>
                                                {images.length} image{images.length !== 1 ? 's' : ''}
                                            </div>

                                            {/* Status Tags */}
                                            <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                                                {p.isHidden && (
                                                    <span style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>🙈 Hidden from Menu</span>
                                                )}
                                                {!p.isAvailable && (
                                                    <span style={{ backgroundColor: '#fecdd3', color: '#9f1239', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>🚫 Sold Out</span>
                                                )}
                                                {!p.isHidden && p.isAvailable && (
                                                    <span style={{ backgroundColor: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '20px' }}>✅ Live</span>
                                                )}
                                            </div>

                                            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {/* Sold Out Toggle */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: '600', color: c.slate }}>Sold Out (shows on menu)</span>
                                                    <button onClick={() => handleToggleAvailable(p)} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                                                        {!p.isAvailable
                                                            ? <><ToggleRight size={28} color="#ef4444" /><span style={{ fontSize: '11px', fontWeight: '700', color: '#ef4444' }}>Sold Out</span></>
                                                            : <><ToggleLeft size={28} color="#cbd5e1" /><span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>In Stock</span></>
                                                        }
                                                    </button>
                                                </div>
                                                {/* Hide from Menu Toggle */}
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <span style={{ fontSize: '12px', fontWeight: '600', color: c.slate }}>Hide from Menu</span>
                                                    <button onClick={() => handleToggleHidden(p)} style={{ display: 'flex', alignItems: 'center', gap: '5px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}>
                                                        {p.isHidden
                                                            ? <><ToggleRight size={28} color="#f59e0b" /><span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b' }}>Hidden</span></>
                                                            : <><ToggleLeft size={28} color="#cbd5e1" /><span style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>Visible</span></>
                                                        }
                                                    </button>
                                                </div>
                                                {/* Edit Button */}
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                                                    <button onClick={() => startEdit(p)} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eef2ff', color: c.purple, border: 'none', padding: '7px 13px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
                                                        <Pencil size={12} /> Edit
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EditMenu;
