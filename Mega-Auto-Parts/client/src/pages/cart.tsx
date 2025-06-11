import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const { toast } = useToast();

  const formatPrice = (price: string) => {
    return new Intl.NumberFormat('mk-MK').format(parseFloat(price));
  };

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: number) => {
    const item = items.find(item => item.productId === productId);
    removeItem(productId);
    toast({
      title: "Производот е отстранет",
      description: `${item?.name} е отстранет од кошничката`,
    });
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Кошничката е испразнета",
      description: "Сите производи се отстранети",
    });
  };

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const shippingCost = totalPrice > 3000 ? 0 : 200; // Free shipping over 3000 MKD
  const finalTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Вашата кошничка е празна</h2>
            <p className="text-gray-600 mb-6">
              Додајте производи во кошничката за да продолжите со нарачката
            </p>
            <Link href="/products">
              <Button className="bg-auto-red hover:bg-auto-dark-red text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Продолжи со купување
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-auto-black mb-4">Кошничка за купување</h1>
        <p className="text-gray-600">
          Имате {totalItems} {totalItems === 1 ? 'производ' : 'производи'} во вашата кошничка
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Производи во кошничка</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Испразни кошничка
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.imageUrl || "/placeholder-product.jpg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{item.name}</h3>
                      <p className="text-auto-red font-bold">
                        {formatPrice(item.price)} ден
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                        className="w-16 text-center"
                      />
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="h-8 w-8 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="text-right min-w-0">
                      <p className="font-bold">
                        {formatPrice((parseFloat(item.price) * item.quantity).toString())} ден
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.productId)}
                        className="text-red-600 hover:text-red-700 mt-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Link href="/products">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Продолжи со купување
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Резиме на нарачка</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Под вкупно:</span>
                <span>{formatPrice(totalPrice.toString())} ден</span>
              </div>
              
              <div className="flex justify-between">
                <span>Достава:</span>
                <span className={shippingCost === 0 ? "text-green-600" : ""}>
                  {shippingCost === 0 ? "Бесплатно" : `${formatPrice(shippingCost.toString())} ден`}
                </span>
              </div>

              {totalPrice < 3000 && (
                <p className="text-sm text-gray-600">
                  Додај уште {formatPrice((3000 - totalPrice).toString())} ден за бесплатна достава
                </p>
              )}
              
              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Вкупно:</span>
                <span className="text-auto-red">
                  {formatPrice(finalTotal.toString())} ден
                </span>
              </div>

              <Link href="/checkout">
                <Button 
                  className="w-full bg-auto-red hover:bg-auto-dark-red text-white"
                  size="lg"
                >
                  Продолжи со нарачка
                </Button>
              </Link>

              <div className="text-center space-y-2 text-sm text-gray-500">
                <p>✓ Сигурно плаќање</p>
                <p>✓ Брза достава</p>
                <p>✓ Гаранција на сите производи</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
