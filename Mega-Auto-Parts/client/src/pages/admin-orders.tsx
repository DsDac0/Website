import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is authenticated admin
  const { data: authCheck, isLoading: authLoading } = useQuery({
    queryKey: ["/api/admin/check"],
    retry: false,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: authCheck?.isAuthenticated,
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/admin/logout");
    },
    onSuccess: () => {
      toast({
        title: "Успешна одјава",
        description: "Се одјавивте од администраторскиот панел",
      });
      setLocation("/admin/login");
    },
  });

  useEffect(() => {
    if (!authLoading && (!authCheck?.isAuthenticated)) {
      setLocation("/admin/login");
    }
  }, [authCheck, authLoading, setLocation]);

  if (authLoading || ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!authCheck?.isAuthenticated) {
    return null;
  }

  const formatPrice = (price: string) => {
    return `${parseFloat(price).toLocaleString('mk-MK')} ден.`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('mk-MK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Во обработка", variant: "secondary" as const },
      processing: { label: "Се обработува", variant: "default" as const },
      shipped: { label: "Испратена", variant: "outline" as const },
      delivered: { label: "Доставена", variant: "default" as const },
      cancelled: { label: "Откажана", variant: "destructive" as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Администраторски панел</h1>
              <p className="text-gray-600">Преглед на сите нарачки од клиенти</p>
            </div>
            <Button onClick={() => logoutMutation.mutate()} variant="outline">
              Одјави се
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Нарачки од клиенти</CardTitle>
            <CardDescription>
              Вкупно {orders.length} нарачки
            </CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Нема нарачки во системот</p>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order: any) => (
                  <Card key={order.id} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            Нарачка #{order.id}
                          </CardTitle>
                          <CardDescription>
                            {formatDate(order.createdAt)}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(order.status)}
                          <p className="text-lg font-bold mt-1">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold mb-2">Информации за клиент:</h4>
                          <div className="space-y-1 text-sm">
                            <p><span className="font-medium">Име:</span> {order.firstName} {order.lastName}</p>
                            <p><span className="font-medium">Е-пошта:</span> {order.email}</p>
                            <p><span className="font-medium">Телефон:</span> {order.phone}</p>
                            <p><span className="font-medium">Адреса:</span> {order.address}, {order.city} {order.postalCode}</p>
                            <p><span className="font-medium">Начин на плаќање:</span> {
                              order.paymentMethod === 'cash' ? 'Кеш' :
                              order.paymentMethod === 'card' ? 'Картичка' : 'Банковен трансфер'
                            }</p>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Нарачани производи:</h4>
                          <div className="space-y-2">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                                <div>
                                  <p className="font-medium">{item.product.name}</p>
                                  <p className="text-gray-600">Количина: {item.quantity}</p>
                                </div>
                                <p className="font-medium">{formatPrice(item.price)}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}