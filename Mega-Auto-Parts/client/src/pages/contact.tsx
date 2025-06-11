import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const { toast } = useToast();

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      return await apiRequest('POST', '/api/contact', data);
    },
    onSuccess: () => {
      toast({
        title: "Пораката е испратена!",
        description: "Ќе ви одговориме во најкраток можен рок.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    },
    onError: () => {
      toast({
        title: "Грешка",
        description: "Се случи грешка при испраќање на пораката. Обидете се повторно.",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Грешка",
        description: "Ве молиме пополнете ги сите задолжителни полиња.",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof ContactForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Телефон",
      details: ["+389 2 123 456", "+389 70 123 456"]
    },
    {
      icon: Mail,
      title: "Емаил",
      details: ["info@megaautoparts.mk", "sales@megaautoparts.mk"]
    },
    {
      icon: Clock,
      title: "Работно време",
      details: ["Понedelник - Петок: 08:00-18:00", "Сабота: 08:00-16:00", "Недела: 10:00-14:00"]
    }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Контактирај не</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Имаш прашања за наши производи или услуги? Нашиот тим е тука за да ти помогне!
          </p>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contactInfo.map((info, index) => (
              <Card key={index} className="text-center card-hover">
                <CardContent className="p-6">
                  <info.icon className="h-12 w-12 text-auto-red mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-3">{info.title}</h3>
                  <div className="space-y-1">
                    {info.details.map((detail, i) => (
                      <p key={i} className="text-gray-600 text-sm">{detail}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-auto-black">Испрати порака</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Име и презиме *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Вашето име"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Емаил *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+389 xx xxx xxx"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Порака *
                    </label>
                    <Textarea
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Вашата порака..."
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-auto-red hover:bg-auto-dark-red text-white"
                    disabled={contactMutation.isPending}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {contactMutation.isPending ? "Се испраќа..." : "Испрати порака"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Наши услуги</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-auto-red mb-2">Онлајн порачки</h4>
                    <p className="text-gray-600 text-sm">
                      Нарачајте директно преку нашата веб-страница со брза достава низ цела Македонија.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-auto-red mb-2">Консултации</h4>
                    <p className="text-gray-600 text-sm">
                      Нашите експерти ќе ви помогнат да ги најдете точно оние делови што ви требаат за вашиот автомобил.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-auto-red mb-2">Брза достава</h4>
                    <p className="text-gray-600 text-sm">
                      Достава до вашата адреса во рок од 24-48 часа за градовите во Македонија.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-auto-red mb-2">Квалитетна гаранција</h4>
                    <p className="text-gray-600 text-sm">
                      Сите производи доаѓаат со официјална гаранција од производителот.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-auto-black mb-4">Често поставувани прашања</h2>
            <p className="text-xl text-gray-600">Одговори на најчестите прашања од нашите клиенти</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="card-hover">
              <CardContent className="p-6">
                <h4 className="font-semibold text-auto-red mb-2">Колку време е потребно за достава?</h4>
                <p className="text-gray-600 text-sm">
                  Стандардната достава е 24-48 часа за Скопје и околина, а 2-3 дена за останатите градови во Македонија.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <h4 className="font-semibold text-auto-red mb-2">Дали имате гаранција на производите?</h4>
                <p className="text-gray-600 text-sm">
                  Да, сите наши производи доаѓаат со официјална гаранција од производителот, обично 12-24 месеци.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <h4 className="font-semibold text-auto-red mb-2">Можам ли да вратам производ?</h4>
                <p className="text-gray-600 text-sm">
                  Да, можете да вратите неупотребен производ во рок од 14 дена од купувањето, со оригинална амбалажа.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-6">
                <h4 className="font-semibold text-auto-red mb-2">Дали можете да ми помогнете да најдам дел?</h4>
                <p className="text-gray-600 text-sm">
                  Секако! Контактирајте не со VIN бројот или детали за вашиот автомобил и ќе ви помогнеме да најдете точно тоа што ви треба.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
