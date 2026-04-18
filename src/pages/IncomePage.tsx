import { useFarmStore, IncomeRecord } from "@/store/farmStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import PrintButton from "@/components/PrintButton";
import { downloadCSV } from "@/lib/downloadUtils";

export default function IncomePage() {
  const { incomeRecords, addIncomeRecord, deleteIncomeRecord } = useFarmStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [open, setOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<IncomeRecord | null>(null);
  const [form, setForm] = useState({ litres: "", pricePerLitre: "", buyer: "" });
  const total = incomeRecords.reduce((s, r) => s + r.total, 0);
  const totalLitres = incomeRecords.reduce((s, r) => s + r.litres, 0);

  const handleDownloadIncome = () => {
    try {
      const data = incomeRecords.map(r => ({
        Date: r.date,
        Litres: r.litres,
        "Price per Litre (KES)": r.pricePerLitre,
        "Total (KES)": r.total,
        Buyer: r.buyer || "—"
      }));
      downloadCSV(data, `income-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success("Income records downloaded successfully");
    } catch (error) {
      toast.error("Failed to download records");
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!selectedSale) return;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const left = 40;
    let top = 55;

    doc.setFontSize(18);
    doc.text("GODII FARM", 300, top, { align: "center" });
    top += 28;
    doc.setFontSize(12);
    doc.text(`Receipt ID: ${selectedSale.receiptId ?? selectedSale.id}`, left, top);
    top += 18;
    doc.text(`Date / Time: ${new Date(selectedSale.createdAt || selectedSale.date).toLocaleString()}`, left, top);
    top += 28;
    doc.setFontSize(14);
    doc.text("Sales Receipt", left, top);
    top += 20;
    doc.setLineWidth(0.5);
    doc.line(left, top, 560, top);
    top += 18;

    doc.setFontSize(12);
    doc.text(`Customer: ${selectedSale.buyer}`, left, top);
    top += 18;
    doc.text(`Product: Milk`, left, top);
    top += 18;
    doc.text(`Quantity: ${selectedSale.litres.toLocaleString()} L`, left, top);
    top += 18;
    doc.text(`Price per Litre: KES ${selectedSale.pricePerLitre.toLocaleString()}`, left, top);
    top += 18;
    doc.text(`Total Amount: KES ${selectedSale.total.toLocaleString()}`, left, top);
    top += 28;
    doc.setFontSize(13);
    doc.text("Thank you!", 300, top, { align: "center" });
    doc.save(`receipt-${selectedSale.receiptId ?? selectedSale.id}.pdf`);
  };

  const totalSale = Number(form.litres || 0) * Number(form.pricePerLitre || 0);

  useEffect(() => {
    const quantity = searchParams.get("prefillQty");
    if (quantity) {
      setForm((prev) => ({ ...prev, litres: quantity }));
      setOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleAdd = () => {
    if (!form.litres || !form.pricePerLitre) return toast.error("Fill required fields");
    const litres = Number(form.litres);
    const price = Number(form.pricePerLitre);
    const now = new Date();
    const receiptId = `GF-${now.getTime().toString().slice(-6)}`;
    const newRecord: IncomeRecord = {
      id: `income_${now.getTime()}`,
      date: now.toISOString().split("T")[0],
      createdAt: now.toISOString(),
      receiptId,
      litres,
      pricePerLitre: price,
      total: litres * price,
      buyer: form.buyer || "Cash Customer",
    };

    addIncomeRecord(newRecord);
    setSelectedSale(newRecord);
    toast.success("Sale saved and receipt generated");
    setForm({ litres: "", pricePerLitre: "", buyer: "" });
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title="Income" subtitle={`Total: KES ${total.toLocaleString()} | ${totalLitres} L sold`} actions={
        <>
          <PrintButton />
          <Button variant="outline" onClick={handleDownloadIncome}>
            <Download className="h-4 w-4 mr-1" />
            Download CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />➕ Add Sale</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Sale</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Customer Name" value={form.buyer} onChange={(e) => setForm({ ...form, buyer: e.target.value })} />
                <Input placeholder="Milk Quantity (L)" type="number" value={form.litres} onChange={(e) => setForm({ ...form, litres: e.target.value })} />
                <Input placeholder="Price per Litre (KES)" type="number" value={form.pricePerLitre} onChange={(e) => setForm({ ...form, pricePerLitre: e.target.value })} />
                <div className="rounded-xl border border-border bg-muted px-4 py-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-semibold">KES {totalSale.toLocaleString()}</span></div>
                </div>
                <Button onClick={handleAdd} className="w-full">Save Sale</Button>
              </div>
            </DialogContent>
          </Dialog>
        </>
      } />
      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Litres</TableHead>
                <TableHead>Price/L</TableHead>
                <TableHead>Total (KES)</TableHead>
                <TableHead>Buyer</TableHead>
                <TableHead className="no-print">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incomeRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No income records yet.
                  </TableCell>
                </TableRow>
              ) : incomeRecords.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell>{r.litres}</TableCell>
                  <TableCell>{r.pricePerLitre}</TableCell>
                  <TableCell>{r.total.toLocaleString()}</TableCell>
                  <TableCell>{r.buyer}</TableCell>
                  <TableCell className="no-print flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedSale(r)}>
                      View
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => { deleteIncomeRecord(r.id); if (selectedSale?.id === r.id) setSelectedSale(null); toast.success("Deleted"); }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedSale ? (
        <Card className="receipt-print-area mt-6 border border-border bg-background">
          <CardContent className="p-6">
            <div className="receipt-content mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="text-center">
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Receipt</p>
                <h2 className="text-2xl font-semibold">GODII FARM</h2>
                <p className="mt-1 text-sm text-muted-foreground">Milk Sales Receipt</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Receipt ID</p>
                  <p className="mt-2 font-semibold">{selectedSale.receiptId ?? selectedSale.id}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Date & Time</p>
                  <p className="mt-2">{new Date(selectedSale.createdAt || selectedSale.date).toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex justify-between text-sm text-muted-foreground"><span>Customer</span><span>{selectedSale.buyer}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Product</span><span>Milk</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Quantity</span><span>{selectedSale.litres.toLocaleString()} L</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Price per Litre</span><span>KES {selectedSale.pricePerLitre.toLocaleString()}</span></div>
                <div className="flex justify-between text-sm text-muted-foreground"><span>Total Amount</span><span className="font-semibold">KES {selectedSale.total.toLocaleString()}</span></div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button className="w-full sm:w-auto" onClick={handlePrintReceipt}>Print Receipt</Button>
                <Button className="w-full sm:w-auto" variant="outline" onClick={handleDownloadPDF}>Download PDF</Button>
              </div>

              <p className="mt-6 text-center text-sm text-muted-foreground">Thank you!</p>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
