import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const API_BASE = {
  auth: "https://functions.poehali.dev/3485a554-5cc2-43d6-8e1f-ca0520a63d4e",
  users: "https://functions.poehali.dev/cb482cc1-eb6b-4fe2-8787-e6c451cb0865",
  calls: "https://functions.poehali.dev/2f1fdd03-69fe-4997-8a4b-0440e231d2a5"
};

type User = {
  id: number;
  username: string;
  full_name: string;
  role: string;
  status: string;
  phone_extension: string;
};

type Call = {
  id: number;
  caller_number: string;
  operator_name: string;
  status: string;
  duration: number;
  started_at: string;
  notes: string;
};

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [isDialpadOpen, setIsDialpadOpen] = useState(false);
  const [dialNumber, setDialNumber] = useState("");
  
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "operator",
    phone_extension: ""
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(API_BASE.auth, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCurrentUser(data);
        setIsAuthenticated(true);
        toast.success("Вход выполнен успешно!");
      } else {
        toast.error(data.error || "Неверный логин или пароль");
      }
    } catch (error) {
      toast.error("Ошибка подключения к серверу");
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch(API_BASE.users);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast.error("Ошибка загрузки пользователей");
    }
  };

  const loadCalls = async () => {
    try {
      const response = await fetch(API_BASE.calls);
      const data = await response.json();
      setCalls(data);
    } catch (error) {
      toast.error("Ошибка загрузки звонков");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
      loadCalls();
      const interval = setInterval(() => {
        loadUsers();
        loadCalls();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleDialpadClick = (digit: string) => {
    setDialNumber(prev => prev + digit);
  };

  const handleCall = async () => {
    if (!dialNumber) {
      toast.error("Введите номер телефона");
      return;
    }

    try {
      const response = await fetch(API_BASE.calls, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "initiate",
          caller_number: dialNumber
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        setIsDialpadOpen(false);
        setDialNumber("");
        loadCalls();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Ошибка при совершении звонка");
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(API_BASE.users, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingUser)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Пользователь обновлен");
        setIsEditUserOpen(false);
        loadUsers();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Ошибка обновления пользователя");
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password || !newUser.full_name) {
      toast.error("Заполните все обязательные поля");
      return;
    }

    try {
      const response = await fetch(API_BASE.users, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success("Пользователь добавлен");
        setIsAddUserOpen(false);
        setNewUser({
          username: "",
          password: "",
          full_name: "",
          role: "operator",
          phone_extension: ""
        });
        loadUsers();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error("Ошибка добавления пользователя");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;

    try {
      const response = await fetch(`${API_BASE.users}?id=${userId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast.success("Пользователь удален");
        loadUsers();
      }
    } catch (error) {
      toast.error("Ошибка удаления пользователя");
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Дашборд", icon: "LayoutDashboard" },
    { id: "calls", label: "Звонки", icon: "Phone" },
    { id: "employees", label: "Сотрудники", icon: "Users" },
    { id: "reports", label: "Отчеты", icon: "BarChart3" },
    { id: "clients", label: "Клиенты", icon: "Building2" },
    { id: "settings", label: "Настройки", icon: "Settings" },
  ];

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      online: "bg-green-500",
      offline: "bg-gray-500",
      busy: "bg-red-500",
      break: "bg-yellow-500"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500";
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      online: "Онлайн",
      offline: "Офлайн",
      busy: "Занят",
      break: "Перерыв"
    };
    return labels[status as keyof typeof labels] || status;
  };

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
            <CardTitle className="text-2xl font-semibold">Система телефонии Sity-contact</CardTitle>
            <CardDescription>Вход только для сотрудников КЦ Sity-contact</CardDescription>
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
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Вход..." : "Войти в систему"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderDashboard = () => {
    const onlineOperators = users.filter(u => u.role === 'operator' && u.status === 'online');
    const activeCalls = calls.filter(c => c.status === 'active');
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Активных звонков</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-3xl font-bold">{activeCalls.length}</h3>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-100">
                  <Icon name="Phone" size={24} className="text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Операторов на линии</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-3xl font-bold">{onlineOperators.length}</h3>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-100">
                  <Icon name="Users" size={24} className="text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Всего звонков</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-3xl font-bold">{calls.length}</h3>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-100">
                  <Icon name="BarChart3" size={24} className="text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Всего сотрудников</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <h3 className="text-3xl font-bold">{users.length}</h3>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-slate-100">
                  <Icon name="UserCheck" size={24} className="text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Активные операторы</CardTitle>
            <CardDescription>Операторы онлайн и доступны для приема звонков</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {onlineOperators.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="User" size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{user.full_name}</p>
                      <p className="text-xs text-muted-foreground">Внутренний: {user.phone_extension}</p>
                    </div>
                  </div>
                  <Badge className={getStatusBadgeColor(user.status)}>
                    {getStatusLabel(user.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderCalls = () => (
    <Card>
      <CardHeader>
        <CardTitle>История звонков</CardTitle>
        <CardDescription>Все звонки в системе</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {calls.map((call) => (
            <div key={call.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="Phone" size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{call.caller_number}</p>
                  <p className="text-xs text-muted-foreground">{call.operator_name || "Не назначен"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{Math.floor(call.duration / 60)}:{(call.duration % 60).toString().padStart(2, '0')}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(call.started_at).toLocaleTimeString("ru-RU", { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <Badge variant={call.status === "active" ? "default" : "secondary"}>
                  {call.status === "active" ? "Активный" : call.status === "completed" ? "Завершен" : "В очереди"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderEmployees = () => (
    <div className="space-y-6">
      {currentUser?.role === "super_admin" && (
        <div className="flex justify-end">
          <Button onClick={() => setIsAddUserOpen(true)}>
            <Icon name="UserPlus" size={18} className="mr-2" />
            Добавить сотрудника
          </Button>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Все сотрудники</CardTitle>
          <CardDescription>Управление сотрудниками контакт-центра</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name={user.role === "super_admin" ? "Shield" : "User"} size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.username} • Внутренний: {user.phone_extension}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={getStatusBadgeColor(user.status)}>
                    {getStatusLabel(user.status)}
                  </Badge>
                  <Badge variant="outline">
                    {user.role === "super_admin" ? "Администратор" : "Оператор"}
                  </Badge>
                  {currentUser?.role === "super_admin" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUser(user);
                          setIsEditUserOpen(true);
                        }}
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside className="w-64 bg-secondary text-white flex flex-col shadow-lg">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Phone" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Sity-contact</h1>
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
              <p className="font-medium text-sm">{currentUser?.full_name}</p>
              <p className="text-xs text-slate-400">
                {currentUser?.role === "super_admin" ? "Администратор" : "Оператор"}
              </p>
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
              <Button variant="default" size="sm" onClick={() => setIsDialpadOpen(true)}>
                <Icon name="PhoneCall" size={18} className="mr-2" />
                Набрать номер
              </Button>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeSection === "dashboard" && renderDashboard()}
          {activeSection === "calls" && renderCalls()}
          {activeSection === "employees" && renderEmployees()}
          {activeSection === "reports" && (
            <Card>
              <CardHeader>
                <CardTitle>Отчеты</CardTitle>
                <CardDescription>Раздел в разработке</CardDescription>
              </CardHeader>
            </Card>
          )}
          {activeSection === "clients" && (
            <Card>
              <CardHeader>
                <CardTitle>Клиенты</CardTitle>
                <CardDescription>Раздел в разработке</CardDescription>
              </CardHeader>
            </Card>
          )}
          {activeSection === "settings" && (
            <Card>
              <CardHeader>
                <CardTitle>Настройки</CardTitle>
                <CardDescription>Раздел в разработке</CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={isDialpadOpen} onOpenChange={setIsDialpadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Набор номера</DialogTitle>
            <DialogDescription>
              Введите номер телефона и нажмите "Позвонить"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={dialNumber}
              onChange={(e) => setDialNumber(e.target.value)}
              placeholder="+7 (___) ___-__-__"
              className="text-center text-2xl h-16"
            />
            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((digit) => (
                <Button
                  key={digit}
                  variant="outline"
                  size="lg"
                  onClick={() => handleDialpadClick(digit)}
                  className="text-xl h-16"
                >
                  {digit}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setDialNumber("")}>
              Очистить
            </Button>
            <Button onClick={handleCall} className="gap-2">
              <Icon name="Phone" size={18} />
              Позвонить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактировать сотрудника</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Полное имя</Label>
                <Input
                  value={editingUser.full_name}
                  onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Логин</Label>
                <Input
                  value={editingUser.username}
                  onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Внутренний номер</Label>
                <Input
                  value={editingUser.phone_extension}
                  onChange={(e) => setEditingUser({ ...editingUser, phone_extension: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Статус</Label>
                <Select
                  value={editingUser.status}
                  onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">Онлайн</SelectItem>
                    <SelectItem value="offline">Офлайн</SelectItem>
                    <SelectItem value="busy">Занят</SelectItem>
                    <SelectItem value="break">Перерыв</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operator">Оператор</SelectItem>
                    <SelectItem value="super_admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleUpdateUser}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить сотрудника</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Полное имя *</Label>
              <Input
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                placeholder="Иванов Иван Иванович"
              />
            </div>
            <div className="space-y-2">
              <Label>Логин *</Label>
              <Input
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                placeholder="ivanov"
              />
            </div>
            <div className="space-y-2">
              <Label>Пароль *</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="********"
              />
            </div>
            <div className="space-y-2">
              <Label>Внутренний номер</Label>
              <Input
                value={newUser.phone_extension}
                onChange={(e) => setNewUser({ ...newUser, phone_extension: e.target.value })}
                placeholder="1010"
              />
            </div>
            <div className="space-y-2">
              <Label>Роль</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operator">Оператор</SelectItem>
                  <SelectItem value="super_admin">Администратор</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddUser}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
