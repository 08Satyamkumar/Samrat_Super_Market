import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function OrdersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Global Orders</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Customer Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400">Master view of all marketplace orders will be implemented in Phase 2.</p>
        </CardContent>
      </Card>
    </div>
  )
}
