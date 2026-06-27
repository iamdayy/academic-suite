"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from "@/lib/api";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Invoice {
  id: bigint;
  student: { name: string; nim: string };
  academicYear: { year: string; semester: string };
  amount: number;
  description: string;
  status: string;
}

interface Payment {
  id: bigint;
  invoice: Invoice;
  amount: number;
  paymentMethod: string;
  reference: string;
  status: string;
  paymentDate: string;
}

export default function AdminFinancePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [invRes, payRes] = await Promise.all([
        api.get("/invoices"),
        api.get("/payments")
      ]);
      setInvoices(invRes.data);
      setPayments(payRes.data);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      toast.error("Gagal memuat data keuangan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleVerify = async (paymentId: bigint) => {
    try {
      await api.patch(`/payments/${paymentId}/verify`);
      toast.success("Pembayaran berhasil diverifikasi");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Gagal verifikasi pembayaran:", error);
      toast.error("Gagal memverifikasi pembayaran");
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Manajemen Keuangan</h1>
            <p className="text-muted-foreground">Kelola tagihan dan verifikasi pembayaran mahasiswa.</p>
          </div>
          <Button variant="outline">Buat Tagihan Baru</Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center mt-10">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Tabs defaultValue="payments" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="payments">Pembayaran Menunggu Verifikasi</TabsTrigger>
              <TabsTrigger value="invoices">Daftar Tagihan</TabsTrigger>
            </TabsList>
            
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mahasiswa</TableHead>
                        <TableHead>Tagihan</TableHead>
                        <TableHead>Nominal</TableHead>
                        <TableHead>Metode</TableHead>
                        <TableHead>Referensi</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                            Tidak ada pembayaran pending
                          </TableCell>
                        </TableRow>
                      ) : (
                        payments.map((p) => (
                          <TableRow key={p.id.toString()}>
                            <TableCell>
                              <div className="font-medium">{p.invoice?.student?.name}</div>
                              <div className="text-xs text-muted-foreground">{p.invoice?.student?.nim}</div>
                            </TableCell>
                            <TableCell>{p.invoice?.description}</TableCell>
                            <TableCell className="font-semibold">{formatRupiah(p.amount)}</TableCell>
                            <TableCell>{p.paymentMethod}</TableCell>
                            <TableCell>{p.reference || "-"}</TableCell>
                            <TableCell>
                              <Badge variant={p.status === 'VERIFIED' ? 'default' : p.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {p.status === 'PENDING' && (
                                <div className="flex justify-end gap-2">
                                  <Button size="sm" onClick={() => handleVerify(p.id)}>
                                    <CheckCircle className="h-4 w-4 mr-1" /> Terima
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="invoices">
              <Card>
                <CardHeader>
                  <CardTitle>Daftar Semua Tagihan</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mahasiswa</TableHead>
                        <TableHead>Deskripsi</TableHead>
                        <TableHead>Tahun Ajaran</TableHead>
                        <TableHead>Nominal</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                            Belum ada tagihan
                          </TableCell>
                        </TableRow>
                      ) : (
                        invoices.map((inv) => (
                          <TableRow key={inv.id.toString()}>
                            <TableCell>
                              <div className="font-medium">{inv.student?.name}</div>
                              <div className="text-xs text-muted-foreground">{inv.student?.nim}</div>
                            </TableCell>
                            <TableCell>{inv.description}</TableCell>
                            <TableCell>{inv.academicYear?.year} {inv.academicYear?.semester}</TableCell>
                            <TableCell className="font-semibold">{formatRupiah(inv.amount)}</TableCell>
                            <TableCell>
                               <Badge className={
                                 inv.status === 'PAID' ? 'bg-green-500' : 
                                 inv.status === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'
                               }>
                                 {inv.status}
                               </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ClientAuthGuard>
  );
}
