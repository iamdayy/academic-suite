"use client";

import ClientAuthGuard from "@/components/ClientAuthGuard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Loader2, BookOpen, Search, Library } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function StudentLibraryPage() {
  const [books, setBooks] = useState<any[]>([]);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [booksRes, borrowingsRes] = await Promise.all([
        api.get('/library/books'),
        api.get('/library/borrowings/me')
      ]);
      setBooks(booksRes.data);
      setBorrowings(borrowingsRes.data);
    } catch (error) {
      toast.error("Gagal memuat data perpustakaan");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBorrow = async (bookId: number) => {
    try {
      await api.post('/library/borrowings', { bookId });
      toast.success("Berhasil meminjam buku");
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal meminjam buku");
    }
  };

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(search.toLowerCase()) || 
    b.author.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold">Perpustakaan</h1>
          <p className="text-muted-foreground">Eksplorasi katalog buku dan lihat riwayat peminjaman Anda.</p>
        </div>

        <Tabs defaultValue="katalog" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="katalog">Katalog Buku</TabsTrigger>
            <TabsTrigger value="peminjaman">Buku Saya</TabsTrigger>
          </TabsList>

          <TabsContent value="katalog">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2"><Library className="h-5 w-5" /> Katalog</CardTitle>
                    <CardDescription>Pilih buku yang ingin Anda pinjam (Maks 7 hari).</CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Cari judul / penulis..." 
                      className="pl-8" 
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredBooks.map((book) => (
                    <Card key={book.id} className="flex flex-col">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg line-clamp-2" title={book.title}>{book.title}</CardTitle>
                        <CardDescription className="line-clamp-1">{book.author}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 flex-grow">
                        <div className="text-sm space-y-1">
                          <p><span className="text-muted-foreground">Kategori:</span> {book.category?.name || '-'}</p>
                          <p><span className="text-muted-foreground">Tahun:</span> {book.publishYear || '-'}</p>
                          <p><span className="text-muted-foreground">Tersedia:</span> {book.copiesAvailable} / {book.copiesTotal}</p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          disabled={book.copiesAvailable <= 0}
                          onClick={() => handleBorrow(book.id)}
                        >
                          {book.copiesAvailable > 0 ? "Pinjam Buku" : "Habis"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  {filteredBooks.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                      Buku tidak ditemukan.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="peminjaman">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Riwayat Peminjaman</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Buku</TableHead>
                      <TableHead>Tgl Pinjam</TableHead>
                      <TableHead>Batas Waktu</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Denda</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {borrowings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">Belum ada riwayat peminjaman.</TableCell>
                      </TableRow>
                    ) : borrowings.map(b => (
                      <TableRow key={b.id}>
                        <TableCell>
                          <p className="font-medium">{b.book?.title}</p>
                          <p className="text-xs text-muted-foreground">{b.book?.author}</p>
                        </TableCell>
                        <TableCell>{new Date(b.borrowDate).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>{new Date(b.dueDate).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell>
                          <Badge variant={b.status === 'RETURNED' ? 'secondary' : 'default'} className={b.status === 'RETURNED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {b.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {b.fineAmount > 0 ? <span className="text-red-600">Rp {b.fineAmount.toLocaleString('id-ID')}</span> : '-'}
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
