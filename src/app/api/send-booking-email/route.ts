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

    const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
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

    const subject = `Booking ${action}: ${booking.event_title}`;

    const html = `
      <h2>ImpactOne Booking ${action}</h2>
      <p>Hello ${booking.requester_name},</p>
      <p>Your booking request has been <strong>${action.toLowerCase()}</strong>.</p>

      <h3>Booking Details</h3>
      <ul>
        <li><strong>Event:</strong> ${booking.event_title}</li>
        <li><strong>Resource:</strong> ${booking.resource_name}${booking.sub_area ? ` - ${booking.sub_area}` : ''}</li>
        <li><strong>Date:</strong> ${bookingDate}</li>
        <li><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</li>
        <li><strong>Attendees:</strong> ${booking.attendees}</li>
      </ul>

      ${isApproved
        ? `<p style="color:green;">✅ Your booking has been confirmed.</p>`
        : isCancelled
          ? `<p style="color:orange;">⚠️ Cancelled: ${reason || 'No reason provided'}</p>`
          : `<p style="color:red;">❌ Booking not approved.${reason ? ` Reason: ${reason}` : ''}</p>`
      }

      <hr />
      <p>This is an automated message from ImpactOne.</p>
    `;

    await transporter.sendMail({
      from: `"ImpactOne" <${GMAIL_USER}>`,
      to: booking.requester_email,
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
