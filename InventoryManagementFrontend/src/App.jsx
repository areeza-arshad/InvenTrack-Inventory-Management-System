
import { useEffect, useState } from "react";

const API = "http://localhost:5267/api/Products";

function App() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", price: "", quantity: "" });
  const [notification, setNotification] = useState("");

  const fetchProducts = async () => {
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load products");
      setProducts(await response.json());
      setError("");
    } catch {
      setError("Couldn't load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddForm = () => {
    setEditingId(null);
    setForm({ name: "", price: "", quantity: "" });
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      price: product.price,
      quantity: product.quantity,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const product = {
      name: form.name.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    try {
      const response = await fetch(
        editingId ? `${API}/${editingId}` : API,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            editingId ? { id: editingId, ...product } : product
          ),
        }
      );

      if (!response.ok) throw new Error("Save failed");

      setNotification(editingId ? "Product updated successfully!" : "Product added successfully!");
      setShowForm(false);
      setForm({ name: "", price: "", quantity: "" });
      setEditingId(null);
      await fetchProducts();
    } catch {
      setError("Product not saved. Try again.");
      setNotification("Something went wrong. Please try again.");
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Do you want to delete this?")) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      await fetchProducts();
      setNotification("Product deleted successfully!");
    } catch {
      setError("Product could not be deleted.");
      setNotification("Product could not be deleted.");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
  const inventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-[#e8edf3] p-4 text-slate-700 md:p-7">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row">
        <aside className="rounded-3xl bg-[#e8edf3] p-6 shadow-[8px_8px_16px_#c5cbd2,-8px_-8px_16px_#ffffff] md:min-h-[85vh] md:w-60">
          <h2 className="mb-10 text-2xl font-bold text-blue-600">InvenTrack</h2>
          <p className="mb-4 text-xs font-semibold tracking-widest text-slate-400">MENU</p>
          <div className="rounded-xl p-4 font-semibold text-blue-600 shadow-[inset_4px_4px_8px_#c5cbd2,inset_-4px_-4px_8px_#ffffff]">
            Dashboard
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          {notification && (
            <div className="mb-5 flex items-center justify-between rounded-xl bg-green-100 px-5 py-3 text-sm font-semibold text-green-700">
              <span>{notification}</span>
              <button onClick={() => setNotification("")}>✕</button>
            </div>
          )}
          <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="mt-2 text-sm text-slate-400">
                Welcome back! Here's your inventory overview.
              </p>
            </div>
            <div className="rounded-xl px-6 py-3 shadow-[5px_5px_10px_#c5cbd2,-5px_-5px_10px_#ffffff]">
              Admin
            </div>
          </header>

          <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[
              ["Total Products", products.length],
              ["Total Stock", totalStock],
              ["Inventory Value", `Rs. ${inventoryValue.toLocaleString()}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl p-6 shadow-[7px_7px_14px_#c5cbd2,-7px_-7px_14px_#ffffff]">
                <p className="text-sm text-slate-400">{label}</p>
                <h2 className="mt-4 text-3xl font-bold text-blue-600">{value}</h2>
              </div>
            ))}
          </section>

          <section className="rounded-2xl p-5 shadow-[7px_7px_14px_#c5cbd2,-7px_-7px_14px_#ffffff] md:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold">Products</h2>
                <p className="mt-1 text-sm text-slate-400">Manage your inventory</p>
              </div>
              <button onClick={openAddForm} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                + Add Product
              </button>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="mb-6 w-full rounded-xl border-0 bg-[#e8edf3] px-4 py-3 outline-none shadow-[inset_4px_4px_8px_#c5cbd2,inset_-4px_-4px_8px_#ffffff] md:max-w-sm"
            />

            {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

            {loading ? (
              <p>Loading products...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-400">
                      <th className="p-3">ID</th>
                      <th className="p-3">Product</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">Quantity</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="border-b border-slate-200">
                        <td className="p-3">#{p.id}</td>
                        <td className="p-3 font-semibold">{p.name}</td>
                        <td className="p-3">Rs. {p.price.toLocaleString()}</td>
                        <td className="p-3">{p.quantity}</td>
                        <td className="p-2 sm:p-3">
                          <span
                            className={`inline-flex whitespace-nowrap rounded-full px-2 py-1 text-[10px] font-semibold sm:px-3 sm:py-2 sm:text-xs ${
                              p.quantity === 0
                                ? "bg-red-100 text-red-700"
                                : p.quantity <= 5
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {p.quantity === 0
                              ? "Out of Stock"
                              : p.quantity <= 5
                                ? "Low Stock"
                                : "In Stock"}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button onClick={() => openEditForm(p)} className="rounded-lg bg-blue-100 px-3 py-2 text-blue-700">Edit</button>
                            <button onClick={() => deleteProduct(p.id)} className="rounded-lg bg-red-100 px-3 py-2 text-red-700">Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredProducts.length === 0 && (
                  <p className="p-5 text-center text-slate-400">No products found.</p>
                )}
              </div>
            )}
          </section>
        </main>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-[#e8edf3] p-7 shadow-2xl">
            <h2 className="mb-6 text-2xl font-bold">
              {editingId ? "Edit Product" : "Add Product"}
            </h2>

            <label className="mb-2 block text-sm">Product Name</label>
            <input
              required
              maxLength={100}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mb-4 w-full rounded-xl bg-[#e8edf3] p-3 outline-none shadow-[inset_4px_4px_8px_#c5cbd2,inset_-4px_-4px_8px_#ffffff]"
            />

            <label className="mb-2 block text-sm">Price</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="mb-4 w-full rounded-xl bg-[#e8edf3] p-3 outline-none shadow-[inset_4px_4px_8px_#c5cbd2,inset_-4px_-4px_8px_#ffffff]"
            />

            <label className="mb-2 block text-sm">Quantity</label>
            <input
              required
              type="number"
              min="0"
              step="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="mb-6 w-full rounded-xl bg-[#e8edf3] p-3 outline-none shadow-[inset_4px_4px_8px_#c5cbd2,inset_-4px_-4px_8px_#ffffff]"
            />

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl px-5 py-3 text-slate-600">
                Cancel
              </button>
              <button type="submit" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white">
                Save Product
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
