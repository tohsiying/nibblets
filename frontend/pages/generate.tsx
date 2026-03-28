import React, { useState } from 'react'
import Shell from '../components/Shell'
import ProductCard from '../components/ProductCard'
import PipelineProgress from '../components/PipelineProgress'
import VideoCarousel from '../components/VideoCarousel'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import { useProducts } from '../hooks/useProducts'
import { useApi } from '../hooks/useApi'
import { useGeneratePipeline } from '../hooks/useGeneratePipeline'
import { formatCurrency } from '../lib/utils'
import type { Product } from '../lib/types'

// ── Social Platforms ──────────────────────────────────────────────────────

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: 'IG', color: '#E1306C' },
  { key: 'youtube', label: 'YouTube', icon: 'YT', color: '#FF0000' },
  { key: 'tiktok', label: 'TikTok', icon: 'TT', color: '#00F2EA' },
  { key: 'x', label: 'X', icon: 'X', color: '#FFFFFF' },
] as const

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'demo-001', title: 'Glow Serum', handle: 'glow-serum',
    status: 'active', vendor: 'Glow Beauty', product_type: 'Skincare',
    price_min: 48.00, price_max: 48.00, variants: [
      { id: 'v-demo-001', title: 'Default', price: 48.00, sku: 'GLOW-SRM-001', inventory_quantity: 12 },
    ],
    collections: ['Best Sellers'], featured_image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&h=400&fit=crop', inventory_total: 12,
    created_at: '2026-03-01T08:00:00Z', updated_at: '2026-03-25T10:00:00Z',
  },
  {
    id: 'demo-002', title: 'Hydra Moisturiser', handle: 'hydra-moisturiser',
    status: 'active', vendor: 'Glow Beauty', product_type: 'Skincare',
    price_min: 36.00, price_max: 36.00, variants: [
      { id: 'v-demo-002', title: 'Default', price: 36.00, sku: 'HYDRA-MST-001', inventory_quantity: 34 },
    ],
    collections: ['Skincare'], featured_image_url: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=400&h=400&fit=crop', inventory_total: 34,
    created_at: '2026-02-15T08:00:00Z', updated_at: '2026-03-20T10:00:00Z',
  },
  {
    id: 'demo-003', title: 'Rose Lip Oil', handle: 'rose-lip-oil',
    status: 'active', vendor: 'Petal Co', product_type: 'Lip Care',
    price_min: 22.00, price_max: 22.00, variants: [
      { id: 'v-demo-003', title: 'Default', price: 22.00, sku: 'LIP-ROSE-001', inventory_quantity: 8 },
    ],
    collections: ['New Arrivals'], featured_image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop', inventory_total: 8,
    created_at: '2026-03-10T08:00:00Z', updated_at: '2026-03-24T10:00:00Z',
  },
  {
    id: 'demo-004', title: 'SPF 50 Daily Shield', handle: 'spf-daily-shield',
    status: 'active', vendor: 'SunSafe', product_type: 'Sunscreen',
    price_min: 28.00, price_max: 28.00, variants: [
      { id: 'v-demo-004', title: 'Default', price: 28.00, sku: 'SPF-50-001', inventory_quantity: 56 },
    ],
    collections: ['Best Sellers'], featured_image_url: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&h=400&fit=crop', inventory_total: 56,
    created_at: '2026-01-20T08:00:00Z', updated_at: '2026-03-22T10:00:00Z',
  },
  {
    id: 'demo-005', title: 'Retinol Night Cream', handle: 'retinol-night-cream',
    status: 'active', vendor: 'Glow Beauty', product_type: 'Skincare',
    price_min: 62.00, price_max: 62.00, variants: [
      { id: 'v-demo-005', title: 'Default', price: 62.00, sku: 'RET-NGT-001', inventory_quantity: 3 },
    ],
    collections: ['Limited Edition'], featured_image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&h=400&fit=crop', inventory_total: 3,
    created_at: '2026-03-05T08:00:00Z', updated_at: '2026-03-26T10:00:00Z',
  },
  {
    id: 'demo-006', title: 'Cleansing Balm', handle: 'cleansing-balm',
    status: 'active', vendor: 'Petal Co', product_type: 'Cleanser',
    price_min: 32.00, price_max: 32.00, variants: [
      { id: 'v-demo-006', title: 'Default', price: 32.00, sku: 'CLN-BLM-001', inventory_quantity: 45 },
    ],
    collections: ['Skincare'], featured_image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop', inventory_total: 45,
    created_at: '2026-02-01T08:00:00Z', updated_at: '2026-03-18T10:00:00Z',
  },
]

// ── Page Component ─────────────────────────────────────────────────────────

export default function GeneratePage() {
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const pipeline = useGeneratePipeline()

  // Publish modal state
  const [publishVideo, setPublishVideo] = useState<{ videoUrl: string; productName: string } | null>(null)
  const [publishCaption, setPublishCaption] = useState('')
  const [publishingTo, setPublishingTo] = useState<string | null>(null)
  const [publishResult, setPublishResult] = useState<{ success: boolean; message: string } | null>(null)

  // Export state for not-yet-exported videos
  const [exportingId, setExportingId] = useState<string | null>(null)

  const { data: apiData, error } = useProducts({
    search: search || undefined,
    status: 'active',
  })

  // Fetch generated video history
  const { data: historyData, refetch: refetchHistory } = useApi(
    () => fetch('/api/generate/history').then((r) => r.json()),
    []
  )

  const hasEmptyData = apiData?.data?.length === 0
  const isMock = !!error || !apiData || hasEmptyData

  async function handlePublish(platform: string) {
    if (!publishVideo) return
    setPublishingTo(platform)
    setPublishResult(null)

    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: publishVideo.videoUrl,
          platform,
          caption: publishCaption || `Check out ${publishVideo.productName}! Link in bio.`,
          title: publishVideo.productName,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setPublishResult({ success: true, message: `Posted to ${platform}!` })
      } else {
        setPublishResult({ success: false, message: data.error || 'Failed to publish' })
      }
    } catch (err: any) {
      setPublishResult({ success: false, message: err.message })
    } finally {
      setPublishingTo(null)
    }
  }
  const products = isMock ? MOCK_PRODUCTS : apiData?.data || MOCK_PRODUCTS

  // Client-side filtering for mock data
  const filtered = isMock
    ? products.filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()))
    : products

  const isGenerating = pipeline.state !== 'idle'

  return (
    <Shell title="Generate">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-1">
          {isGenerating && selectedProduct
            ? selectedProduct.title
            : 'Create UGC Ad'}
        </h2>
        <p className="text-sm text-text-tertiary">
          {pipeline.state === 'running'
            ? 'Generating your ad...'
            : pipeline.state === 'complete'
            ? 'Your ad is ready'
            : pipeline.state === 'error'
            ? 'Something went wrong'
            : 'Select a product to generate a UGC-style video ad'}
        </p>
      </div>

      {/* Pipeline Progress (replaces product grid when active) */}
      {isGenerating ? (
        <PipelineProgress
          state={pipeline.state}
          currentStep={pipeline.currentStep}
          progress={pipeline.progress}
          message={pipeline.message}
          events={pipeline.events}
          videoUrl={pipeline.videoUrl}
          projectId={pipeline.projectId}
          error={pipeline.error}
          costSoFar={pipeline.costSoFar}
          startedAt={pipeline.startedAt}
          onReset={pipeline.reset}
          onRetry={selectedProduct ? () => pipeline.start(selectedProduct) : undefined}
        />
      ) : (
        <>
          {isMock && (
            <div className="bg-status-warning/10 border border-status-warning/20 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
              <span className="text-xs text-status-warning">
                Using demo data — connect your store for live products
              </span>
            </div>
          )}

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm bg-surface-2 border border-border rounded-md px-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-active"
            />
          </div>

          {/* Product Grid */}
          <div className={selectedProduct ? 'pb-20' : ''}>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    selected={selectedProduct?.id === product.id}
                    onClick={() =>
                      setSelectedProduct(
                        selectedProduct?.id === product.id ? null : product
                      )
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No products found"
                description="Try a different search term"
              />
            )}
          </div>

          {/* Generated Videos Carousel */}
          {historyData?.videos?.length > 0 && (
            <div className="mt-6 -mx-5 px-5 py-6 rounded-xl" style={{ background: '#F5F0E8' }}>
              <VideoCarousel
                videos={historyData.videos}
                exportingId={exportingId}
                onPublish={(video) => {
                  setPublishVideo({ videoUrl: video.videoUrl, productName: video.productName })
                  setPublishCaption(`Check out ${video.productName}! Link in bio.`)
                  setPublishResult(null)
                }}
                onExport={async (video) => {
                  setExportingId(video.projectId)
                  try {
                    const res = await fetch('/api/generate/export', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ projectId: video.projectId, productName: video.productName }),
                    })
                    const data = await res.json()
                    if (data.success) refetchHistory()
                  } catch {}
                  setExportingId(null)
                }}
              />
            </div>
          )}

          {/* Selected product bottom bar */}
          {selectedProduct && (
            <div className="fixed bottom-0 left-60 right-0 bg-surface-1 border-t border-border px-5 py-4 z-40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-surface-2 rounded border border-border flex items-center justify-center text-text-tertiary text-sm">
                    {selectedProduct.featured_image_url ? (
                      <img
                        src={selectedProduct.featured_image_url}
                        alt={selectedProduct.title}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      selectedProduct.title.charAt(0)
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">{selectedProduct.title}</p>
                    <p className="text-xs text-text-tertiary">
                      {formatCurrency(selectedProduct.price_min)} · {selectedProduct.vendor}
                    </p>
                  </div>
                </div>
                <Button variant="primary" onClick={() => pipeline.start(selectedProduct)}>
                  Generate Ad
                </Button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Publish Modal */}
      <Modal
        open={!!publishVideo}
        onClose={() => { setPublishVideo(null); setPublishResult(null) }}
        title="Post to Socials"
      >
        {publishVideo && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Publish <span className="text-text-primary font-medium">{publishVideo.productName}</span> video
            </p>

            {/* Caption */}
            <div>
              <label className="text-xs text-text-tertiary block mb-1">Caption</label>
              <textarea
                value={publishCaption}
                onChange={(e) => setPublishCaption(e.target.value)}
                rows={3}
                className="w-full bg-surface-2 border border-border rounded-md px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-active resize-none"
              />
            </div>

            {/* Platform buttons */}
            <div>
              <label className="text-xs text-text-tertiary block mb-2">Choose platform</label>
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => handlePublish(p.key)}
                    disabled={publishingTo !== null}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-md border border-border bg-surface-2 hover:border-border-hover transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span
                      className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: p.color + '20', color: p.color }}
                    >
                      {p.icon}
                    </span>
                    {publishingTo === p.key ? 'Posting...' : p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Result */}
            {publishResult && (
              <div
                className={`rounded-md px-3 py-2 text-xs ${
                  publishResult.success
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'bg-status-error/10 text-status-error border border-status-error/20'
                }`}
              >
                {publishResult.message}
              </div>
            )}
          </div>
        )}
      </Modal>
    </Shell>
  )
}
