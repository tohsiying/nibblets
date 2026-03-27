import React, { useState } from 'react'
import Shell from '../components/Shell'
import Card from '../components/ui/Card'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import Sparkline from '../components/charts/Sparkline'
import { useApi } from '../hooks/useApi'
import { useRevenue, useTopProducts } from '../hooks/useAnalytics'
import { api } from '../lib/api'
import { formatCurrency, formatNumber, cn } from '../lib/utils'
import type { StoreInfo, RevenueDataPoint, TopProduct } from '../lib/types'

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_STORE: StoreInfo = {
  domain: 'snowdevil.myshopify.com',
  name: 'Snow Devil',
  currency: 'USD',
  product_count: 42,
  order_count: 1283,
  customer_count: 891,
  last_sync_at: '2026-03-24T10:30:00Z',
}

function generateMockRevenue(): RevenueDataPoint[] {
  const data: RevenueDataPoint[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const base = 2800 + Math.random() * 1200
    const orders = 18 + Math.floor(Math.random() * 15)
    data.push({
      date: d.toISOString().split('T')[0],
      revenue: Math.round(base * 100) / 100,
      orders,
      aov: Math.round((base / orders) * 100) / 100,
    })
  }
  return data
}

const MOCK_REVENUE = generateMockRevenue()

const MOCK_TOP_PRODUCTS: TopProduct[] = [
  { id: '1', title: 'The Complete Snowboard', revenue: 12480, units_sold: 48 },
  { id: '2', title: 'The Collection Snowboard: Hydrogen', revenue: 9360, units_sold: 36 },
  { id: '3', title: 'The Multi-managed Snowboard', revenue: 7540, units_sold: 29 },
  { id: '4', title: 'The Draft Snowboard', revenue: 5200, units_sold: 20 },
  { id: '5', title: 'Selling Plans Ski Wax', revenue: 3120, units_sold: 78 },
  { id: '6', title: 'The Hidden Snowboard', revenue: 2800, units_sold: 14 },
  { id: '7', title: 'Gift Card', revenue: 2400, units_sold: 60 },
  { id: '8', title: 'The Archived Snowboard', revenue: 1950, units_sold: 13 },
  { id: '9', title: 'Alpine Boot Pro', revenue: 1600, units_sold: 8 },
  { id: '10', title: 'Snow Helmet Classic', revenue: 1200, units_sold: 10 },
]

// ── Helpers ────────────────────────────────────────────────────────────────

function linearRegression(values: number[]): { slope: number; intercept: number } {
  const n = values.length
  if (n < 2) return { slope: 0, intercept: values[0] || 0 }
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0
  for (let i = 0; i < n; i++) {
    sumX += i
    sumY += values[i]
    sumXY += i * values[i]
    sumXX += i * i
  }
  const denom = n * sumXX - sumX * sumX
  if (denom === 0) return { slope: 0, intercept: sumY / n }
  const slope = (n * sumXY - sumX * sumY) / denom
  const intercept = (sumY - slope * sumX) / n
  return { slope, intercept }
}

function computeGrowth(series: RevenueDataPoint[]): number {
  if (series.length < 2) return 0
  if (series.length < 14) {
    const half = Math.floor(series.length / 2)
    const prior = series.slice(0, half).reduce((s, d) => s + d.revenue, 0)
    const recent = series.slice(half).reduce((s, d) => s + d.revenue, 0)
    return prior > 0 ? ((recent - prior) / prior) * 100 : 0
  }
  const recent = series.slice(-7).reduce((s, d) => s + d.revenue, 0)
  const prior = series.slice(-14, -7).reduce((s, d) => s + d.revenue, 0)
  return prior > 0 ? ((recent - prior) / prior) * 100 : 0
}

// ── SmartKPICard ───────────────────────────────────────────────────────────

interface SmartKPICardProps {
  title: string
  value: string | number
  change?: number
  subtitle?: string
  sparklineData?: number[]
}

function SmartKPICard({ title, value, change, subtitle, sparklineData }: SmartKPICardProps) {
  return (
    <div className="bg-surface-1 border border-border rounded-lg p-4">
      <p className="text-xs text-text-tertiary mb-2">{title}</p>
      <span className="text-2xl font-semibold text-text-primary">{value}</span>
      {subtitle && (
        <p className="text-xs text-text-tertiary mt-1 truncate">{subtitle}</p>
      )}
      {sparklineData && sparklineData.length >= 2 && (
        <div className="mt-2">
          <Sparkline data={sparklineData} width={100} height={24} color="#00FF94" />
        </div>
      )}
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-2">
          {change >= 0 ? (
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-status-success">
              <path d="M6 2l4 5H2l4-5z" fill="currentColor" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" className="text-status-error">
              <path d="M6 10l4-5H2l4 5z" fill="currentColor" />
            </svg>
          )}
          <span className={cn('text-xs font-medium', change >= 0 ? 'text-status-success' : 'text-status-error')}>
            {Math.abs(change).toFixed(1)}%
          </span>
          <span className="text-xs text-text-tertiary">vs prev</span>
        </div>
      )}
    </div>
  )
}

// ── Page Component ─────────────────────────────────────────────────────────

export default function SmartDashboardPage() {
  const [useMock, setUseMock] = useState(false)

  const { data: storeData, error: storeError } = useApi(() => api.getStore(), [])
  const { data: revenueData, error: revenueError } = useRevenue('30d')
  const { data: topData, error: topError } = useTopProducts(10)

  // Fall back to mock data on error OR when the store has no data yet
  const hasEmptyData =
    revenueData?.series?.every((d) => d.revenue === 0 && d.orders === 0) ||
    (topData?.products?.length === 0)
  const isMock = useMock || !!(storeError && revenueError) || hasEmptyData
  const store = isMock ? MOCK_STORE : (storeData || MOCK_STORE)
  const revenue = isMock ? MOCK_REVENUE : (revenueData?.series || MOCK_REVENUE)
  const topProducts = isMock ? MOCK_TOP_PRODUCTS : (topData?.products || MOCK_TOP_PRODUCTS)

  // KPI computations
  const totalRevenue = revenue.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = revenue.reduce((sum, d) => sum + d.orders, 0)
  const avgAOV = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const ordersToday = revenue[revenue.length - 1]?.orders || 0
  const revenueGrowth = computeGrowth(revenue)
  const topProductRevenue = topProducts[0]?.revenue || 0
  const topProductName = topProducts[0]?.title || 'N/A'
  const sparklineData = revenue.map((d) => d.revenue)

  // Linear regression for trend line
  const revenueValues = revenue.map((d) => d.revenue)
  const { slope, intercept } = linearRegression(revenueValues)

  // Replicate LineChart's coordinate system for the trend overlay
  const chartHeight = 300
  const padding = { top: 12, right: 12, bottom: 28, left: 12 }
  const chartW = 600 - padding.left - padding.right
  const chartH = chartHeight - padding.top - padding.bottom
  const minVal = Math.min(...revenueValues) * 0.9
  const maxVal = Math.max(...revenueValues) * 1.1
  const valRange = maxVal - minVal || 1

  const mapX = (i: number) => padding.left + (i / (revenue.length - 1)) * chartW
  const mapY = (v: number) => padding.top + chartH - ((v - minVal) / valRange) * chartH

  const trendX1 = mapX(0)
  const trendY1 = mapY(intercept)
  const trendX2 = mapX(revenue.length - 1)
  const trendY2 = mapY(slope * (revenue.length - 1) + intercept)

  return (
    <Shell title="Smart Dashboard">
      {isMock && (
        <div className="bg-status-warning/10 border border-status-warning/20 rounded-lg px-4 py-2 mb-4 flex items-center justify-between">
          <span className="text-xs text-status-warning">
            Using demo data — connect to The Pipe for live data
          </span>
          <button
            onClick={() => setUseMock(false)}
            className="text-xs text-text-tertiary hover:text-text-secondary"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 mb-5">
        <SmartKPICard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          change={revenueGrowth}
          sparklineData={sparklineData}
        />
        <SmartKPICard
          title="Orders Today"
          value={formatNumber(ordersToday)}
        />
        <SmartKPICard
          title="Avg Order Value"
          value={formatCurrency(avgAOV)}
        />
        <SmartKPICard
          title="Revenue Growth"
          value={`${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%`}
          change={revenueGrowth}
        />
        <SmartKPICard
          title="Top Product"
          value={formatCurrency(topProductRevenue)}
          subtitle={topProductName}
        />
        <SmartKPICard
          title="Customers"
          value={formatNumber(store.customer_count)}
        />
      </div>

      {/* Revenue Chart with Trend Line */}
      <Card title="Revenue Trend" subtitle="Last 30 days with linear regression">
        <div className="relative">
          <LineChart
            data={revenue.map((d) => ({
              label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: d.revenue,
            }))}
            height={chartHeight}
            color="#00FF94"
            showGrid
            showLabels
            showTooltip
          />
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox={`0 0 600 ${chartHeight}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <line
              x1={trendX1}
              y1={trendY1}
              x2={trendX2}
              y2={trendY2}
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="1.5"
              strokeDasharray="6,4"
            />
          </svg>
        </div>
      </Card>

      {/* Top 10 Products Bar Chart */}
      <div className="mt-5">
        <Card title="Top 10 Products" subtitle="By revenue">
          <BarChart
            data={topProducts.map((p) => ({
              label: p.title,
              value: p.revenue,
            }))}
            height={360}
            horizontal
          />
        </Card>
      </div>
    </Shell>
  )
}
