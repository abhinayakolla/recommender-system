import React, { useEffect, useState } from "react";
import { getItems, createItem, updateItem, deleteItem } from "../utils/api";
import { useAuth } from "../store/AuthContext";

const EMPTY = { title: "", description: "", category: "", tags: "", imageUrl: "" };
const CATEGORIES = ["AI/ML","Backend","Frontend","Database","DevOps","Data Engineering","Other"];

export default function Items() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState("");

  const load = () => {
    setLoading(true);
    getItems({ page, search, category, limit: 12 }).then(r => { setItems(r.data.items); setTotal(r.data.total); }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, search, category]);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item, tags: item.tags?.join(",") || "" }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) };
    try {
      if (editItem) await updateItem(editItem._id, payload); else await createItem(payload);
      setShowForm(false); setMsg(editItem ? "Item updated!" : "Item created!"); load();
    } catch (err) { setMsg(err.response?.data?.message || "Error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    await deleteItem(id); load();
  };

  return (
    <div className="page">
      <div className="page-header" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"1rem"}}>
        <div><h1 className="page-title">Browse Items</h1><p className="page-subtitle">{total} items in catalogue</p></div>
        {user?.role === "admin" && <button className="btn btn-primary" onClick={openCreate}>+ Add Item</button>}
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      {/* Filters */}
      <div style={{display:"flex",gap:"0.75rem",marginBottom:"1.5rem",flexWrap:"wrap"}}>
        <input className="form-input" placeholder="Search..." style={{flex:1,minWidth:"180px"}} value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}} />
        <select className="form-select" value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"3rem",color:"var(--muted)"}}>Loading...</div>
      : (
        <div className="grid-3">
          {items.map(item => (
            <div key={item._id} className="item-card">
              <img src={item.imageUrl || `https://picsum.photos/seed/${item._id}/400/200`} alt={item.title} />
              <div className="item-card-body">
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"0.4rem"}}>
                  <span className="badge badge-purple">{item.category}</span>
                  <span style={{fontSize:"0.75rem",color:"var(--muted)"}} className="mono">👁 {item.views}</span>
                </div>
                <div className="item-card-title">{item.title}</div>
                <div className="item-card-desc">{item.description?.slice(0,80)}...</div>
                <div style={{display:"flex",gap:"0.3rem",flexWrap:"wrap",marginBottom:"0.5rem"}}>
                  {item.tags?.slice(0,3).map(t=><span key={t} className="badge badge-amber">{t}</span>)}
                </div>
                {user?.role === "admin" && (
                  <div style={{display:"flex",gap:"0.5rem"}}>
                    <button className="btn btn-secondary btn-sm" onClick={()=>openEdit(item)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={()=>handleDelete(item._id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div style={{display:"flex",justifyContent:"center",gap:"0.5rem",marginTop:"2rem"}}>
        {page>1 && <button className="btn btn-secondary btn-sm" onClick={()=>setPage(p=>p-1)}>← Prev</button>}
        <span style={{padding:"0.3rem 0.7rem",color:"var(--muted)",fontSize:"0.85rem"}}>Page {page}</span>
        {items.length===12 && <button className="btn btn-secondary btn-sm" onClick={()=>setPage(p=>p+1)}>Next →</button>}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:"1rem"}}>
          <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"16px",padding:"2rem",width:"100%",maxWidth:"480px"}}>
            <h2 style={{marginBottom:"1.5rem",fontSize:"1.1rem",fontWeight:800}}>{editItem?"Edit Item":"Add Item"}</h2>
            <form onSubmit={handleSubmit}>
              {[["title","Title"],["description","Description"],["category","Category"],["tags","Tags (comma-separated)"],["imageUrl","Image URL"]].map(([key,label])=>(
                <div key={key} className="form-group">
                  <label className="form-label">{label}</label>
                  {key==="category"
                    ? <select className="form-select" value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required><option value="">Select...</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
                    : key==="description"
                      ? <textarea className="form-input" rows={3} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={{resize:"vertical"}} />
                      : <input className="form-input" value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required={key==="title"} />
                  }
                </div>
              ))}
              <div style={{display:"flex",gap:"0.75rem",marginTop:"0.5rem"}}>
                <button type="submit" className="btn btn-primary" style={{flex:1}}>{editItem?"Update":"Create"}</button>
                <button type="button" className="btn btn-secondary" onClick={()=>setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
