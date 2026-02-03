export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking, action, cancellationReason } = body;

    if (!booking || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      return Response.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const isApproved = action === 'Approved';
    const isCancelled = action === 'Cancelled';

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
          ? `<p style="color:orange;">⚠️ Cancelled: ${cancellationReason || 'No reason provided'}</p>`
          : `<p style="color:red;">❌ Booking not approved.</p>`
      }

      <hr />
      <p>This is an automated message from ImpactOne.</p>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ImpactOne <no-reply@impactone.com>',
        to: booking.requester_email,
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.text();
      throw new Error(error);
    }

    return Response.json({ message: 'Email sent successfully' });

  } catch (error: any) {
    console.error('Email error:', error);
    return Response.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
