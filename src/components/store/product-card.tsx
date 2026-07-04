import { ProductWithCategory } from './page'

export function ProductCard({ product, onAddToCart, index = 0 }: { product: ProductWithCategory; onAddToCart: (p: ProductWithCategory) => void; index?: number }) {
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div
      className="group bg-gradient-card border border-border/60 rounded-2xl overflow-hidden transition-flow hover:-translate-y-1.5 glow-border-hover animate-fade-in-up"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
      role="article"
      aria-label={`${product.name}, $${product.price.toFixed(2)}, ${product.stock > 0 ? 'in stock' : 'out of stock'}`}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
          loading="lazy"
        />
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0C0516]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {discount > 0 && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-[#7F3AA1]/20">
            -{discount}%
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 right-3 bg-amber-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-[#0C0516]/60 backdrop-blur-sm flex items-center justify-center">
            <span className="text-white font-bold text-lg tracking-wide">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-[#A78BBF] uppercase tracking-widest mb-1.5 font-medium">{product.category.name}</p>
        <h3 className="font-semibold text-sm line-clamp-2 mb-2.5 leading-snug text-[#F0E6F6]">{product.name}</h3>
        <div className="flex items-baseline gap-2 mb-3.5">
          <span className="text-xl font-bold text-gradient">${product.price.toFixed(2)}</span>
          {product.comparePrice && (
            <span className="text-sm text-[#A78BBF]/60 line-through">${product.comparePrice.toFixed(2)}</span>
          )}
        </div>
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          aria-label={`Add ${product.name} to cart`}
          className="w-full bg-gradient-to-r from-[#7F3AA1] to-[#5416B5] text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#7F3AA1]/25 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
        >
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  )
}