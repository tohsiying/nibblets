import React from 'react'
import { cn, formatCurrency } from '../lib/utils'
import type { Product } from '../lib/types'

interface ProductCardProps {
  product: Product
  selected: boolean
  onClick: () => void
}

export default function ProductCard({ product, selected, onClick }: ProductCardProps) {
  const price =
    product.price_min === product.price_max
      ? formatCurrency(product.price_min)
      : `${formatCurrency(product.price_min)} – ${formatCurrency(product.price_max)}`

  const inv = product.inventory_total

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-surface-1 border rounded-lg overflow-hidden cursor-pointer transition-all duration-150 ease-out',
        selected
          ? 'border-accent ring-1 ring-accent/30'
          : 'border-border hover:border-border-hover'
      )}
    >
      {/* Image / Placeholder */}
      <div className="relative aspect-square bg-surface-2 flex items-center justify-center">
        {product.featured_image_url ? (
          <img
            src={product.featured_image_url}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-semibold text-text-tertiary/50">
            {product.title.charAt(0)}
          </span>
        )}

        {/* Selected checkmark */}
        {selected && (
          <div className="absolute top-2 right-2 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6l2.5 2.5 4.5-5" stroke="#0A0A0B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm font-medium text-text-primary truncate">{product.title}</p>
        <p className="text-sm text-text-secondary mt-0.5">{price}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-text-tertiary">{product.vendor}</span>
          <span className="text-xs text-text-tertiary">·</span>
          <span
            className={cn(
              'text-xs',
              inv === 0
                ? 'text-status-error'
                : inv <= 10
                ? 'text-status-warning'
                : 'text-text-tertiary'
            )}
          >
            {inv === 0 ? 'Out of stock' : `${inv} in stock`}
          </span>
        </div>
      </div>
    </div>
  )
}
