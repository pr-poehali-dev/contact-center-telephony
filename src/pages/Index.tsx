import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      setIsAuthenticated(true);
    }
  };

  const stats = [
    { label: "Активных звонков", value: "12", icon: "Phone", trend: "+3", color: "text-green-600" },
    { label: "Операторов на линии", value: "24", icon: "Users", trend: "+2", color: "text-blue-600" },
    { label: "Среднее время ответа", value: "45с", icon: "Clock", trend: "-5с", color: "text-orange-600" },
    { label: "Уровень сервиса", value: "94%", icon: "TrendingUp", trend: "+2%", color: "text-green-600" },
  ];

  const recentCalls = [
    { id: 1, client: "ООО \"Рога и Копыта\"", operator: "Иванов И.И.", duration: "12:34", status: "completed", time: "10:23" },
    { id: 2, client: "ИП Петров", operator: "Сидорова А.С.", duration: "08:15", status: "completed", time: "10:15" },
    { id: 3, client: "ЗАО \"Технологии\"", operator: "Смирнов П.К.", duration: "15:42", status: "active", time: "10:08" },
    { id: 4, client: "ООО \"Инновации\"", operator: "Кузнецова М.В.", duration: "05:23", status: "completed", time: "09:58" },
  ];

  const menuItems = [
    { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
    { id: "calls", label: "Звонки", icon: "Phone" },
    { id: "employees", label: "Сотрудники", icon: "Users" },
    { id: "reports", label: "Отчеты", icon: "BarChart3" },
    { id: "clients", label: "Клиенты", icon: "Building2" },
    { id: "settings", label: "Настройки", icon: "Settings" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
                <Icon name="Phone" size={32} className="text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold">Система телефонии</CardTitle>
            <CardDescription>Вход для сотрудников контакт-центра</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Введите логин"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Войти в систему
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-secondary text-white flex flex-col shadow-lg">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Phone" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">CallCenter</h1>
              <p className="text-xs text-slate-300">Контакт-центр</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeSection === item.id
                  ? "bg-sidebar-accent text-white"
                  : "text-slate-300 hover:bg-sidebar-accent/50 hover:text-white"
              }`}
            >
              <Icon name={item.icon} size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 bg-sidebar-accent rounded-full flex items-center justify-center">
              <Icon name="User" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{username}</p>
              <p className="text-xs text-slate-400">Оператор</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAuthenticated(false)}
              className="hover:bg-sidebar-accent"
            >
              <Icon name="LogOut" size={18} />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">
                {menuItems.find((item) => item.id === activeSection)?.label}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {new Date().toLocaleDateString("ru-RU", { 
                  weekday: "long", 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                })}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Icon name="Bell" size={18} className="mr-2" />
                Уведомления
              </Button>
              <Button variant="default" size="sm">
                <Icon name="PhoneCall" size={18} className="mr-2" />
                Новый звонок
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <h3 className="text-3xl font-bold">{stat.value}</h3>
                        <span className={`text-sm font-medium ${stat.color}`}>{stat.trend}</span>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg bg-slate-100`}>
                      <Icon name={stat.icon} size={24} className="text-slate-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Последние звонки</CardTitle>
                <CardDescription>Активность операторов в реальном времени</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentCalls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Icon name="Phone" size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{call.client}</p>
                          <p className="text-xs text-muted-foreground">{call.operator}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium">{call.duration}</p>
                          <p className="text-xs text-muted-foreground">{call.time}</p>
                        </div>
                        <Badge
                          variant={call.status === "active" ? "default" : "secondary"}
                          className={call.status === "active" ? "bg-green-500" : ""}
                        >
                          {call.status === "active" ? "В процессе" : "Завершен"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Активные операторы</CardTitle>
                <CardDescription>24 из 30 на линии</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Иванов И.И.", "Сидорова А.С.", "Смирнов П.К.", "Кузнецова М.В.", "Петров Д.Н."].map(
                    (name, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Icon name="User" size={16} className="text-primary" />
                          </div>
                          <span className="text-sm font-medium">{name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-muted-foreground">Онлайн</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>График звонков за день</CardTitle>
              <CardDescription>Распределение нагрузки по часам</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2">
                {[45, 62, 58, 73, 89, 95, 87, 78, 92, 85, 67, 54].map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-lg transition-all cursor-pointer relative group" style={{ height: `${height}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {Math.round(height * 1.2)} звонков
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{9 + index}:00</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
