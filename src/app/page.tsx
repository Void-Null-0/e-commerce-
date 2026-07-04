'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCartStore } from '@/store/cart-store'
import { useAppStore } from '@/store/app-store'
import { ProductCard } from '@/components/store/product-card'
import { CartDrawer } from '@/components/store/cart-drawer'
import {
  ShoppingCart, Search, SlidersHorizontal, LayoutDashboard, Store, Package, ClipboardList,
  BarChart3, DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Plus, Pencil, Trash2,
  Eye, X, ChevronDown, RefreshCw, Star, Zap, Truck, Shield
} from 'lucide-react'

// ── Types ──
export interface ProductWithCategory {
  id: string; name: string; description: string; price: number; comparePrice: number | null
  image: string; categoryId: string; sku: string; stock: number; featured: boolean
  active: boolean; createdAt: string; category: { id: string; name: string; slug: string }
}

interface Category { id: string; name: string; slug: string; _count: { products: number } }

interface Order {
  id: string; orderNumber: string; customerName: string; customerEmail: string
  status: string; total: number; createdAt: string
  items: { id: string; quantity: number; price: number; product: { name: string; image: string } }[]
}

// ── Main Page ──
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0C0516]">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Header />
      <main id="main-content" className="flex-1" role="main">
        <AppContent />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  )
}

// ── Header ──
function Header() {
  const { view, setView } = useAppStore()
  const itemCount = useCartStore((s) => s.itemCount)
  const toggleCart = useCartStore((s) => s.toggleCart)

  return (
    <header className="sticky top-0 z-40 glass-strong animate-fade-in-down" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3" aria-label="ShopFlow logo">
            <span className="text-xl font-bold tracking-tight text-gradient">ShopFlow</span>
          </div>

          <nav className="flex items-center gap-1" role="navigation" aria-label="Main navigation">
            <button
              onClick={() => setView('store')}
              aria-current={view === 'store' ? 'page' : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-flow ${view === 'store' ? 'bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white shadow-lg shadow-[#7F3AA1]/20' : 'text-[#A78BBF] hover:text-[#F0E6F6] hover:bg-white/5'}`}
            >
              <Store className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Store</span>
            </button>
            <button
              onClick={() => setView('admin')}
              aria-current={view === 'admin' ? 'page' : undefined}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-flow ${view === 'admin' ? 'bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white shadow-lg shadow-[#7F3AA1]/20' : 'text-[#A78BBF] hover:text-[#F0E6F6] hover:bg-white/5'}`}
            >
              <LayoutDashboard className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </nav>

          <button
            onClick={toggleCart}
            className="relative p-2.5 rounded-xl text-[#A78BBF] hover:text-[#F0E6F6] hover:bg-white/5 transition-flow"
            aria-label={`Shopping cart${itemCount() > 0 ? `, ${itemCount()} items` : ''}`}
          >
            <ShoppingCart className="w-5 h-5" aria-hidden="true" />
            {itemCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-[#7F3AA1]/30 animate-scale-in" role="status" aria-label={`${itemCount()} items in cart`}>
                {itemCount() > 9 ? '9+' : itemCount()}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

// ── App Content Router ──
function AppContent() {
  const { view } = useAppStore()
  return view === 'store' ? <StoreFront /> : <AdminDashboard />
}

// ═══════════════════════════════════════════════════════════════
// STOREFRONT
// ═══════════════════════════════════════════════════════════════
function StoreFront() {
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useCartStore((s) => s.setCartOpen)

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      if (sortBy) params.set('sort', sortBy)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data)
    } catch (e) {
      console.error('Failed to fetch products:', e)
    } finally {
      setLoading(false)
    }
  }, [search, selectedCategory, sortBy])

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then(setCategories).catch(console.error)
  }, [])

  useEffect(() => { setLoading(true); fetchProducts() }, [fetchProducts])

  const handleAddToCart = (product: ProductWithCategory) => {
    addItem({ productId: product.id, name: product.name, price: product.price, image: product.image, stock: product.stock })
    setCartOpen(true)
  }

  const featuredProducts = products.filter((p) => p.featured)

  return (
    <div>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden" aria-label="Hero banner">
        <div className="absolute inset-0 bg-gradient-hero animate-gradient-shift" />
        {/* Animated orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-20 left-[10%] w-80 h-80 bg-[#7F3AA1]/20 rounded-full blur-[100px] animate-glow-pulse" />
          <div className="absolute bottom-10 right-[10%] w-96 h-96 bg-[#5416B5]/25 rounded-full blur-[120px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#7F3AA1]/8 rounded-full blur-[150px]" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-white/8 backdrop-blur-sm border border-white/10 px-4 py-1.5 rounded-full text-sm mb-8 text-[#C39BD3]">
              <Star className="w-3.5 h-3.5 text-[#C39BD3] fill-[#C39BD3]" aria-hidden="true" />
              <span>New arrivals are here</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-5 text-white">
              Discover Products<br />
              <span className="text-gradient">You&apos;ll Love</span>
            </h1>
            <p className="text-lg text-[#A78BBF] mb-10 max-w-lg leading-relaxed">
              Curated collections of premium products. From tech to fashion, find everything you need with free shipping on all orders.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#products" className="bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white px-7 py-3.5 rounded-xl font-semibold hover:shadow-xl hover:shadow-[#7F3AA1]/25 transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]">
                Shop Now
              </a>
              <a href="#featured" className="border border-[#7F3AA1]/40 text-[#C39BD3] px-7 py-3.5 rounded-xl font-semibold hover:bg-[#7F3AA1]/10 hover:border-[#7F3AA1]/60 transition-all duration-300">
                Featured
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="border-b border-[#2D1F45]/60" aria-label="Store benefits">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: 'Free Shipping', desc: 'On all orders' },
              { icon: Shield, label: 'Secure Payment', desc: 'SSL encrypted' },
              { icon: RefreshCw, label: 'Easy Returns', desc: '30-day policy' },
              { icon: Star, label: 'Premium Quality', desc: 'Handpicked items' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 group">
                <div className="w-10 h-10 bg-[#7F3AA1]/10 border border-[#7F3AA1]/20 rounded-xl flex items-center justify-center flex-shrink-0 transition-flow group-hover:bg-[#7F3AA1]/20 group-hover:border-[#7F3AA1]/30">
                  <Icon className="w-5 h-5 text-[#7F3AA1]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F0E6F6]">{label}</p>
                  <p className="text-xs text-[#A78BBF]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" aria-labelledby="featured-heading">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 id="featured-heading" className="text-2xl font-bold text-[#F0E6F6]">Featured Products</h2>
              <p className="text-sm text-[#A78BBF] mt-1">Handpicked by our team</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── All Products ── */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14" aria-labelledby="products-heading">
        <div className="flex items-center justify-between mb-8">
          <h2 id="products-heading" className="text-2xl font-bold text-[#F0E6F6]">All Products</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-[#2D1F45] rounded-xl text-sm text-[#A78BBF] hover:bg-[#7F3AA1]/10 hover:border-[#7F3AA1]/30 transition-flow sm:hidden"
            aria-expanded={showFilters}
            aria-controls="filters-panel"
          >
            <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
            Filters
          </button>
        </div>

        {/* Filters Bar */}
        <div id="filters-panel" className={`${showFilters ? 'block animate-fade-in-down' : 'hidden'} sm:block mb-8 p-5 bg-[#150D24]/80 backdrop-blur-sm rounded-2xl border border-[#2D1F45]/60 glow-border`} role="search" aria-label="Product filters">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A78BBF]" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
                className="w-full pl-10 pr-4 py-2.5 border border-[#2D1F45] bg-[#0C0516] rounded-xl text-sm text-[#F0E6F6] placeholder-[#A78BBF]/50 focus:outline-none focus:ring-2 focus:ring-[#7F3AA1]/50 focus:border-[#7F3AA1]/50 transition-all"
              />
            </div>
            <div className="relative">
              <label htmlFor="category-filter" className="sr-only">Filter by category</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 appearance-none border border-[#2D1F45] bg-[#0C0516] px-3 py-2.5 rounded-xl text-sm text-[#F0E6F6] focus:outline-none focus:ring-2 focus:ring-[#7F3AA1]/50 pr-8 transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name} ({c._count.products})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A78BBF] pointer-events-none" aria-hidden="true" />
            </div>
            <div className="relative">
              <label htmlFor="sort-filter" className="sr-only">Sort products</label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-44 appearance-none border border-[#2D1F45] bg-[#0C0516] px-3 py-2.5 rounded-xl text-sm text-[#F0E6F6] focus:outline-none focus:ring-2 focus:ring-[#7F3AA1]/50 pr-8 transition-all"
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A78BBF] pointer-events-none" aria-hidden="true" />
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" role="status" aria-label="Loading products">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-[#150D24] animate-pulse rounded-2xl aspect-square border border-[#2D1F45]/40" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20" role="status">
            <Package className="w-16 h-16 text-[#7F3AA1]/20 mx-auto mb-4" aria-hidden="true" />
            <p className="text-lg font-medium text-[#F0E6F6]">No products found</p>
            <p className="text-sm text-[#A78BBF] mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" role="list" aria-label="Product list">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════════
function AdminDashboard() {
  const { adminTab, setAdminTab } = useAppStore()
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, totalProducts: 0, lowStock: 0 })
  const [products, setProducts] = useState<ProductWithCategory[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const [prodRes, ordRes, catRes] = await Promise.all([
        fetch('/api/admin/products'), fetch('/api/orders'), fetch('/api/categories'),
      ])
      const prods = await prodRes.json()
      const ords = await ordRes.json()
      const cats = await catRes.json()
      setProducts(prods); setOrders(ords); setCategories(cats)
      setStats({
        totalRevenue: ords.reduce((s: number, o: Order) => s + o.total, 0),
        totalOrders: ords.length,
        totalProducts: prods.length,
        lowStock: prods.filter((p: ProductWithCategory) => p.stock <= 10).length,
      })
    } catch (e) { console.error('Failed to load admin data:', e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])
  useEffect(() => {
    const handler = () => { refresh() }
    window.addEventListener('inventory-update', handler)
    return () => window.removeEventListener('inventory-update', handler)
  }, [refresh])

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
    { id: 'products' as const, label: 'Products', icon: Package },
    { id: 'orders' as const, label: 'Orders', icon: ClipboardList },
  ]

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status" aria-label="Loading dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-[#150D24] animate-pulse rounded-2xl border border-[#2D1F45]/40" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#F0E6F6]">Admin Dashboard</h1>
          <p className="text-sm text-[#A78BBF] mt-1">Manage your store products and orders</p>
        </div>
        <button
          onClick={refresh}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#2D1F45] rounded-xl text-sm text-[#A78BBF] hover:bg-[#7F3AA1]/10 hover:border-[#7F3AA1]/30 transition-flow"
          aria-label="Refresh dashboard data"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#150D24] p-1.5 rounded-2xl mb-8 w-fit border border-[#2D1F45]/60" role="tablist" aria-label="Dashboard sections">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={adminTab === id}
            aria-controls={`tabpanel-${id}`}
            onClick={() => setAdminTab(id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-flow ${adminTab === id ? 'bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white shadow-lg shadow-[#7F3AA1]/20' : 'text-[#A78BBF] hover:text-[#F0E6F6] hover:bg-white/5'}`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`tabpanel-${adminTab}`}>
        {adminTab === 'overview' && <OverviewTab stats={stats} orders={orders} products={products} />}
        {adminTab === 'products' && <ProductsTab products={products} categories={categories} refresh={refresh} />}
        {adminTab === 'orders' && <OrdersTab orders={orders} refresh={refresh} />}
      </div>
    </div>
  )
}

// ── Overview Tab ──
function OverviewTab({ stats, orders, products }: { stats: { totalRevenue: number; totalOrders: number; totalProducts: number; lowStock: number }; orders: Order[]; products: ProductWithCategory[] }) {
  const recentOrders = orders.slice(0, 5)
  const topProducts = [...products].sort((a, b) => b.price - a.price).slice(0, 5)
  const statusStyles: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    processing: 'bg-sky-500/15 text-sky-400 border border-sky-500/20',
    shipped: 'bg-[#7F3AA1]/15 text-[#C39BD3] border border-[#7F3AA1]/20',
    completed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border border-red-500/20',
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, change: '+12.5%', up: true, gradient: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/20', iconColor: 'text-emerald-400' },
          { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ClipboardList, change: '+8.2%', up: true, gradient: 'from-sky-500/20 to-sky-600/5 border-sky-500/20', iconColor: 'text-sky-400' },
          { label: 'Total Products', value: stats.totalProducts.toString(), icon: Package, change: '+3', up: true, gradient: 'from-[#7F3AA1]/20 to-[#5416B5]/5 border-[#7F3AA1]/20', iconColor: 'text-[#C39BD3]' },
          { label: 'Low Stock Items', value: stats.lowStock.toString(), icon: TrendingUp, change: 'Alert', up: false, gradient: 'from-amber-500/20 to-amber-600/5 border-amber-500/20', iconColor: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, change, up, gradient, iconColor }, i) => (
          <div key={label} className={`bg-gradient-to-br ${gradient} border rounded-2xl p-5 animate-fade-in-up`} style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-[#0C0516]/50`}>
                <Icon className={`w-5 h-5 ${iconColor}`} aria-hidden="true" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${up ? 'text-emerald-400' : 'text-amber-400'}`}>
                {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                <span>{change}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-[#F0E6F6]">{value}</p>
            <p className="text-sm text-[#A78BBF] mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-gradient-card border border-[#2D1F45]/60 rounded-2xl overflow-hidden glow-border">
          <div className="p-5 border-b border-[#2D1F45]/60">
            <h3 className="font-semibold text-[#F0E6F6]">Recent Orders</h3>
          </div>
          <div className="divide-y divide-[#2D1F45]/40 max-h-96 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-[#A78BBF] text-sm">No orders yet</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-[#7F3AA1]/5 transition-flow">
                  <div>
                    <p className="text-sm font-medium text-[#F0E6F6]">{order.customerName}</p>
                    <p className="text-xs text-[#A78BBF]">{order.orderNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#F0E6F6]">${order.total.toFixed(2)}</p>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyles[order.status] || 'bg-[#1E1338] text-[#A78BBF]'}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-gradient-card border border-[#2D1F45]/60 rounded-2xl overflow-hidden glow-border">
          <div className="p-5 border-b border-[#2D1F45]/60">
            <h3 className="font-semibold text-[#F0E6F6]">Top Products by Price</h3>
          </div>
          <div className="divide-y divide-[#2D1F45]/40 max-h-96 overflow-y-auto">
            {topProducts.map((product) => (
              <div key={product.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-[#7F3AA1]/5 transition-flow">
                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-xl object-cover border border-[#2D1F45]/60" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#F0E6F6] truncate">{product.name}</p>
                  <p className="text-xs text-[#A78BBF]">{product.category.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gradient">${product.price.toFixed(2)}</p>
                  <p className="text-xs text-[#A78BBF]">Stock: {product.stock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Products Tab ──
function ProductsTab({ products, categories, refresh }: { products: ProductWithCategory[]; categories: Category[]; refresh: () => void }) {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithCategory | null>(null)
  const [form, setForm] = useState({ name: '', description: '', price: '', comparePrice: '', image: '', categoryId: '', sku: '', stock: '', featured: false })
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const openCreate = () => {
    setEditingProduct(null)
    setForm({ name: '', description: '', price: '', comparePrice: '', image: '', categoryId: categories[0]?.id || '', sku: '', stock: '', featured: false })
    setShowForm(true)
  }
  const openEdit = (p: ProductWithCategory) => {
    setEditingProduct(p)
    setForm({ name: p.name, description: p.description, price: p.price.toString(), comparePrice: p.comparePrice?.toString() || '', image: p.image, categoryId: p.categoryId, sku: p.sku, stock: p.stock.toString(), featured: p.featured })
    setShowForm(true)
  }
  const handleSubmit = async () => {
    try {
      const body = { name: form.name, description: form.description, price: parseFloat(form.price), comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null, image: form.image, categoryId: form.categoryId, sku: form.sku, stock: parseInt(form.stock), featured: form.featured }
      if (editingProduct) {
        await fetch(`/api/admin/products/${editingProduct.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      } else {
        await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      }
      setShowForm(false); refresh()
    } catch (e) { console.error('Failed to save product:', e) }
  }
  const handleDelete = async (id: string) => {
    try { await fetch(`/api/admin/products/${id}`, { method: 'DELETE' }); setDeleteConfirm(null); refresh() }
    catch (e) { console.error('Failed to delete product:', e) }
  }

  const inputClass = "w-full border border-[#2D1F45] bg-[#0C0516] px-3 py-2.5 rounded-xl text-sm text-[#F0E6F6] placeholder-[#A78BBF]/40 focus:outline-none focus:ring-2 focus:ring-[#7F3AA1]/50 focus:border-[#7F3AA1]/50 transition-all"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-[#A78BBF]" role="status">{products.length} products total</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#7F3AA1]/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Add Product
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-[#0C0516]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowForm(false)} role="dialog" aria-modal="true" aria-label={editingProduct ? 'Edit product' : 'Add new product'}>
          <div className="bg-[#150D24] border border-[#2D1F45]/60 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 animate-scale-in glow-border" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-[#F0E6F6]">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-[#7F3AA1]/10 rounded-lg text-[#A78BBF] hover:text-[#F0E6F6] transition-flow" aria-label="Close dialog">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="pf-name" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">Product Name</label>
                <input id="pf-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Product name" />
              </div>
              <div>
                <label htmlFor="pf-desc" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">Description</label>
                <textarea id="pf-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} resize-none`} rows={3} placeholder="Product description" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pf-price" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">Price ($)</label>
                  <input id="pf-price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={inputClass} placeholder="0.00" />
                </div>
                <div>
                  <label htmlFor="pf-compare" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">Compare Price ($)</label>
                  <input id="pf-compare" type="number" step="0.01" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className={inputClass} placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pf-sku" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">SKU</label>
                  <input id="pf-sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className={inputClass} placeholder="SKU-001" />
                </div>
                <div>
                  <label htmlFor="pf-stock" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">Stock</label>
                  <input id="pf-stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={inputClass} placeholder="0" />
                </div>
              </div>
              <div>
                <label htmlFor="pf-cat" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">Category</label>
                <select id="pf-cat" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputClass}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="pf-image" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">Image URL</label>
                <input id="pf-image" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className={inputClass} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="pf-featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded border-[#2D1F45] bg-[#0C0516] text-[#7F3AA1] focus:ring-[#7F3AA1]/50" />
                <label htmlFor="pf-featured" className="text-sm font-medium text-[#F0E6F6]">Featured product</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 border border-[#2D1F45] text-[#A78BBF] py-2.5 rounded-xl text-sm font-medium hover:bg-[#7F3AA1]/10 transition-flow">Cancel</button>
                <button onClick={handleSubmit} className="flex-1 bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-[#7F3AA1]/25 transition-all">Save Product</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-[#0C0516]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setDeleteConfirm(null)} role="alertdialog" aria-modal="true" aria-label="Delete product confirmation">
          <div className="bg-[#150D24] border border-[#2D1F45]/60 rounded-2xl w-full max-w-sm p-6 animate-scale-in glow-border" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#F0E6F6] mb-2">Delete Product?</h3>
            <p className="text-sm text-[#A78BBF] mb-6">This action cannot be undone. The product will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-[#2D1F45] text-[#A78BBF] py-2.5 rounded-xl text-sm font-medium hover:bg-[#7F3AA1]/10 transition-flow">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-[#E85D75] text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-[#E85D75]/80 transition-flow">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-gradient-card border border-[#2D1F45]/60 rounded-2xl overflow-hidden glow-border">
        <div className="overflow-x-auto">
          <table className="w-full" role="table">
            <thead>
              <tr className="border-b border-[#2D1F45]/60 bg-[#0C0516]/50">
                <th scope="col" className="text-left text-xs font-medium text-[#A78BBF] uppercase tracking-wider px-5 py-3.5">Product</th>
                <th scope="col" className="text-left text-xs font-medium text-[#A78BBF] uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">Category</th>
                <th scope="col" className="text-left text-xs font-medium text-[#A78BBF] uppercase tracking-wider px-5 py-3.5">Price</th>
                <th scope="col" className="text-left text-xs font-medium text-[#A78BBF] uppercase tracking-wider px-5 py-3.5">Stock</th>
                <th scope="col" className="text-right text-xs font-medium text-[#A78BBF] uppercase tracking-wider px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D1F45]/40">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#7F3AA1]/5 transition-flow">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-[#2D1F45]/60" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#F0E6F6] truncate max-w-[200px]">{product.name}</p>
                        <p className="text-xs text-[#A78BBF]">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-[#A78BBF]">{product.category.name}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-[#F0E6F6]">${product.price.toFixed(2)}</span>
                    {product.comparePrice && (
                      <span className="text-xs text-[#A78BBF]/50 line-through ml-1">${product.comparePrice.toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-medium ${product.stock <= 5 ? 'text-[#E85D75]' : product.stock <= 20 ? 'text-amber-400' : 'text-[#F0E6F6]'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(product)} className="p-2 hover:bg-[#7F3AA1]/10 text-[#A78BBF] hover:text-[#C39BD3] rounded-lg transition-flow" title="Edit" aria-label={`Edit ${product.name}`}>
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                      </button>
                      <button onClick={() => setDeleteConfirm(product.id)} className="p-2 hover:bg-[#E85D75]/10 text-[#A78BBF] hover:text-[#E85D75] rounded-lg transition-flow" title="Delete" aria-label={`Delete ${product.name}`}>
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Orders Tab ──
function OrdersTab({ orders, refresh }: { orders: Order[]; refresh: () => void }) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const statusStyles: Record<string, string> = {
    pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    processing: 'bg-sky-500/15 text-sky-400 border border-sky-500/20',
    shipped: 'bg-[#7F3AA1]/15 text-[#C39BD3] border border-[#7F3AA1]/20',
    completed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border border-red-500/20',
  }
  const statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled']

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await fetch(`/api/admin/orders/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
      refresh()
    } catch (e) { console.error('Failed to update order:', e) }
  }

  return (
    <div>
      <p className="text-sm text-[#A78BBF] mb-6" role="status">{orders.length} orders total</p>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gradient-card border border-[#2D1F45]/60 rounded-2xl">
          <ClipboardList className="w-16 h-16 text-[#7F3AA1]/20 mx-auto mb-4" aria-hidden="true" />
          <p className="text-lg font-medium text-[#F0E6F6]">No orders yet</p>
          <p className="text-sm text-[#A78BBF] mt-1">Orders will appear here when customers make purchases</p>
        </div>
      ) : (
        <div className="space-y-3" role="list" aria-label="Orders list">
          {orders.map((order) => (
            <div key={order.id} className="bg-gradient-card border border-[#2D1F45]/60 rounded-2xl overflow-hidden glow-border-hover transition-flow" role="listitem">
              <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-[#7F3AA1]/5 transition-flow"
                onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                aria-expanded={expandedOrder === order.id}
                aria-controls={`order-details-${order.id}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedOrder(expandedOrder === order.id ? null : order.id) } }}
              >
                <div>
                  <p className="text-sm font-medium text-[#F0E6F6]">{order.orderNumber}</p>
                  <p className="text-xs text-[#A78BBF]">{order.customerName} &middot; {order.customerEmail}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[order.status] || 'bg-[#1E1338] text-[#A78BBF]'}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-[#F0E6F6]">${order.total.toFixed(2)}</span>
                  <Eye className={`w-4 h-4 text-[#A78BBF] transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-90' : ''}`} aria-hidden="true" />
                </div>
              </div>

              {expandedOrder === order.id && (
                <div id={`order-details-${order.id}`} className="border-t border-[#2D1F45]/60 px-5 py-4 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-[#A78BBF] uppercase tracking-wider mb-1">Order Date</p>
                      <p className="text-sm text-[#F0E6F6]">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#A78BBF] uppercase tracking-wider mb-1">Items</p>
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <img src={item.product.image} alt="" className="w-8 h-8 rounded-lg object-cover border border-[#2D1F45]/60" />
                            <span className="text-sm text-[#F0E6F6] flex-1 truncate">{item.product.name}</span>
                            <span className="text-xs text-[#A78BBF]">x{item.quantity}</span>
                            <span className="text-sm font-medium text-[#F0E6F6]">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#A78BBF] uppercase tracking-wider mb-2">Update Status</p>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Order status">
                      {statuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => updateStatus(order.id, status)}
                          role="radio"
                          aria-checked={order.status === status}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${order.status === status ? 'border-[#7F3AA1] bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white shadow-lg shadow-[#7F3AA1]/20' : 'border-[#2D1F45] text-[#A78BBF] hover:bg-[#7F3AA1]/10 hover:border-[#7F3AA1]/30'}`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Footer ──
function Footer() {
  return (
    <footer className="border-t border-[#2D1F45]/40 mt-auto" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-gradient">ShopFlow</span>
          </div>
          <p className="text-sm text-[#A78BBF]">
            Built with Next.js, Prisma, Stripe & Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  )
}