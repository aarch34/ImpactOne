"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase, type Booking } from "@/lib/supabase/client";
import { venues, buses, turfAreas } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Calendar, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter local data
    const matchingVenues = venues.filter(v =>
        v.name.toLowerCase().includes(query.toLowerCase()) ||
        v.facilities.some(f => f.toLowerCase().includes(query.toLowerCase()))
    );

    const matchingBuses = buses.filter(b =>
        b.name.toLowerCase().includes(query.toLowerCase())
    );

    const matchingTurf = turfAreas.filter(t =>
        t.name.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        async function searchBookings() {
            if (!query) {
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                // 1. Search Text Fields
                // queryBuilder is thenable, so we treat it as a promise
                const textQuery = Promise.resolve(supabase
                    .from('bookings')
                    .select('*')
                    .or(`event_title.ilike.%${query}%,resource_name.ilike.%${query}%,requester_name.ilike.%${query}%`)
                    .order('booking_date', { ascending: false })
                    .limit(20));

                // 2. Search ID (if query looks like hex)
                let idPromise = Promise.resolve({ data: [], error: null } as any);
                const isHex = /^[0-9a-fA-F-]+$/.test(query);

                if (isHex) {
                    idPromise = Promise.resolve(supabase
                        .from('bookings')
                        .select('*')
                        .or(`id::text.ilike.%${query}%`)
                        .limit(5));
                }

                const [textResult, idResult] = await Promise.all([textQuery, idPromise]);

                if (textResult.error) throw textResult.error;
                if (idResult.error) throw idResult.error;

                // Merge and Deduplicate
                const allBookings = [...(idResult.data || []), ...(textResult.data || [])];
                const uniqueBookings = Array.from(new Map(allBookings.map(b => [b.id, b])).values());

                // Re-sort by date
                uniqueBookings.sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

                setBookings(uniqueBookings);
            } catch (error: any) {
                console.error("Error searching bookings:", error.message || error);
            } finally {
                setLoading(false);
            }
        }

        searchBookings();
    }, [query]);

    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p className="text-lg">Please enter a search term.</p>
            </div>
        );
    }

    const hasResults = matchingVenues.length > 0 || matchingBuses.length > 0 || matchingTurf.length > 0 || bookings.length > 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline tracking-tight mb-2">Search Results</h1>
                <p className="text-muted-foreground">
                    Showing results for <span className="font-semibold">"{query}"</span>
                </p>
            </div>

            {!loading && !hasResults && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/30 rounded-lg">
                    <AlertCircle className="h-12 w-12 mb-4" />
                    <p className="text-lg font-medium">No matches found</p>
                    <p>Try adjusting your search terms or checking for typos.</p>
                    <Button variant="link" asChild className="mt-4">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            )}

            {/* Resources Section */}
            {(matchingVenues.length > 0 || matchingBuses.length > 0 || matchingTurf.length > 0) && (
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Venues & Resources
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {matchingVenues.map(venue => (
                            <Card key={venue.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{venue.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground mb-2">Capacity: {venue.capacity}</div>
                                    <div className="flex flex-wrap gap-1">
                                        {venue.facilities.map(f => (
                                            <Badge key={f} variant="secondary" className="text-xs">{f}</Badge>
                                        ))}
                                    </div>
                                    <Button size="sm" className="w-full mt-4" asChild>
                                        <Link href={`/bookings?resource=${venue.id}`}>Book Now</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {matchingBuses.map(bus => (
                            <Card key={bus.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{bus.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-muted-foreground mb-2">Capacity: {bus.capacity}</div>
                                    <Badge variant="outline">Transport</Badge>
                                    <Button size="sm" className="w-full mt-4" asChild>
                                        <Link href={`/bookings?resource=${bus.id}&type=bus`}>Book Now</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                        {matchingTurf.map(turf => (
                            <Card key={turf.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg">{turf.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Badge variant="outline">Sports</Badge>
                                    <Button size="sm" className="w-full mt-4" asChild>
                                        <Link href={`/bookings?resource=${turf.id}&type=turf`}>Book Now</Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>
            )}

            {/* Bookings Section */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Searching bookings...</span>
                </div>
            ) : bookings.length > 0 && (
                <section>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary" />
                        Matching Bookings
                    </h2>
                    <div className="space-y-4">
                        {bookings.map(booking => (
                            <Card key={booking.id} className="overflow-hidden">
                                <div className="p-4 md:flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0 mb-4 md:mb-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-lg truncate">{booking.event_title}</h3>
                                            <Badge variant={
                                                booking.status === 'Approved' ? 'default' :
                                                    booking.status === 'Pending' ? 'secondary' :
                                                        booking.status === 'Rejected' ? 'destructive' : 'outline'
                                            }>
                                                {booking.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                                            <MapPin className="h-3 w-3" />
                                            {booking.resource_name} {booking.sub_area ? `- ${booking.sub_area}` : ''}
                                        </p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                            <Clock className="h-3 w-3" />
                                            {format(new Date(booking.booking_date), 'MMM dd, yyyy')} • {booking.start_time} - {booking.end_time}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="text-right hidden md:block">
                                            <div>by {booking.requester_name}</div>
                                            <div className="font-mono text-xs opacity-70">ID: {booking.id.substring(0, 8)}</div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <SearchResults />
        </Suspense>
    );
}
