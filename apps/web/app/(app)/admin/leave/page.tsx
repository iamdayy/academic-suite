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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { Loader2, Check, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminLeavePage() {
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Approval State
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"APPROVED" | "REJECTED">("APPROVED");

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/leave-requests');
      setLeaveRequests(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data cuti");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq) return;
    
    try {
      setIsSubmitting(true);
      await api.patch(`/leave-requests/${selectedReq.id}`, {
        status: actionType,
        adminNotes
      });
      toast.success(`Pengajuan berhasil ${actionType === 'APPROVED' ? 'disetujui' : 'ditolak'}`);
      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error("Gagal memproses pengajuan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDialog = (req: any, type: "APPROVED" | "REJECTED") => {
    setSelectedReq(req);
    setActionType(type);
    setAdminNotes(req.adminNotes || "");
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ClientAuthGuard>
      <div>
        <h1 className="text-3xl font-bold mb-6">Kelola Cuti Akademik</h1>
        
        <div className="space-y-4">
          {leaveRequests.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Tidak ada pengajuan cuti.</p>
          ) : (
            leaveRequests.map(req => (
              <Card key={req.id.toString()}>
                <CardHeader className="flex flex-row justify-between items-start pb-4">
                  <div>
                    <CardTitle className="text-lg">
                      {req.student?.user?.name} ({req.student?.nim})
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {req.student?.studyProgram?.name} • Semester: {req.academicYear?.year} {req.academicYear?.semester}
                    </p>
                  </div>
                  <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'secondary'}>
                    {req.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <p className="text-sm"><span className="font-semibold block mb-1">Alasan Cuti:</span> {req.reason}</p>
                      {req.documentUrl && (
                        <a href={req.documentUrl} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
                          Buka Dokumen Pendukung
                        </a>
                      )}
                      {req.adminNotes && (
                        <div className="mt-3 bg-muted p-2 rounded text-sm">
                          <span className="font-semibold block mb-1">Catatan Admin:</span>
                          {req.adminNotes}
                        </div>
                      )}
                    </div>
                    {req.status === 'PENDING' && (
                      <div className="md:col-span-1 flex flex-col gap-2 justify-end">
                        <Button 
                          className="w-full bg-green-600 hover:bg-green-700 text-white" 
                          onClick={() => openDialog(req, 'APPROVED')}
                        >
                          <Check className="h-4 w-4 mr-2" /> Setujui
                        </Button>
                        <Button 
                          variant="destructive" 
                          className="w-full"
                          onClick={() => openDialog(req, 'REJECTED')}
                        >
                          <X className="h-4 w-4 mr-2" /> Tolak
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'APPROVED' ? 'Setujui' : 'Tolak'} Pengajuan Cuti
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAction} className="space-y-4">
              <div className="space-y-2">
                <Label>Catatan Admin (Opsional)</Label>
                <Textarea 
                  value={adminNotes} 
                  onChange={e => setAdminNotes(e.target.value)} 
                  placeholder="Tambahkan catatan untuk mahasiswa..."
                  rows={4}
                />
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full"
                variant={actionType === 'APPROVED' ? 'default' : 'destructive'}
              >
                Konfirmasi {actionType === 'APPROVED' ? 'Persetujuan' : 'Penolakan'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ClientAuthGuard>
  );
}
