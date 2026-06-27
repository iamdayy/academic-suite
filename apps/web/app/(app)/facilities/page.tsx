"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Loader2, Building, Clock, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function UserFacilitiesPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [bookingForm, setBookingForm] = useState({ purpose: "", startTime: "", endTime: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [facRes, bookRes] = await Promise.all([
        api.get('/facilities'),
        api.get('/facilities/bookings/me')
      ]);
      setFacilities(facRes.data);
      setBookings(bookRes.data);
    } catch (error) {
      toast.error("Gagal memuat data fasilitas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/facilities/bookings', {
        facilityId: selectedFacility.id,
        ...bookingForm
      });
      toast.success("Permohonan peminjaman berhasil diajukan");
      setIsDialogOpen(false);
      setBookingForm({ purpose: "", startTime: "", endTime: "" });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengajukan peminjaman");
    }
  };

  if (isLoading) {
    return (
      <ClientAuthGuard>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </ClientAuthGuard>
    );
  }

  return (
    <ClientAuthGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Fasilitas & Ruang</h1>
          <p className="text-muted-foreground">Eksplorasi dan ajukan peminjaman fasilitas kampus.</p>
        </div>

        <Tabs defaultValue="fasilitas" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="fasilitas">Daftar Fasilitas</TabsTrigger>
            <TabsTrigger value="riwayat">Peminjaman Saya</TabsTrigger>
          </TabsList>

          <TabsContent value="fasilitas">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {facilities.map((fac) => (
                <Card key={fac.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      {fac.name}
                    </CardTitle>
                    <CardDescription>{fac.type.replace('_', ' ')}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Kapasitas:</span> {fac.capacity} orang</p>
                      {fac.description && <p className="text-muted-foreground">{fac.description}</p>}
                      {!fac.isActive && <Badge variant="destructive">Sedang Pemeliharaan</Badge>}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Dialog open={isDialogOpen && selectedFacility?.id === fac.id} onOpenChange={(open) => {
                      setIsDialogOpen(open);
                      if (open) setSelectedFacility(fac);
                    }}>
                      <DialogTrigger asChild>
                        <Button className="w-full" disabled={!fac.isActive}>Ajukan Pinjaman</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Pinjam {fac.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitBooking} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Tujuan Peminjaman</label>
                            <Input required placeholder="Misal: Rapat HIMA" value={bookingForm.purpose} onChange={e => setBookingForm({...bookingForm, purpose: e.target.value})} />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Waktu Mulai</label>
                              <Input type="datetime-local" required value={bookingForm.startTime} onChange={e => setBookingForm({...bookingForm, startTime: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Waktu Selesai</label>
                              <Input type="datetime-local" required value={bookingForm.endTime} onChange={e => setBookingForm({...bookingForm, endTime: e.target.value})} />
                            </div>
                          </div>
                          <Button type="submit" className="w-full">Kirim Permohonan</Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="riwayat" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Riwayat Peminjaman</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fasilitas</TableHead>
                      <TableHead>Tujuan</TableHead>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Catatan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-6 text-muted-foreground">Belum ada riwayat peminjaman.</TableCell></TableRow>
                    ) : bookings.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.facility?.name}</TableCell>
                        <TableCell>{b.purpose}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(b.startTime).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })} - <br />
                          {new Date(b.endTime).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={b.status === 'APPROVED' ? 'default' : b.status === 'REJECTED' ? 'destructive' : 'secondary'}
                            className={b.status === 'APPROVED' ? 'bg-green-100 text-green-800' : ''}
                          >
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{b.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </ClientAuthGuard>
  );
}
