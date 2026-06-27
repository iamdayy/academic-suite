"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Loader2, Settings, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminLibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [fineSetting, setFineSetting] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // New Book State
  const [newBook, setNewBook] = useState({
    title: "", author: "", publisher: "", publishYear: "", copiesTotal: "", categoryId: ""
  });
  // New Category State
  const [newCategoryName, setNewCategoryName] = useState("");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [booksRes, catsRes, borrowsRes, settingsRes] = await Promise.all([
        api.get('/library/books').catch(() => ({ data: [] })),
        api.get('/library/categories').catch(() => ({ data: [] })),
        api.get('/library/borrowings').catch(() => ({ data: [] })),
        api.get('/library/settings').catch(() => ({ data: [] }))
      ]);

      setBooks(booksRes.data);
      setCategories(catsRes.data);
      setBorrowings(borrowsRes.data);

      const fineConf = settingsRes.data.find((s: any) => s.key === 'LIBRARY_DAILY_FINE');
      if (fineConf) setFineSetting(fineConf.value);
      else setFineSetting("1000");

    } catch (error) {
      toast.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch('/library/settings', { key: 'LIBRARY_DAILY_FINE', value: fineSetting });
      toast.success("Pengaturan denda berhasil disimpan");
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan");
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/library/categories', { name: newCategoryName });
      toast.success("Kategori berhasil ditambahkan");
      setNewCategoryName("");
      fetchData();
    } catch (error) {
      toast.error("Gagal menambahkan kategori");
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/library/books', newBook);
      toast.success("Buku berhasil ditambahkan");
      setNewBook({ title: "", author: "", publisher: "", publishYear: "", copiesTotal: "", categoryId: "" });
      fetchData();
    } catch (error) {
      toast.error("Gagal menambahkan buku");
    }
  };

  const handleProcessReturn = async (id: number) => {
    try {
      await api.patch(`/library/borrowings/${id}/return`);
      toast.success("Pengembalian buku berhasil diproses");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal memproses pengembalian");
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
          <h1 className="text-3xl font-bold">Perpustakaan (Admin)</h1>
          <p className="text-muted-foreground">Kelola katalog buku, peminjaman, dan pengaturan perpustakaan.</p>
        </div>

        <Tabs defaultValue="buku" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="buku">Katalog Buku</TabsTrigger>
            <TabsTrigger value="peminjaman">Peminjaman</TabsTrigger>
            <TabsTrigger value="pengaturan">Pengaturan</TabsTrigger>
          </TabsList>

          <TabsContent value="buku" className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tambah Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCategory} className="flex gap-2">
                    <Input placeholder="Nama Kategori" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required />
                    <Button type="submit">Tambah</Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tambah Buku Baru</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateBook} className="space-y-4">
                    <Input placeholder="Judul Buku" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} required />
                    <Input placeholder="Penulis" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} required />
                    <div className="grid grid-cols-2 gap-4">
                      <Input placeholder="Penerbit" value={newBook.publisher} onChange={e => setNewBook({...newBook, publisher: e.target.value})} />
                      <Input type="number" placeholder="Tahun Terbit" value={newBook.publishYear} onChange={e => setNewBook({...newBook, publishYear: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input type="number" placeholder="Jumlah Eksemplar" value={newBook.copiesTotal} onChange={e => setNewBook({...newBook, copiesTotal: e.target.value})} required />
                      <Select value={newBook.categoryId} onValueChange={v => setNewBook({...newBook, categoryId: v})} required>
                        <SelectTrigger><SelectValue placeholder="Kategori" /></SelectTrigger>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">Simpan Buku</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Daftar Buku</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Judul</TableHead>
                        <TableHead>Penulis</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Tersedia</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {books.length === 0 ? (
                        <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Belum ada buku</TableCell></TableRow>
                      ) : books.map(b => (
                        <TableRow key={b.id}>
                          <TableCell className="font-medium">{b.title}</TableCell>
                          <TableCell>{b.author}</TableCell>
                          <TableCell>{b.category?.name}</TableCell>
                          <TableCell>{b.copiesAvailable}</TableCell>
                          <TableCell>{b.copiesTotal}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="peminjaman" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaksi Peminjaman</CardTitle>
                <CardDescription>Proses pengembalian buku untuk menghitung denda secara otomatis.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Peminjam</TableHead>
                        <TableHead>Buku</TableHead>
                        <TableHead>Tgl Pinjam</TableHead>
                        <TableHead>Jatuh Tempo</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {borrowings.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center py-4 text-muted-foreground">Tidak ada transaksi peminjaman.</TableCell></TableRow>
                      ) : borrowings.map(b => (
                        <TableRow key={b.id}>
                          <TableCell>
                            <p className="font-medium">{b.student?.name}</p>
                            <p className="text-xs text-muted-foreground">{b.student?.nim}</p>
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate" title={b.book?.title}>{b.book?.title}</TableCell>
                          <TableCell>{new Date(b.borrowDate).toLocaleDateString('id-ID')}</TableCell>
                          <TableCell className={new Date(b.dueDate) < new Date() && b.status === 'BORROWED' ? "text-red-600 font-medium" : ""}>
                            {new Date(b.dueDate).toLocaleDateString('id-ID')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={b.status === 'RETURNED' ? 'secondary' : 'default'} className={b.status === 'RETURNED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                              {b.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {b.status === 'BORROWED' ? (
                              <Button size="sm" onClick={() => handleProcessReturn(b.id)}>Proses Kembali</Button>
                            ) : (
                              <span className="text-sm font-medium text-muted-foreground">
                                Denda: Rp {b.fineAmount.toLocaleString('id-ID')}
                              </span>
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

          <TabsContent value="pengaturan" className="mt-6">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Pengaturan Sistem</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateSetting} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tarif Denda Keterlambatan (Rp / Hari)</label>
                    <Input 
                      type="number" 
                      value={fineSetting} 
                      onChange={e => setFineSetting(e.target.value)} 
                      required 
                    />
                  </div>
                  <Button type="submit">Simpan Pengaturan</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </ClientAuthGuard>
  );
}
