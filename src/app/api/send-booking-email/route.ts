export const runtime = 'nodejs'; // Use Node.js runtime for Nodemailer

import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking, action, reason } = body;
    const cancellationReason = reason; // Alias for backward compatibility if needed, or just use reason

    if (!booking || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { GMAIL_USER, GMAIL_APP_PASSWORD, ADMIN_EMAIL } = process.env;
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
      return Response.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    const isApproved = action === 'Approved';
    const isCancelled = action === 'Cancelled';
    const isRejected = action === 'Rejected';

    const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Format time display based on selected slots
    const formatTimeDisplay = () => {
      if (booking.duration_type === "full-day") {
        return "Full Day (9:00 AM - 4:30 PM)";
      }
      if (booking.selected_slots && booking.selected_slots.length > 0) {
        const sortedSlots = [...booking.selected_slots].sort();
        if (sortedSlots.length === 1) {
          return sortedSlots[0];
        }
        return `${sortedSlots[0]} - ${sortedSlots[sortedSlots.length - 1]}`;
      }
      return `${booking.start_time} - ${booking.end_time}`;
    };

    const timeDisplay = formatTimeDisplay();



    // Add a unique identifier (booking ID suffix) to the subject to prevent threading
    const uniqueId = booking.id ? `#${booking.id.slice(0, 8)}` : `[${Date.now()}]`;
    const subject = `Booking ${action}: ${booking.event_title} (${uniqueId})`;

    // Status colors and icons
    const statusConfig = {
      Requested: { color: '#3b82f6', icon: '📩', bg: '#eff6ff', border: '#2563eb' },
      Approved: { color: '#10b981', icon: '✅', bg: '#ecfdf5', border: '#059669' },
      Rejected: { color: '#ef4444', icon: '❌', bg: '#fef2f2', border: '#b91c1c' },
      Cancelled: { color: '#f97316', icon: '⚠️', bg: '#fff7ed', border: '#c2410c' },
    };

    const config = statusConfig[action as keyof typeof statusConfig] || statusConfig.Approved;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking ${action}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1f2937; margin: 0; padding: 0; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb; }
          .header { background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: #ffffff; padding: 28px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
          .status-banner { background-color: ${config.bg}; border-left: 6px solid ${config.border}; padding: 18px 24px; margin: 0; border-bottom: 1px solid ${config.border}33; }
          .status-title { color: ${config.border}; font-size: 20px; font-weight: 700; margin: 0 0 6px 0; display: flex; align-items: center; gap: 10px; }
          .content { padding: 32px 28px; background-color: #ffffff; }
          .greeting { margin-top: 0; font-size: 16px; color: #374151; line-height: 1.5; }
          .details-card { background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 0; margin: 24px 0; overflow: hidden; }
          .detail-row { display: flex; border-bottom: 1px solid #e5e7eb; padding: 14px 20px; background-color: #ffffff; }
          .detail-row:nth-child(even) { background-color: #f9fafb; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; width: 140px; color: #6b7280; font-size: 14px; }
          .detail-value { flex: 1; color: #111827; font-size: 14px; font-weight: 500; }
          .reason-box { background-color: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px; padding: 16px 20px; margin-top: 20px; color: #991b1b; }
          .footer { background-color: #f3f4f6; padding: 24px 20px; text-align: center; font-size: 13px; color: #6b7280; border-top: 2px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          .button:hover { background: linear-gradient(135deg, #374151 0%, #1f2937 100%); }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>ImpactOne</h1>
          </div>
          
          <div class="status-banner">
            <div class="status-title">
              ${config.icon} Booking ${action}
            </div>
            <p style="margin: 0; color: ${config.border}; opacity: 0.9;">
              ${action === 'Requested'
        ? 'A new booking request requires your approval.'
        : `Your booking request has been <strong>${action.toLowerCase()}</strong>.`}
            </p>
          </div>

          <div class="content">
            <p class="greeting">Hello <strong>${action === 'Requested' ? 'Admin' : booking.requester_name}</strong>,</p>
            
            <div class="details-card">
              <div class="detail-row">
                <div class="detail-label">Event</div>
                <div class="detail-value">${booking.event_title}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Resource</div>
                <div class="detail-value">${booking.resource_name}${booking.sub_area ? ` - ${booking.sub_area}` : ''}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Date</div>
                <div class="detail-value">${bookingDate}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Time</div>
                <div class="detail-value">${timeDisplay}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Attendees</div>
                <div class="detail-value">${booking.attendees}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Requester</div>
                <div class="detail-value">${booking.requester_name} (${booking.requester_email})</div>
              </div>
            </div>

            ${(isRejected || isCancelled) && reason ? `
              <div class="reason-box">
                <strong>${isCancelled ? 'Cancellation' : 'Rejection'} Reason:</strong><br>
                ${reason}
              </div>
            ` : ''}

            ${action === 'Requested' ? `
               <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/pending-approvals" class="button">Review Request</a>
              </p>
            ` : isApproved ? `
              <p style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || '#'}" class="button">View Booking Details</a>
              </p>
            ` : ''}
          </div>

          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} ImpactOne Booking System. All rights reserved.</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    console.log(`Sending email for action: ${action}`);
    console.log(`To: ${action === 'Requested' ? GMAIL_USER : booking.requester_email}`);

    await transporter.sendMail({
      from: `"ImpactOne" <${GMAIL_USER}>`,
      to: action === 'Requested' ? (ADMIN_EMAIL || GMAIL_USER) : booking.requester_email,
      subject,
      html,
    });

    return Response.json({ message: 'Email sent successfully' });

  } catch (error: any) {
    console.error('Email error:', error);
    return Response.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
