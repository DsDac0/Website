import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Check, CreditCard, Banknote, Building2, CheckCircle, ArrowRight } from "lucide-react";

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  paymentMethod: 'cash' | 'card' | 'bank';
}

export default function Checkout() {
  const { items, clearCart, getTotalPrice, getTotalItems } = useCartStore();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: 'cash'
  });

  const [formErrors, setFormErrors] = useState<Partial<CheckoutForm>>({});

  const totalPrice = getTotalPrice();
  const totalItems = getTotalItems();
  const shippingCost = totalPrice > 3000 ? 0 : 200;
  const finalTotal = totalPrice + shippingCost;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('mk-MK').format(price);
  };

  const validateForm = (): boolean => {
    const errors: Partial<CheckoutForm> = {};

    if (!formData.firstName.trim()) errors.firstName = "Името е задолжително";
    if (!formData.lastName.trim()) errors.lastName = "Презимето е задолжително";
    if (!formData.email.trim()) errors.email = "Емаилот е задолжителен";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Невалиден емаил формат";
    if (!formData.phone.trim()) errors.phone = "Телефонот е задолжителен";
    else if (formData.phone.length < 8) errors.phone = "Телефонот мора да има најмалку 8 карактери";
    if (!formData.address.trim()) errors.address = "Адресата е задолжителна";
    else if (formData.address.length < 5) errors.address = "Адресата мора да има најмалку 5 карактери";
    if (!formData.city.trim()) errors.city = "Градот е задолжителен";
    if (!formData.postalCode.trim()) errors.postalCode = "Поштенскиот код е задолжителен";
    else if (!/^\d{4,5}$/.test(formData.postalCode.replace(/\s/g, ''))) errors.postalCode = "Поштенскиот код мора да содржи 4-5 цифри";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const orderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await apiRequest('POST', '/api/orders', orderData);
      return response.json();
    },
    onSuccess: (order) => {
      setOrderId(order.id);
      setOrderConfirmed(true);
      clearCart();
      toast({
        title: "Нарачката е успешна!",
        description: "Ќе добиете потврда на вашиот емаил.",
      });
    },
    onError: () => {
      toast({
        title: "Грешка",
        description: "Се случи грешка при поднесување на нарачката. Обидете се повторно.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateForm()) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleSubmitOrder = () => {
    if (!validateForm()) {
      setCurrentStep(1);
      return;
    }

    const orderData = {
      order: {
        ...formData,
        total: finalTotal.toString()
      },
      items: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    };

    orderMutation.mutate(orderData);
  };

  // Redirect to cart if empty
  if (items.length === 0 && !orderConfirmed) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold mb-4">Кошничката е празна</h2>
            <p className="text-gray-600 mb-6">
              Додајте производи во кошничката за да продолжите со нарачката
            </p>
            <Link href="/products">
              <Button className="bg-auto-red hover:bg-auto-dark-red text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад кон производи
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Order Confirmation
  if (orderConfirmed) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-auto-black mb-4">
              Нарачката е успешно поднесена!
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Ви благодариме за вашата нарачка. Ќе добиете потврда на вашиот емаил.
            </p>
            
            {orderId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Број на нарачка</p>
                <p className="text-xl font-bold text-auto-red">#{orderId}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold">Достава на:</p>
                  <p>{formData.firstName} {formData.lastName}</p>
                  <p>{formData.address}</p>
                  <p>{formData.city}, {formData.postalCode}</p>
                </div>
                <div>
                  <p className="font-semibold">Начин на плаќање:</p>
                  <p>
                    {formData.paymentMethod === 'cash' && 'Плаќање при достава'}
                    {formData.paymentMethod === 'card' && 'Картичка'}
                    {formData.paymentMethod === 'bank' && 'Банкарски трансфер'}
                  </p>
                  <p className="font-semibold mt-2">Вкупно: {formatPrice(finalTotal)} ден</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/products">
                <Button variant="outline">
                  Продолжи со купување
                </Button>
              </Link>
              <Link href="/">
                <Button className="bg-auto-red hover:bg-auto-dark-red text-white">
                  Назад на почетна
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-auto-black mb-4">Завршете ја нарачката</h1>
        <p className="text-gray-600">
          Внесете ги вашите податоци за да ја завршите нарачката
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            currentStep >= 1 ? 'bg-auto-red text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {currentStep > 1 ? <Check className="h-4 w-4" /> : '1'}
          </div>
          <div className={`w-16 h-1 mx-2 ${currentStep >= 2 ? 'bg-auto-red' : 'bg-gray-300'}`}></div>
          
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            currentStep >= 2 ? 'bg-auto-red text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            {currentStep > 2 ? <Check className="h-4 w-4" /> : '2'}
          </div>
          <div className={`w-16 h-1 mx-2 ${currentStep >= 3 ? 'bg-auto-red' : 'bg-gray-300'}`}></div>
          
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            currentStep >= 3 ? 'bg-auto-red text-white' : 'bg-gray-300 text-gray-600'
          }`}>
            3
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left Column - Forms */}
        <div>
          {/* Step 1: Delivery Information */}
          {currentStep >= 1 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="w-6 h-6 bg-auto-red text-white rounded-full flex items-center justify-center text-sm mr-3">
                    1
                  </span>
                  Информации за достава
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Име *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={formErrors.firstName ? 'border-red-500' : ''}
                      disabled={currentStep > 1}
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Презиме *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={formErrors.lastName ? 'border-red-500' : ''}
                      disabled={currentStep > 1}
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Емаил *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={formErrors.email ? 'border-red-500' : ''}
                    disabled={currentStep > 1}
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Телефон *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={formErrors.phone ? 'border-red-500' : ''}
                    disabled={currentStep > 1}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Адреса *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={formErrors.address ? 'border-red-500' : ''}
                    disabled={currentStep > 1}
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">Град *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className={formErrors.city ? 'border-red-500' : ''}
                      disabled={currentStep > 1}
                    />
                    {formErrors.city && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="postalCode">Поштенски број *</Label>
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      className={formErrors.postalCode ? 'border-red-500' : ''}
                      disabled={currentStep > 1}
                    />
                    {formErrors.postalCode && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.postalCode}</p>
                    )}
                  </div>
                </div>

                {currentStep === 1 && (
                  <Button 
                    onClick={handleNextStep}
                    className="w-full bg-auto-red hover:bg-auto-dark-red text-white"
                  >
                    Продолжи
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Payment Method */}
          {currentStep >= 2 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="w-6 h-6 bg-auto-red text-white rounded-full flex items-center justify-center text-sm mr-3">
                    {currentStep > 2 ? <Check className="h-3 w-3" /> : '2'}
                  </span>
                  Начин на плаќање
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleInputChange('paymentMethod', value as 'cash' | 'card' | 'bank')}
                  disabled={currentStep > 2}
                >
                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="cash" id="cash" />
                    <Banknote className="h-5 w-5 text-auto-red" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Плаќање при достава</p>
                        <p className="text-sm text-gray-600">Платете кога ќе го добиете производот</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="card" id="card" />
                    <CreditCard className="h-5 w-5 text-auto-red" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Дебитна/кредитна картичка</p>
                        <p className="text-sm text-gray-600">Сигурно плаќање со картичка</p>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                    <RadioGroupItem value="bank" id="bank" />
                    <Building2 className="h-5 w-5 text-auto-red" />
                    <Label htmlFor="bank" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Банкарски трансфер</p>
                        <p className="text-sm text-gray-600">Директен трансфер на сметка</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {currentStep === 2 && (
                  <div className="flex gap-4 mt-6">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Назад
                    </Button>
                    <Button 
                      onClick={handleNextStep}
                      className="flex-1 bg-auto-red hover:bg-auto-dark-red text-white"
                    >
                      Продолжи
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Confirm */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="w-6 h-6 bg-auto-red text-white rounded-full flex items-center justify-center text-sm mr-3">
                    3
                  </span>
                  Преглед и потврда
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Информации за достава:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.postalCode}</p>
                      <p>{formData.phone}</p>
                      <p>{formData.email}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Начин на плаќање:</h4>
                    <div className="bg-gray-50 p-3 rounded-lg text-sm">
                      {formData.paymentMethod === 'cash' && 'Плаќање при достава'}
                      {formData.paymentMethod === 'card' && 'Дебитна/кредитна картичка'}
                      {formData.paymentMethod === 'bank' && 'Банкарски трансфер'}
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentStep(2)}
                      className="flex-1"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Назад
                    </Button>
                    <Button 
                      onClick={handleSubmitOrder}
                      disabled={orderMutation.isPending}
                      className="flex-1 bg-auto-red hover:bg-auto-dark-red text-white"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {orderMutation.isPending ? 'Се обработува...' : 'Потврди нарачка'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Order Summary */}
        <div>
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle>Вашата нарачка</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Cart Items */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.imageUrl || "/placeholder-product.jpg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm truncate max-w-[200px]">{item.name}</p>
                        <p className="text-xs text-gray-600">Количина: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-sm">
                      {formatPrice(parseFloat(item.price) * item.quantity)} ден
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Под вкупно:</span>
                  <span>{formatPrice(totalPrice)} ден</span>
                </div>
                
                <div className="flex justify-between">
                  <span>Достава:</span>
                  <span className={shippingCost === 0 ? "text-green-600" : ""}>
                    {shippingCost === 0 ? "Бесплатно" : `${formatPrice(shippingCost)} ден`}
                  </span>
                </div>

                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Вкупно:</span>
                  <span className="text-auto-red">
                    {formatPrice(finalTotal)} ден
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-2 text-sm text-gray-500">
                <p>✓ Сигурно плаќање</p>
                <p>✓ Брза достава</p>
                <p>✓ Гаранција на сите производи</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Back to Cart */}
      <div className="mt-8">
        <Link href="/cart">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад кон кошничка
          </Button>
        </Link>
      </div>
    </div>
  );
}
