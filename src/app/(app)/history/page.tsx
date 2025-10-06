import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { bookingHistory } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

export default function HistoryPage() {
    const getBadgeVariant = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'default';
            case 'Pending':
                return 'secondary';
            case 'Rejected':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">Booking History</h1>
                    <p className="text-muted-foreground">A log of all past and current booking requests.</p>
                </div>
                <Button>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export CSV
                </Button>
            </div>
            <div className="border rounded-lg bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">ID</TableHead>
                            <TableHead>Resource</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookingHistory.map((booking) => (
                            <TableRow key={booking.id}>
                                <TableCell className="font-medium">{booking.id}</TableCell>
                                <TableCell>{booking.resource}</TableCell>
                                <TableCell>{booking.department}</TableCell>
                                <TableCell>{booking.date}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant={getBadgeVariant(booking.status)}
                                           className={booking.status === "Approved" ? "bg-primary text-primary-foreground hover:bg-primary/80" : ""}>
                                        {booking.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
