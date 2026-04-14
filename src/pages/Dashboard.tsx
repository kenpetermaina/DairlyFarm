import { useFarmStore } from "@/store/farmStore";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Plus, Milk, Pencil, Trash2, Beef, HeartPulse, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import PrintButton from "@/components/PrintButton";

export default function Dashboard() {
  const { cows, milkRecords, addCow, addMilkRecord, deleteCow, updateCow } = useFarmStore();
  const [cowDialogOpen, setCowDialogOpen] = useState(false);
  const [milkDialogOpen, setMilkDialogOpen] = useState(false);
  const [editCow, setEditCow] = useState<any>(null);
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('day');
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const todayMilk = milkRecords.filter((r) => r.date === today).reduce((s, r) => s + r.amount_liters, 0);
  const healthyCows = cows.filter((c) => c.status === "healthy").length;
  const needAttention = cows.filter((c) => c.status !== "healthy").length;

  const getDateRange = (period: 'day' | 'week' | 'month') => {
    const now = new Date();
    const start = new Date();
    if (period === 'day') {
      start.setDate(now.getDate() - 6); // last 7 days
    } else if (period === 'week') {
      start.setDate(now.getDate() - 27); // last 4 weeks
    } else {
      start.setMonth(now.getMonth() - 11); // last 12 months
    }
    return { start: start.toISOString().split('T')[0], end: now.toISOString().split('T')[0] };
  };

  const { start: periodStart, end: periodEnd } = getDateRange(timePeriod);

  const filteredRecords = milkRecords.filter(r => r.date >= periodStart && r.date <= periodEnd);

  const cowProduction = cows.map(cow => {
    const cowRecords = filteredRecords.filter(r => r.cow_id === cow.id);
    const totalMilk = cowRecords.reduce((sum, r) => sum + r.amount_liters, 0);
    const proceeds = totalMilk * 2; // Assume $2 per liter
    return {
      name: cow.name,
      tag: cow.tag_number,
      milk: totalMilk,
      proceeds
    };
  }).filter(c => c.milk > 0);

  const barData = cowProduction.map(c => ({ name: c.tag, milk: c.milk }));

  const pieData = cowProduction.map(c => ({ name: c.tag, value: c.proceeds }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const totalProduction = cowProduction.reduce((sum, c) => sum + c.milk, 0);
  const totalProceeds = cowProduction.reduce((sum, c) => sum + c.proceeds, 0);
  const avgProduction = totalProduction / cowProduction.length || 0;

  const recommendations = [
    totalProduction < 50 ? "Consider improving feed quality to boost milk production." : "",
    avgProduction < 5 ? "Some cows are underperforming; check health and nutrition." : "",
    cowProduction.length < cows.filter(c => c.status === 'healthy').length ? "Not all healthy cows are producing; monitor milking schedule." : "",
    totalProceeds > 1000 ? "Excellent production! Consider expanding herd." : ""
  ].filter(r => r).join(" ");

  const dailyData = milkRecords.reduce<Record<string, number>>((acc, r) => {
    acc[r.date] = (acc[r.date] || 0) + r.amount_liters;
    return acc;
  }, {});
  const chartData = Object.entries(dailyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date: date.slice(5), amount }));

  const stats = [
    { label: "Total Cows", value: cows.length, icon: Beef, color: "border-l-primary" },
    { label: "Today's Milk (L)", value: todayMilk, icon: Milk, color: "border-l-accent" },
    { label: "Healthy", value: healthyCows, icon: HeartPulse, color: "border-l-success" },
    { label: "Need Attention", value: needAttention, icon: AlertTriangle, color: "border-l-warning" },
  ];

  const [newCow, setNewCow] = useState({ tag_number: "", name: "", breed: "", date_of_birth: "", gender: "female" as "male" | "female", status: "healthy" as const });
  const [newMilk, setNewMilk] = useState({ cow_id: "", amount_liters: "", session: "Morning" as "Morning" | "Lunch" | "Evening" });

  const handleAddCow = async () => {
    if (!newCow.tag_number || !newCow.name) return toast.error("Fill required fields");
    try {
      const cow = {
        tag_number: newCow.tag_number,
        name: newCow.name,
        breed: newCow.breed || null,
        date_of_birth: newCow.date_of_birth || null,
        gender: newCow.gender,
        status: newCow.status,
      };
      if (editCow) {
        await updateCow(editCow.id, cow);
        toast.success("Cow updated");
      } else {
        await addCow(cow);
        toast.success("Cow added");
      }
      setNewCow({ tag_number: "", name: "", breed: "", date_of_birth: "", gender: "female", status: "healthy" });
      setEditCow(null);
      setCowDialogOpen(false);
    } catch (error) {
      toast.error("Failed to save cow");
    }
  };

  const handleAddMilk = async () => {
    if (!newMilk.cow_id || !newMilk.amount_liters) return toast.error("Fill required fields");
    try {
      await addMilkRecord({
        cow_id: newMilk.cow_id,
        date: today,
        amount_liters: Number(newMilk.amount_liters),
        session: newMilk.session
      });
      toast.success("Milk logged");
      setNewMilk({ cow_id: "", amount_liters: "", session: "Morning" });
      setMilkDialogOpen(false);
    } catch (error) {
      toast.error("Failed to log milk");
    }
  };

  const openEdit = (cow: any) => {
    setEditCow(cow);
    setNewCow({ 
      tag_number: cow.tag_number, 
      name: cow.name, 
      breed: cow.breed || "", 
      date_of_birth: cow.date_of_birth || "", 
      gender: cow.gender || "female", 
      status: cow.status 
    });
    setCowDialogOpen(true);
  };

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your herd & production" actions={
        <>
          <PrintButton />
          <Dialog open={milkDialogOpen} onOpenChange={setMilkDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Milk className="h-4 w-4 mr-1" />Log Milk</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Milk Production</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Select value={newMilk.cow_id} onValueChange={(v) => setNewMilk({ ...newMilk, cow_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select cow" /></SelectTrigger>
                  <SelectContent>{cows.map((c) => <SelectItem key={c.id} value={c.id}>{c.tag_number} - {c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Input placeholder="Amount (L)" type="number" value={newMilk.amount_liters} onChange={(e) => setNewMilk({ ...newMilk, amount_liters: e.target.value })} />
                <Select value={newMilk.session} onValueChange={(v: any) => setNewMilk({ ...newMilk, session: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Morning">Morning</SelectItem>
                    <SelectItem value="Lunch">Lunch</SelectItem>
                    <SelectItem value="Evening">Evening</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleAddMilk} className="w-full">Log</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild><Button variant="outline"><Lightbulb className="h-4 w-4 mr-1" />AI Assistance</Button></DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>🐄 Dairy Farming AI Assistant</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">📊 Production Targets</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Healthy Cow Daily:</strong> 15-25 liters per day</li>
                    <li>• <strong>Monthly Target:</strong> 450-750 liters per cow</li>
                    <li>• <strong>Annual Production:</strong> 5,400-9,000 liters per cow</li>
                    <li>• <strong>Lactation Cycle:</strong> 305 days per year</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">🍃 Feeding & Nutrition</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>Daily Feed:</strong> 3-5% of body weight (50-75 kg for 1,500 lb cow)</li>
                    <li>• <strong>Water Intake:</strong> 20-30 liters per day (increase with milking)</li>
                    <li>• <strong>Grass/Hay:</strong> High-quality pasture or hay during dry seasons</li>
                    <li>• <strong>Concentrate:</strong> 1-2 kg for every 2-3 liters of milk produced</li>
                    <li>• <strong>Minerals:</strong> Calcium, phosphorus, magnesium daily</li>
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-900 mb-2">❤️ Health & Disease Prevention</h4>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• <strong>Mastitis Prevention:</strong> Clean udders before & after milking</li>
                    <li>• <strong>Vaccination:</strong> Brucellosis, FMD, blackleg (annually)</li>
                    <li>• <strong>Parasite Control:</strong> Deworm every 4-6 weeks</li>
                    <li>• <strong>Health Check:</strong> Monitor temperature, appetite, milk quality daily</li>
                    <li>• <strong>Hygiene:</strong> Clean barn/milking equipment 2x daily</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-2">🌡️ Environmental Management</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• <strong>Temperature:</strong> Ideal 10-18°C (50-65°F)</li>
                    <li>• <strong>Ventilation:</strong> 6-10 air changes per hour</li>
                    <li>• <strong>Lighting:</strong> 14-16 hours per day increases milk yield</li>
                    <li>• <strong>Resting:</strong> 8-10 hours of uninterrupted sleep daily</li>
                    <li>• <strong>Milking Schedule:</strong> Consistent times (e.g., 5 AM & 5 PM)</li>
                  </ul>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-900 mb-2">🔄 Best Practices</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• <strong>Breeding:</strong> Calve at 24-28 months for optimal productivity</li>
                    <li>• <strong>Dry Period:</strong> 60 days rest after lactation improves next cycle</li>
                    <li>• <strong>Record Keeping:</strong> Track milk, health, breeding, expenses</li>
                    <li>• <strong>Genetic Selection:</strong> Keep high-producing, healthy cows</li>
                    <li>• <strong>Consultation:</strong> Work with veterinarian quarterly</li>
                  </ul>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-2">💡 When Production Drops</h4>
                  <p className="text-sm text-indigo-800 mb-2">Check these in order:</p>
                  <ul className="text-sm text-indigo-800 space-y-1">
                    <li>1. Stress or Environmental Changes (heat, disturbance)</li>
                    <li>2. Nutrition Deficiency (poor feed quality, low water)</li>
                    <li>3. Illness (fever, lameness, mastitis, pregnancy)</li>
                    <li>4. Milking Issues (improper technique, equipment problems)</li>
                    <li>5. Age/Lactation Stage (natural decline near end of cycle)</li>
                  </ul>
                </div>
              </div>
              <Button onClick={() => setAiDialogOpen(false)} className="w-full mt-4">Close</Button>
            </DialogContent>
          </Dialog>
          <Dialog open={cowDialogOpen} onOpenChange={(o) => { setCowDialogOpen(o); if (!o) setEditCow(null); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Add Cow</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editCow ? "Edit Cow" : "Add Cow"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Tag Number (e.g. C-006)" value={newCow.tag_number} onChange={(e) => setNewCow({ ...newCow, tag_number: e.target.value })} />
                <Input placeholder="Name" value={newCow.name} onChange={(e) => setNewCow({ ...newCow, name: e.target.value })} />
                <Input placeholder="Breed" value={newCow.breed} onChange={(e) => setNewCow({ ...newCow, breed: e.target.value })} />
                <Input placeholder="Date of Birth" type="date" value={newCow.date_of_birth} onChange={(e) => setNewCow({ ...newCow, date_of_birth: e.target.value })} />
                <Select value={newCow.gender} onValueChange={(v: any) => setNewCow({ ...newCow, gender: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="female">Female</SelectItem><SelectItem value="male">Male</SelectItem></SelectContent>
                </Select>
                <Select value={newCow.status} onValueChange={(v: any) => setNewCow({ ...newCow, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="healthy">Healthy</SelectItem><SelectItem value="sick">Sick</SelectItem><SelectItem value="sold">Sold</SelectItem><SelectItem value="dead">Dead</SelectItem></SelectContent>
                </Select>
                <Button onClick={handleAddCow} className="w-full">{editCow ? "Update" : "Add"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      } />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className={`border-l-4 ${s.color}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Daily Milk Production (Liters)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="hsl(152, 35%, 18%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Milk Production per Cow</h3>
              <div className="flex gap-2">
                <Button variant={timePeriod === 'day' ? 'default' : 'outline'} size="sm" onClick={() => setTimePeriod('day')}>Day</Button>
                <Button variant={timePeriod === 'week' ? 'default' : 'outline'} size="sm" onClick={() => setTimePeriod('week')}>Week</Button>
                <Button variant={timePeriod === 'month' ? 'default' : 'outline'} size="sm" onClick={() => setTimePeriod('month')}>Month</Button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="milk" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">Proceeds per Cow ($)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Production Report & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{totalProduction.toFixed(1)} L</p>
              <p className="text-sm text-muted-foreground">Total Milk</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">${totalProceeds.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Total Proceeds</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{avgProduction.toFixed(1)} L</p>
              <p className="text-sm text-muted-foreground">Avg per Cow</p>
            </div>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Recommendations:</h4>
            <p className="text-sm">{recommendations || "Production is looking good! Keep up the excellent work."}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4">Herd Overview</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag Number</TableHead><TableHead>Name</TableHead><TableHead>Breed</TableHead>
                <TableHead>Date of Birth</TableHead><TableHead>Gender</TableHead><TableHead>Status</TableHead>
                <TableHead className="no-print">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.tag_number}</TableCell><TableCell>{c.name}</TableCell><TableCell>{c.breed}</TableCell>
                  <TableCell>{c.date_of_birth ? new Date(c.date_of_birth).toLocaleDateString() : 'N/A'}</TableCell><TableCell>{c.gender}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "healthy" ? "default" : "destructive"}
                      className={c.status === "healthy" ? "bg-success" : ""}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="no-print">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => { deleteCow(c.id); toast.success("Deleted"); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
