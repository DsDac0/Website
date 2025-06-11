import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Award, Truck, Shield } from "lucide-react";

export default function About() {
  const features = [
    {
      icon: CheckCircle,
      title: "Над 50,000 различни производи",
      description: "Најголемиот асортиман на автомобилски делови во Македонија"
    },
    {
      icon: Truck,
      title: "Брза достава низ цела Македонија",
      description: "Достава во рок од 24-48 часа до вашата адреса"
    },
    {
      icon: Users,
      title: "Професионални совети",
      description: "Наши експерти се секогаш спремни да ви помогнат"
    },
    {
      icon: Shield,
      title: "Гаранција на сите производи",
      description: "Сите производи доаѓаат со официјална гаранција"
    }
  ];

  const stats = [
    { number: "15+", label: "Години искуство" },
    { number: "50,000+", label: "Производи" },
    { number: "10,000+", label: "Задоволни клиенти" },
    { number: "100+", label: "Марки автомобили" }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-bg text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">За MEGA AUTO PARTS</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Веќе повеќе од 15 години сме лидери на македонскиот пазар за автомобилски делови. 
            Нашата мисија е да обезбедиме квалитетни, оригинални и заменски делови за сите марки автомобили.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-auto-red mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold text-auto-black mb-6">Нашата приказна</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  MEGA AUTO PARTS започна како мала семејна фирма во 2009 година со мисија да им обезбеди на 
                  македонските возачи најквалитетни автомобилски делови по достапни цени.
                </p>
                <p>
                  Денес сме една од водечките компании за автомобилски делови во земјата, со тим од професионалци 
                  кои секојдневно работат за да ги исполнат потребите на нашите клиенти.
                </p>
                <p>
                  Нашиот успех се заснова на три столба: квалитет, доверба и професионалност. Секој дел што го 
                  продаваме е внимателно селектиран и тестиран за да обезбедиме максимална сигурност и задоволство.
                </p>
              </div>
            </div>
            <div>
              <img
                src="https://pixabay.com/get/g02efa66d1c2fe9220208f9dedc8879de9497dafadf9195320c7f7a0679ac2f156e1ed678c044692b0da4267618d55633bbca6c83e8c8d7714e87950b893b7551_1280.jpg"
                alt="Automotive service center"
                className="rounded-xl shadow-lg w-full h-auto"
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-4xl font-bold text-auto-black text-center mb-12">Зошто да не изберете нас?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center card-hover">
                  <CardContent className="p-6">
                    <feature.icon className="h-12 w-12 text-auto-red mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Mission & Vision */}
          <div className="grid lg:grid-cols-2 gap-12">
            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 text-auto-red mr-3" />
                  <h3 className="text-2xl font-bold text-auto-black">Наша мисија</h3>
                </div>
                <p className="text-gray-600">
                  Да бидеме најдоверливиот партнер за автомобилски делови во Македонија, обезбедувајќи 
                  квалитетни производи, професионална услуга и стручни совети за секој клиент.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-auto-red mr-3" />
                  <h3 className="text-2xl font-bold text-auto-black">Наша визија</h3>
                </div>
                <p className="text-gray-600">
                  Да станеме регионален лидер во продажбата на автомобилски делови, проширувајќи го нашиот 
                  асортиман и услугите за да ги задоволиме сите потреби на современите возачи.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-auto-black mb-4">Наш тим</h2>
            <p className="text-xl text-gray-600">
              Професионалци со долгогодишно искуство во автомобилската индустрија
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-20 h-20 bg-auto-red rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Техничка поддршка</h3>
                <p className="text-gray-600">
                  Наши техничари се специјализирани за сите видови автомобилски делови и секогаш се 
                  спремни да ви помогнат со стручни совети.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-20 h-20 bg-auto-red rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Truck className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Логистика</h3>
                <p className="text-gray-600">
                  Нашиот логистички тим обезбедува брза и сигурна достава на сите производи 
                  директно до вашата адреса.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center card-hover">
              <CardContent className="p-6">
                <div className="w-20 h-20 bg-auto-red rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Контрола на квалитет</h3>
                <p className="text-gray-600">
                  Секој производ поминува низ строга контрола на квалитет за да обезбедиме 
                  дека добивате само најдобри делови.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
