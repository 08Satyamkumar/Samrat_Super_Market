"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { API_URL } from "@/lib/api"

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/dashboard`)
        const result = await res.json()
        setData(result)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 h-64"><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
          <Card className="col-span-3 h-64"><CardContent className="p-6"><Skeleton className="h-full w-full" /></CardContent></Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{data?.stats?.totalRevenue?.toLocaleString('en-IN') || 0}</div>
            <p className="text-xs text-muted-foreground">Platform revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Shops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.activeShops || 0}</div>
            <p className="text-xs text-muted-foreground">Currently live on app</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.pendingShops || 0}</div>
            <p className="text-xs text-muted-foreground">Requires immediate action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">Total platform orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {data?.recentOrders?.map((order: any) => (
                <div key={order._id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">Order #{order._id.substring(order._id.length - 6).toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">{order.shop_id?.name || 'Unknown Shop'}</p>
                  </div>
                  <div className="ml-auto font-medium">
                    <Badge variant="outline" className={
                      order.status === 'delivered' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' :
                      order.status === 'cancelled' ? 'text-red-500 border-red-500/20 bg-red-500/10' :
                      'text-blue-500 border-blue-500/20 bg-blue-500/10'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {(!data?.recentOrders || data.recentOrders.length === 0) && (
                <p className="text-sm text-muted-foreground text-center">No recent orders</p>
              )}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Shops</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-8">
              {data?.topShops?.map((shop: any) => (
                <div key={shop._id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{shop.name}</p>
                    <p className="text-sm text-muted-foreground">{shop.owner_id?.email || 'No email'}</p>
                  </div>
                  <div className="ml-auto font-medium capitalize text-sm text-muted-foreground">
                    {shop.category || 'General'}
                  </div>
                </div>
              ))}
              {(!data?.topShops || data.topShops.length === 0) && (
                <p className="text-sm text-muted-foreground text-center">No shops found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
