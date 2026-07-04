'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart-store'
import { ProductWithCategory } from '@/app/page'
import { X, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'

interface CheckoutForm {
  customerName: string
  customerEmail: string
  shippingAddress: string
}

const inputCls = "w-full border border-[#2D1F45] bg-[#0C0516] px-3 py-2.5 rounded-xl text-sm text-[#F0E6F6] placeholder-[#A78BBF]/40 focus:outline-none focus:ring-2 focus:ring-[#7F3AA1]/50 focus:border-[#7F3AA1]/50 transition-all"

export function CartDrawer() {
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, clearCart, total, itemCount } = useCartStore()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [form, setForm] = useState<CheckoutForm>({ customerName: '', customerEmail: '', shippingAddress: '' })
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    if (!form.customerName || !form.customerEmail || !form.shippingAddress) {
      setError('Please fill in all fields')
      return
    }
    setError('')
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Checkout failed'); return }
      setOrderNumber(data.orderNumber)
      setOrderComplete(true)
      clearCart()
      if (typeof window !== 'undefined') { window.dispatchEvent(new CustomEvent('inventory-update')) }
    } catch { setError('Something went wrong. Please try again.') }
  }

  const handleClose = () => {
    setCartOpen(false)
    if (orderComplete) {
      setIsCheckingOut(false); setOrderComplete(false)
      setForm({ customerName: '', customerEmail: '', shippingAddress: '' })
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-[#0C0516]/70 backdrop-blur-sm z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex-1 flex flex-col glass-strong">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[#2D1F45]/60">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#7F3AA1]" aria-hidden="true" />
              <h2 className="text-lg font-bold text-[#F0E6F6]">Your Cart</h2>
              <span className="bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white text-xs px-2 py-0.5 rounded-full font-semibold">{itemCount()}</span>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-[#7F3AA1]/10 rounded-xl text-[#A78BBF] hover:text-[#F0E6F6] transition-flow" aria-label="Close cart">
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {orderComplete ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in-up">
              <div className="w-16 h-16 bg-emerald-500/15 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#F0E6F6] mb-2">Order Confirmed!</h3>
              <p className="text-[#A78BBF] mb-1">Thank you for your purchase.</p>
              <p className="text-sm font-mono bg-[#0C0516] border border-[#2D1F45] px-3 py-1.5 rounded-lg mb-6 text-[#C39BD3]">{orderNumber}</p>
              <button
                onClick={handleClose}
                className="bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#7F3AA1]/25 transition-all"
              >
                Continue Shopping
              </button>
            </div>
          ) : isCheckingOut ? (
            <div className="flex-1 overflow-y-auto p-6 animate-fade-in">
              <button
                onClick={() => { setIsCheckingOut(false); setError('') }}
                className="text-sm text-[#A78BBF] hover:text-[#F0E6F6] mb-4 flex items-center gap-1 transition-flow"
              >
                <ArrowRight className="w-4 h-4 rotate-180" aria-hidden="true" /> Back to cart
              </button>
              <h3 className="text-lg font-bold text-[#F0E6F6] mb-4">Checkout</h3>
              {error && (
                <div className="bg-[#E85D75]/10 border border-[#E85D75]/20 text-[#E85D75] px-4 py-3 rounded-xl text-sm mb-4" role="alert">{error}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label htmlFor="co-name" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">Full Name</label>
                  <input id="co-name" type="text" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className={inputCls} placeholder="John Doe" />
                </div>
                <div>
                  <label htmlFor="co-email" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">Email</label>
                  <input id="co-email" type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} className={inputCls} placeholder="john@example.com" />
                </div>
                <div>
                  <label htmlFor="co-address" className="text-sm font-medium text-[#F0E6F6] mb-1.5 block">Shipping Address</label>
                  <textarea id="co-address" value={form.shippingAddress} onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })} className={`${inputCls} resize-none`} rows={3} placeholder="123 Main St, City, State, ZIP" />
                </div>
                <div className="bg-[#0C0516] border border-[#2D1F45]/60 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#A78BBF]">Subtotal ({itemCount()} items)</span>
                    <span className="text-[#F0E6F6]">${total().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[#A78BBF]">Shipping</span>
                    <span className="text-emerald-400 font-medium">Free</span>
                  </div>
                  <div className="border-t border-[#2D1F45]/60 mt-2 pt-2 flex justify-between font-bold">
                    <span className="text-[#F0E6F6]">Total</span>
                    <span className="text-gradient">${total().toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#7F3AA1]/25 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Place Order
                </button>
              </div>
            </div>
          ) : items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <ShoppingBag className="w-16 h-16 text-[#7F3AA1]/20 mb-4" aria-hidden="true" />
              <p className="text-lg font-medium text-[#F0E6F6] mb-1">Your cart is empty</p>
              <p className="text-sm text-[#A78BBF]">Start adding some products to get started!</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 bg-[#0C0516]/60 border border-[#2D1F45]/40 rounded-xl p-3 hover:border-[#7F3AA1]/20 transition-flow">
                    <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover border border-[#2D1F45]/60" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 text-[#F0E6F6]">{item.name}</h4>
                      <p className="text-sm font-bold mt-1 text-gradient">${item.price.toFixed(2)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-7 h-7 rounded-lg border border-[#2D1F45] flex items-center justify-center text-[#A78BBF] hover:bg-[#7F3AA1]/10 hover:border-[#7F3AA1]/30 transition-flow"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className="w-3 h-3" aria-hidden="true" />
                        </button>
                        <span className="text-sm font-medium w-6 text-center text-[#F0E6F6]">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-7 h-7 rounded-lg border border-[#2D1F45] flex items-center justify-center text-[#A78BBF] hover:bg-[#7F3AA1]/10 hover:border-[#7F3AA1]/30 transition-flow disabled:opacity-40 disabled:cursor-not-allowed"
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="self-start p-1.5 text-[#A78BBF] hover:text-[#E85D75] transition-flow"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#2D1F45]/60 p-6 space-y-4">
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-[#F0E6F6]">Total</span>
                  <span className="text-gradient">${total().toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setIsCheckingOut(true)}
                  className="w-full bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-[#7F3AA1]/25 transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}