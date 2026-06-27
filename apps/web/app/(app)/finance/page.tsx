"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Payment {
  id: bigint;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
  status: string;
}

interface Invoice {
  id: bigint;
  amount: number;
  description: string;
  dueDate: string;
  status: string;
  academicYear: { year: string; semester: string };
  payments: Payment[];
}

export default function StudentFinancePage() {
  const { user } = useAuthStore();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Payment state
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("BANK_TRANSFER");
  const [payRef, setPayRef] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchInvoices = async () => {
    if (!user?.student?.id) return;
    try {
      setIsLoading(true);
      const response = await api.get(`/invoices/student/${user.student.id}`);
      setInvoices(response.data);
    } catch (error) {
      console.error("Gagal mengambil data tagihan:", error);
      toast.error("Gagal memuat tagihan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    
    try {
      setIsSubmitting(true);
      await api.post("/payments", {
        invoiceId: Number(selectedInvoice.id),
        amount: Number(payAmount),
        paymentMethod: payMethod,
        reference: payRef
      });
      toast.success("Pembayaran berhasil disubmit dan menunggu verifikasi.");
      setIsDialogOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error("Gagal memproses pembayaran:", error);
      toast.error("Gagal memproses pembayaran");
    } finally {
      setIsSubmitting(false);
      setPayAmount("");
      setPayRef("");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID': return <Badge className="bg-green-500">LUNAS</Badge>;
      case 'PARTIAL': return <Badge className="bg-yellow-500">SEBAGIAN</Badge>;
      case 'PENDING': return <Badge className="bg-red-500">BELUM LUNAS</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR"
    }).format(amount);
  };

  return (
    <ClientAuthGuard>
      <div>
        <h1 className="text-3xl font-bold mb-6">Tagihan & Pembayaran</h1>
        <p className="text-muted-foreground mb-6">
          Daftar tagihan Anda. Klik tombol Bayar untuk mengunggah bukti pembayaran.
        </p>

        {isLoading ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {invoices.map((inv) => {
              const totalPaid = inv.payments?.filter(p => p.status === 'VERIFIED').reduce((sum, p) => sum + p.amount, 0) || 0;
              const sisaTagihan = inv.amount - totalPaid;
              
              return (
              <Card key={inv.id.toString()}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{inv.description}</CardTitle>
                      <CardDescription>
                        {inv.academicYear?.year} - {inv.academicYear?.semester}
                      </CardDescription>
                    </div>
                    {getStatusBadge(inv.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Tagihan:</span>
                      <span className="font-semibold">{formatRupiah(inv.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Telah Dibayar:</span>
                      <span className="font-semibold text-green-600">{formatRupiah(totalPaid)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-semibold">Sisa Tagihan:</span>
                      <span className="font-bold text-red-500">{formatRupiah(sisaTagihan)}</span>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-muted-foreground">Jatuh Tempo:</span>
                      <span className="text-sm">{new Date(inv.dueDate).toLocaleDateString("id-ID")}</span>
                    </div>
                  </div>
                  
                  {sisaTagihan > 0 && (
                    <Dialog open={isDialogOpen && selectedInvoice?.id === inv.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) setSelectedInvoice(inv);
                      else setSelectedInvoice(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button className="w-full">Bayar Tagihan</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Form Pembayaran</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handlePayment} className="space-y-4 mt-4">
                          <div className="space-y-2">
                            <Label>Nominal Pembayaran</Label>
                            <Input 
                              type="number" 
                              required 
                              max={sisaTagihan}
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              placeholder={`Maksimal ${sisaTagihan}`}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Metode Pembayaran</Label>
                            <Select value={payMethod} onValueChange={setPayMethod}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih metode" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BANK_TRANSFER">Transfer Bank</SelectItem>
                                <SelectItem value="CASH">Tunai / Loket</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Referensi / Catatan (Opsional)</Label>
                            <Input 
                              value={payRef}
                              onChange={(e) => setPayRef(e.target.value)}
                              placeholder="Cth: TRX-123456"
                            />
                          </div>
                          <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Submit Pembayaran
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {inv.payments && inv.payments.length > 0 && (
                     <div className="mt-4 pt-4 border-t space-y-2">
                       <h4 className="text-sm font-semibold">Riwayat Pembayaran:</h4>
                       {inv.payments.map(p => (
                         <div key={p.id.toString()} className="flex justify-between text-sm bg-muted p-2 rounded">
                           <div>
                             <p>{formatRupiah(p.amount)}</p>
                             <p className="text-xs text-muted-foreground">{new Date(p.paymentDate).toLocaleDateString("id-ID")}</p>
                           </div>
                           <Badge variant={p.status === 'VERIFIED' ? 'default' : p.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                             {p.status}
                           </Badge>
                         </div>
                       ))}
                     </div>
                  )}
                  
                </CardContent>
              </Card>
            )})}
            {invoices.length === 0 && (
              <p className="text-center text-muted-foreground col-span-full mt-10">
                Belum ada tagihan.
              </p>
            )}
          </div>
        )}
      </div>
    </ClientAuthGuard>
  );
}
