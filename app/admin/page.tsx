'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
// Restoring standard path aliases which are standard for Next.js environments
import { db } from '@/lib/firebase';
import Logo from '../../public/Logo.png';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    addDoc,
    Timestamp,
    writeBatch
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { LoginButton } from '@/components/admin/LoginButton';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AppointmentsTable } from '@/components/admin/AppointmentsTable';
import { CalendarView } from '@/components/admin/CalendarView';
import { useAuth } from '@/hooks/useAuth';
import { Appointment, AppointmentStatus } from '@/types';
import {
    Loader2,
    ArrowLeft,
    Smile,
    LayoutDashboard,
    Calendar,
    List,
    Image as ImageIcon,
    Upload,
    Trash2,
    Pin,
    Layers,
    Plus,
    AlertCircle,
    CheckCircle2,
    ExternalLink,
    UserPlus,
    Clock,
    Phone,
    Mail,
    MessageSquare
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AdminPage() {
    const { user, loading, isAdminUser } = useAuth();

    // Appointments State
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
    const [activeTab, setActiveTab] = useState('calendar');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Gallery Management State
    const [galleryItems, setGalleryItems] = useState<any[]>([]);
    const [isComparison, setIsComparison] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Messages State
    const [messages, setMessages] = useState<any[]>([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);

    /**
     * NOTIFICATION BADGE LOGIC
     * Filter messages where isRead is not true to show accurate count.
     */
    const unreadCount = useMemo(() => {
        return messages.filter(m => m.isRead !== true).length;
    }, [messages]);

    // Cancellation Dialog State
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

    // Manual Booking State
    const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
    const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
    const [manualBooking, setManualBooking] = useState({
        fullName: '',
        phone: '',
        time: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        email: '',
        service: 'Manual Booking',
        message: ''
    });

    /**
     * REAL-TIME LISTENERS
     */
    useEffect(() => {
        if (!user || !isAdminUser || !db) return;

        // Sync Appointments
        const qAppts = query(collection(db, 'appointments'), orderBy('createdAt', 'desc'));
        const unsubAppts = onSnapshot(qAppts, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            } as Appointment));
            setAppointments(items);
            setIsLoadingAppointments(false);
        }, (err) => {
            console.error("Firestore error:", err);
            setIsLoadingAppointments(false);
        });

        // Sync Gallery
        const qGallery = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
        const unsubGallery = onSnapshot(qGallery, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setGalleryItems(items);
        });

        // Sync Messages (Contacts)
        const qMessages = query(collection(db, 'contacts'), orderBy('createdAt', 'desc'));
        const unsubMessages = onSnapshot(qMessages, (snapshot) => {
            const items = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toLocaleString() || 'N/A'
            }));
            setMessages(items);
            setIsLoadingMessages(false);
        }, (err) => {
            console.error("Firestore contacts error:", err);
            setIsLoadingMessages(false);
        });

        return () => {
            unsubAppts();
            unsubGallery();
            unsubMessages();
        };
    }, [user, isAdminUser]);

    /**
     * PERSISTENT NOTIFICATION REMOVAL
     * Mark all unread messages as read when the admin views the messages tab.
     */
    useEffect(() => {
        if (activeTab === 'messages' && unreadCount > 0 && db) {
            const markAllAsRead = async () => {
                const unreadMessages = messages.filter(m => m.isRead !== true);
                if (unreadMessages.length === 0) return;

                const batch = writeBatch(db);
                unreadMessages.forEach((msg) => {
                    const msgRef = doc(db, 'contacts', msg.id);
                    batch.update(msgRef, { isRead: true });
                });

                try {
                    await batch.commit();
                } catch (error) {
                    console.error("Error clearing message notifications:", error);
                }
            };
            markAllAsRead();
        }
    }, [activeTab, unreadCount, messages]);

    /**
     * MANUAL BOOKING HANDLER
     */
    const handleManualBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!db) return;

        if (!manualBooking.fullName || !manualBooking.phone || !manualBooking.time) {
            toast.error("Name, Phone, and Time Slot are required.");
            return;
        }

        setIsSubmittingBooking(true);
        try {
            await addDoc(collection(db, 'appointments'), {
                ...manualBooking,
                status: 'confirmed',
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });

            toast.success("Appointment successfully booked!");
            setIsBookingDialogOpen(false);
            setManualBooking({
                fullName: '',
                phone: '',
                time: '',
                date: new Date().toISOString().split('T')[0],
                email: '',
                service: 'Manual Booking',
                message: ''
            });
        } catch (error) {
            console.error(error);
            toast.error("Failed to save booking.");
        } finally {
            setIsSubmittingBooking(false);
        }
    };

    /**
     * CLOUDINARY UPLOAD LOGIC
     */
    const uploadToCloudinary = async (file: File) => {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'smile_hub_gallery';

        if (!cloudName) {
            throw new Error("Cloud Name missing (NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)");
        }

        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', uploadPreset);

        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: 'POST', body: data }
            );

            const json = await res.json();

            if (!res.ok) {
                console.error("Cloudinary Error Detail:", json);
                if (json.error?.message?.includes("Upload preset not found")) {
                    throw new Error(`Cloudinary Error: The preset "${uploadPreset}" was not found.`);
                }
                throw new Error(json.error?.message || "Upload failed");
            }

            return json.secure_url;
        } catch (error: any) {
            console.error("Network/Upload Error:", error);
            throw error;
        }
    };

    const handleGalleryUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!db) return;

        setIsUploading(true);
        const formData = new FormData(e.currentTarget);
        const mainFile = formData.get('mainImage') as File;
        const beforeFile = formData.get('beforeImage') as File;

        if (!mainFile || mainFile.size === 0) {
            toast.error("Please select an image");
            setIsUploading(false);
            return;
        }

        try {
            const imageUrl = await uploadToCloudinary(mainFile);
            let beforeUrl = '';

            if (isComparison && beforeFile && beforeFile.size > 0) {
                beforeUrl = await uploadToCloudinary(beforeFile);
            }

            await addDoc(collection(db, 'gallery'), {
                type: isComparison ? 'comparison' : 'single',
                imageUrl,
                beforeUrl,
                isPinned: false,
                createdAt: Timestamp.now(),
            });

            toast.success("Image added to gallery!");
            (e.target as HTMLFormElement).reset();
            setIsComparison(false);
        } catch (err: any) {
            toast.error(err.message || "An error occurred during upload");
        } finally {
            setIsUploading(false);
        }
    };

    const togglePin = async (id: string, current: boolean) => {
        if (!db) return;
        await updateDoc(doc(db, 'gallery', id), { isPinned: !current });
    };

    const deleteGalleryItem = async (id: string) => {
        if (!db) return;
        if (window.confirm("Delete this gallery item?")) {
            await deleteDoc(doc(db, 'gallery', id));
            toast.success("Item deleted");
        }
    };

    const deleteMessage = async (id: string) => {
        if (!db) return;
        if (window.confirm("Are you sure you want to delete this message?")) {
            try {
                await deleteDoc(doc(db, 'contacts', id));
                toast.success("Message deleted");
            } catch (error) {
                toast.error("Failed to delete message");
            }
        }
    };

    /**
     * APPOINTMENT UPDATE LOGIC
     */
    const updateStatus = async (id: string, status: AppointmentStatus, reason?: string) => {
        setUpdatingId(id);
        const appointment = appointments.find(a => a.id === id);

        // OPTIMISTIC UI UPDATE
        setAppointments(prev =>
            prev.map(item => item.id === id ? { ...item, status } : item)
        );

        try {
            const response = await fetch('/api/appointments', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    status,
                    reason,
                    email: appointment?.email,
                    fullName: appointment?.fullName,
                    date: appointment?.date,
                    time: appointment?.time
                }),
            });

            const result = await response.json();
            if (result.success) {
                toast.success(`Appointment ${status} successfully`);
                setIsCancelDialogOpen(false);
                setCancelReason('');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            // Rollback on error
            if (appointment) {
                setAppointments(prev =>
                    prev.map(item => item.id === id ? appointment : item)
                );
            }
            toast.error('Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleStatusChange = (id: string, status: AppointmentStatus) => {
        if (status === 'cancelled') {
            const appt = appointments.find(a => a.id === id);
            setSelectedAppointment(appt || null);
            setIsCancelDialogOpen(true);
        } else {
            updateStatus(id, status);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
            </div>
        );
    }

    if (!user || !isAdminUser) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center max-w-sm w-full">
                    <img src={Logo.src} alt="Smile Hub Logo" className="w-auto h-6 mx-auto" />
                    <h2 className="text-xl font-bold mb-6 text-gray-900">Admin Authentication</h2>
                    <LoginButton />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50/50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 group cursor-pointer"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <img src={Logo.src} alt="Smile Hub Logo" className="w-auto h-6" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-sky-500 bg-clip-text text-transparent">
                            Smile Hub
                        </span>
                    </div>
                    <a href="/">
                        <Button type="button" variant="ghost" size="sm" className="rounded-full text-gray-500 hover:text-sky-600 cursor: pointer">
                            <ArrowLeft className="w-4 h-4 mr-2" /> View Site
                        </Button>
                    </a>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Practice Dashboard</h1>
                        <p className="text-gray-500 text-sm">Real-time scheduling and inquiry management.</p>
                    </div>
                    <LoginButton className="cursor: pointer"/>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="bg-white border p-1 shadow-sm inline-flex h-auto rounded-2xl">
                        <TabsTrigger value="calendar" className="rounded-xl py-2.5 px-5">
                            <Calendar className="w-4 h-4 mr-2 cursor: pointer" /> Calendar
                        </TabsTrigger>
                        <TabsTrigger value="appointments" className="rounded-xl py-2.5 px-5">
                            <List className="w-4 h-4 mr-2 cursor: pointer" /> List
                        </TabsTrigger>
                        <TabsTrigger value="gallery" className="rounded-xl py-2.5 px-5">
                            <ImageIcon className="w-4 h-4 mr-2 cursor: pointer" /> Gallery
                        </TabsTrigger>
                        <TabsTrigger value="messages" className="rounded-xl py-2.5 px-5 relative">
                            <MessageSquare className="w-4 h-4 mr-2 cursor: pointer" /> Messages
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[9px] font-bold items-center justify-center">
                                        {unreadCount}
                                    </span>
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="dashboard" className="rounded-xl py-2.5 px-5">
                            <LayoutDashboard className="w-4 h-4 mr-2" /> Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="calendar" className="mt-0 outline-none">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-sky-500" /> Clinic Schedule
                                </h2>
                                <Button
                                    type="button"
                                    onClick={() => setIsBookingDialogOpen(true)}
                                    className="bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg shadow-sky-100 transition-all hover:scale-105"
                                >
                                    <UserPlus className="w-4 h-4 mr-2 cursor: pointer" /> Book Session
                                </Button>
                            </div>

                            {isLoadingAppointments ? <Loader2 className="animate-spin mx-auto my-20 text-sky-500" /> : (
                                <CalendarView appointments={appointments} onUpdateStatus={handleStatusChange} updatingId={updatingId} />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="appointments" className="mt-0 outline-none">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                            {isLoadingAppointments ? <Loader2 className="animate-spin mx-auto my-20 text-sky-500" /> : (
                                <AppointmentsTable appointments={appointments} onUpdate={handleStatusChange} />
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="gallery" className="mt-0 outline-none">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 space-y-6">
                                <form onSubmit={handleGalleryUpload} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                        <Plus className="w-5 h-5 text-sky-500" /> New Gallery Item
                                    </h3>

                                    <div className="flex items-center justify-between mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <div className={cn("p-2 rounded-xl", isComparison ? "bg-sky-100 text-sky-600" : "bg-emerald-100 text-emerald-600")}>
                                                {isComparison ? <Layers className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                                            </div>
                                            <span className="text-sm font-semibold">{isComparison ? 'Comparison' : 'Single'}</span>
                                        </div>
                                        <Switch checked={isComparison} onCheckedChange={setIsComparison} />
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">{isComparison ? 'Result (After)' : 'Image'}</label>
                                            <Input name="mainImage" type="file" accept="image/*" className="rounded-xl border-slate-200 h-auto py-2" />
                                        </div>
                                        {isComparison && (
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Initial (Before)</label>
                                                <Input name="beforeImage" type="file" accept="image/*" className="rounded-xl border-slate-200 h-auto py-2" />
                                            </div>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={isUploading} className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 shadow-lg shadow-sky-100">
                                        {isUploading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 w-4 h-4" />}
                                        {isUploading ? 'Uploading...' : 'Publish to Gallery'}
                                    </Button>
                                </form>
                            </div>

                            <div className="lg:col-span-2">
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[400px]">
                                    <h3 className="text-lg font-bold mb-6">Gallery Items</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        {galleryItems.map(item => (
                                            <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-sm">
                                                <img src={item.imageUrl} className="w-full h-full object-cover" alt="Preview" />

                                                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2">
                                                    <Button
                                                        type="button"
                                                        size="icon"
                                                        variant={item.isPinned ? "default" : "secondary"}
                                                        className={cn("rounded-full h-8 w-8", item.isPinned && "bg-sky-500")}
                                                        onClick={() => togglePin(item.id, item.isPinned)}
                                                    >
                                                        <Pin className={cn("w-4 h-4", item.isPinned && "fill-current")} />
                                                    </Button>
                                                    <Button type="button" size="icon" variant="destructive" className="rounded-full h-8 w-8" onClick={() => deleteGalleryItem(item.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="messages" className="mt-0 outline-none">
                        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm min-h-[500px]">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
                                <Mail className="w-5 h-5 text-sky-500" /> Patient Inquiries
                            </h2>

                            {isLoadingMessages ? (
                                <div className="flex justify-center py-20">
                                    <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p>No messages received yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {messages.map((msg) => (
                                        <Card key={msg.id} className={cn(
                                            "border shadow-sm rounded-2xl overflow-hidden transition-all duration-300",
                                            msg.isRead ? "border-slate-100 opacity-80" : "border-sky-200 bg-sky-50/30 ring-1 ring-sky-100"
                                        )}>
                                            <CardContent className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                                                            msg.isRead ? "bg-slate-100 text-slate-500" : "bg-sky-500 text-white shadow-md shadow-sky-100"
                                                        )}>
                                                            {msg.name?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-bold text-slate-900">{msg.name}</h3>
                                                                {!msg.isRead && <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />}
                                                            </div>
                                                            <p className="text-xs text-slate-500">{msg.createdAt}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full h-8 w-8"
                                                        onClick={() => deleteMessage(msg.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>

                                                <div className="bg-white/50 p-4 rounded-xl mb-4 border border-slate-100">
                                                    <p className="text-sm text-slate-700 italic">"{msg.message}"</p>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    <a href={`mailto:${msg.email}`} className="text-xs flex items-center gap-1.5 text-sky-600 bg-white border border-sky-100 px-3 py-1.5 rounded-full hover:bg-sky-50 transition-colors font-medium shadow-sm">
                                                        <Mail className="w-3 h-3" /> {msg.email}
                                                    </a>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="dashboard" className="mt-0 outline-none">
                        <AdminDashboard appointments={appointments} />
                    </TabsContent>
                </Tabs>
            </main>

            {/* MANUAL BOOKING DIALOG */}
            <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                <DialogContent className="rounded-3xl sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            <UserPlus className="w-6 h-6 text-sky-500" /> Manual Booking
                        </DialogTitle>
                        <DialogDescription>
                            Schedule a patient session. Only fields marked with * are required.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleManualBookingSubmit} className="space-y-5 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block ml-1">Patient Name *</label>
                                <Input
                                    required
                                    placeholder="Enter full name"
                                    value={manualBooking.fullName}
                                    onChange={(e) => setManualBooking({ ...manualBooking, fullName: e.target.value })}
                                    className="rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block ml-1">Phone Number *</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        required
                                        placeholder="07X XXX XXXX"
                                        value={manualBooking.phone}
                                        onChange={(e) => setManualBooking({ ...manualBooking, phone: e.target.value })}
                                        className="rounded-xl border-slate-200 pl-10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block ml-1">Date *</label>
                                <Input
                                    type="date"
                                    required
                                    value={manualBooking.date}
                                    onChange={(e) => setManualBooking({ ...manualBooking, date: e.target.value })}
                                    className="rounded-xl border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block ml-1">Time Slot *</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                    <select
                                        required
                                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-10 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                                        value={manualBooking.time}
                                        onChange={(e) => setManualBooking({ ...manualBooking, time: e.target.value })}
                                    >
                                        <option value="">Select Time</option>
                                        <option value="09:00 AM">09:00 AM</option>
                                        <option value="10:00 AM">10:00 AM</option>
                                        <option value="11:00 AM">11:00 AM</option>
                                        <option value="02:00 PM">02:00 PM</option>
                                        <option value="03:00 PM">03:00 PM</option>
                                        <option value="04:00 PM">04:00 PM</option>
                                        <option value="06:00 PM">06:00 PM</option>
                                        <option value="07:00 PM">07:00 PM</option>
                                        <option value="08:00 PM">08:00 PM</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block ml-1">Email Address (Optional)</label>
                            <Input
                                type="email"
                                placeholder="patient@email.com"
                                value={manualBooking.email}
                                onChange={(e) => setManualBooking({ ...manualBooking, email: e.target.value })}
                                className="rounded-xl border-slate-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block ml-1">Service & Notes (Optional)</label>
                            <Textarea
                                placeholder="E.g. Root Canal, Follow up visit..."
                                value={manualBooking.message}
                                onChange={(e) => setManualBooking({ ...manualBooking, message: e.target.value })}
                                className="rounded-xl border-slate-200 min-h-[80px] resize-none"
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsBookingDialogOpen(false)} className="rounded-full">Cancel</Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingBooking}
                                className="bg-sky-600 hover:bg-sky-700 text-white rounded-full px-8 shadow-lg shadow-sky-100"
                            >
                                {isSubmittingBooking ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                Confirm Booking
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* CANCELLATION DIALOG */}
            <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                <DialogContent className="rounded-3xl sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Cancel Appointment</DialogTitle>
                        <DialogDescription className="pt-2">
                            Notify <strong>{selectedAppointment?.fullName}</strong>.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Provide a reason for the patient..."
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="min-h-[120px] rounded-2xl focus:ring-sky-500 border-slate-200"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={() => setIsCancelDialogOpen(false)} className="rounded-full">Dismiss</Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={!cancelReason || !!updatingId}
                            onClick={() => selectedAppointment && updateStatus(selectedAppointment.id, 'cancelled', cancelReason)}
                            className="rounded-full"
                        >
                            {updatingId ? <Loader2 className="animate-spin mr-2 w-4 h-4" /> : null}
                            Cancel & Notify
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
