"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Loader2, Plus, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function AdminFacilitiesPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newFac, setNewFac] = useState({ name: "", type: "", capacity: "", description: "" });
  const [actionNotes, setActionNotes] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [facRes, bookRes] = await Promise.all([
        api.get('/facilities'),
        api.get('/facilities/bookings')
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

  const handleCreateFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/facilities', {
        ...newFac,
        capacity: parseInt(newFac.capacity)
      });
      toast.success("Fasilitas berhasil ditambahkan");
      setNewFac({ name: "", type: "", capacity: "", description: "" });
      fetchData();
    } catch (error) {
      toast.error("Gagal menambahkan fasilitas");
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      await api.patch(`/facilities/${id}`, { isActive: !currentActive });
      toast.success("Status fasilitas diperbarui");
      fetchData();
    } catch (error) {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleProcessBooking = async (status: string) => {
    if (!selectedBookingId) return;
    try {
      await api.patch(`/facilities/bookings/${selectedBookingId}/status`, { status, notes: actionNotes });
      toast.success(`Permohonan ${status === 'APPROVED' ? 'Disetujui' : 'Ditolak'}`);
      setSelectedBookingId(null);
      setActionNotes("");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memproses permohonan");
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
          <h1 className="text-3xl font-bold">Manajemen Fasilitas & Ruang (Admin)</h1>
          <p className="text-muted-foreground">Kelola master data fasilitas dan persetujuan peminjaman.</p>
        </div>

        <Tabs defaultValue="persetujuan" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="persetujuan">Persetujuan Peminjaman</TabsTrigger>
            <TabsTrigger value="master">Master Fasilitas</TabsTrigger>
          </TabsList>

          <TabsContent value="persetujuan" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Daftar Permohonan Peminjaman</CardTitle>
                <CardDescription>Setujui atau tolak permintaan dari Dosen dan Mahasiswa.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pemohon</TableHead>
                        <TableHead>Fasilitas</TableHead>
                        <TableHead>Tujuan</TableHead>
                        <TableHead>Waktu</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Belum ada permohonan.</TableCell></TableRow>
                      ) : bookings.map(b => (
                        <TableRow key={b.id}>
                          <TableCell>
                            <p className="font-medium">{b.user?.name}</p>
                            <p className="text-xs text-muted-foreground">{b.user?.email}</p>
                          </TableCell>
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
                          <TableCell className="text-right">
                            {b.status === 'PENDING' ? (
                              <Dialog open={selectedBookingId === b.id} onOpenChange={(open) => {
                                if(!open) setSelectedBookingId(null);
                                else setSelectedBookingId(b.id);
                              }}>
                                <DialogTrigger asChild>
                                  <Button size="sm">Tinjau</Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Proses Peminjaman</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <label className="text-sm font-medium">Catatan (Opsional)</label>
                                      <Input placeholder="Alasan penolakan / instruksi tambahan" value={actionNotes} onChange={e => setActionNotes(e.target.value)} />
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                      <Button variant="destructive" onClick={() => handleProcessBooking('REJECTED')}><X className="h-4 w-4 mr-2" /> Tolak</Button>
                                      <Button variant="default" className="bg-green-600 hover:bg-green-700" onClick={() => handleProcessBooking('APPROVED')}><Check className="h-4 w-4 mr-2" /> Setujui</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <span className="text-xs text-muted-foreground">{b.notes || '-'}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="master" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tambah Fasilitas Baru</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateFacility} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Input placeholder="Nama Fasilitas" value={newFac.name} onChange={e => setNewFac({...newFac, name: e.target.value})} required className="col-span-2" />
                    <Select value={newFac.type} onValueChange={v => setNewFac({...newFac, type: v})} required>
                      <SelectTrigger><SelectValue placeholder="Tipe" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLASSROOM">Ruang Kelas</SelectItem>
                        <SelectItem value="LABORATORY">Laboratorium</SelectItem>
                        <SelectItem value="MEETING_ROOM">Ruang Rapat</SelectItem>
                        <SelectItem value="SPORT">Olahraga</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input type="number" placeholder="Kapasitas" value={newFac.capacity} onChange={e => setNewFac({...newFac, capacity: e.target.value})} required />
                  </div>
                  <Input placeholder="Deskripsi (Opsional)" value={newFac.description} onChange={e => setNewFac({...newFac, description: e.target.value})} />
                  <Button type="submit"><Plus className="h-4 w-4 mr-2" /> Tambah Fasilitas</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daftar Fasilitas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Fasilitas</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Kapasitas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facilities.map(f => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.name}</TableCell>
                        <TableCell>{f.type.replace('_', ' ')}</TableCell>
                        <TableCell>{f.capacity} Orang</TableCell>
                        <TableCell>
                          <Badge variant={f.isActive ? "default" : "destructive"}>
                            {f.isActive ? "Aktif" : "Non-Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => handleToggleActive(f.id, f.isActive)}>
                            {f.isActive ? "Non-Aktifkan" : "Aktifkan"}
                          </Button>
                        </TableCell>
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
