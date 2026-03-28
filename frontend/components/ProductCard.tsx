import React from 'react'
import { cn, formatCurrency } from '../lib/utils'
import type { Product } from '../lib/types'

interface ProductCardProps {
  product: Product
  selected: boolean
  onClick: () => void
  onGenerate?: () => void
}

export default function ProductCard({ product, selected, onClick, onGenerate }: ProductCardProps) {
  const price =
    product.price_min === product.price_max
      ? formatCurrency(product.price_min)
      : `${formatCurrency(product.price_min)} – ${formatCurrency(product.price_max)}`

  const inv = product.inventory_total

  return (
    <div
      onClick={onClick}
      className={cn(
        'group bg-white border rounded-xl overflow-hidden cursor-pointer transition-all duration-150 ease-out shadow-sm',
        selected
          ? 'border-accent ring-2 ring-accent/20'
          : 'border-border hover:border-border-hover hover:shadow-md'
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

        {/* Hover overlay with Generate Ad button */}
        {onGenerate && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onGenerate()
              }}
              className="px-5 py-2 text-sm font-medium text-white rounded-full shadow-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #D4826A, #C06B55)' }}
            >
              Generate Ad
            </button>
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
