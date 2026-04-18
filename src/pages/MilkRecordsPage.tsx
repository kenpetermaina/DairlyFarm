import { useFarmStore } from "@/store/farmStore";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Sunrise, Sun, Sunset, Download, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import PrintButton from "@/components/PrintButton";
import { downloadCSV } from "@/lib/downloadUtils";

export default function MilkRecordsPage() {
  const { milkRecords, deleteMilkRecord, cows } = useFarmStore();
  const navigate = useNavigate();
  const getCowName = (id: string) => { const c = cows.find((c) => c.id === id); return c ? `${c.tag_number} - ${c.name}` : id; };

  const handleDownloadMilkRecords = () => {
    try {
      const data = milkRecords.map(r => ({
        Date: r.date,
        Cow: getCowName(r.cow_id || r.cowId),
        Session: r.session,
        "Amount (L)": r.amount_liters || r.amount
      }));
      downloadCSV(data, `milk-records-${new Date().toISOString().split('T')[0]}.csv`);
      toast.success("Milk records downloaded successfully");
    } catch (error) {
      toast.error("Failed to download records");
    }
  };

  const morningRecords = milkRecords.filter(r => r.session === 'Morning');
  const lunchRecords = milkRecords.filter(r => r.session === 'Lunch');
  const eveningRecords = milkRecords.filter(r => r.session === 'Evening');

  const MilkTable = ({ records, title, icon: Icon }: { records: typeof milkRecords, title: string, icon: any }) => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Cow</TableHead>
              <TableHead>Amount (L)</TableHead>
              <TableHead className="no-print">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No {title.toLowerCase()} records yet.
                </TableCell>
              </TableRow>
            ) : records.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.date}</TableCell>
                <TableCell>{getCowName(r.cowId)}</TableCell>
                <TableCell>{r.amount_liters}</TableCell>
                <TableCell className="no-print flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(`/income?prefillQty=${encodeURIComponent(String(r.amount_liters ?? r.amount ?? 0))}`)}
                    title="Sell this milk"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      try {
                        await deleteMilkRecord(r.id);
                        toast.success("Deleted");
                      } catch (error) {
                        toast.error("Failed to delete record");
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div>
      <PageHeader 
        title="Milk Records" 
        subtitle="Milk production logs by session" 
        actions={
          <>
            <PrintButton />
            <Button variant="outline" onClick={handleDownloadMilkRecords}>
              <Download className="h-4 w-4 mr-1" />
              Download CSV
            </Button>
          </>
        } 
      />

      <MilkTable records={morningRecords} title="Morning Session" icon={Sunrise} />
      <MilkTable records={lunchRecords} title="Lunch Session" icon={Sun} />
      <MilkTable records={eveningRecords} title="Evening Session" icon={Sunset} />
    </div>
  );
}
