import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { booking, action, cancellationReason } = body;

    // Validate required fields
    if (!booking || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get email credentials from environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailPassword) {
      console.error('Email credentials not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword.replace(/\s/g, ''), // Remove any spaces from app password
      },
    });

    // Determine email subject and content based on action
    const isApproved = action === 'Approved';
    const isCancelled = action === 'Cancelled';
    const subject = `Booking ${action}: ${booking.event_title}`;

    // Format date nicely
    const bookingDate = new Date(booking.booking_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create HTML email content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: ${isApproved ? '#10b981' : isCancelled ? '#f97316' : '#ef4444'};
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 8px 8px;
            }
            .detail-row {
              margin: 15px 0;
              padding: 10px;
              background-color: white;
              border-left: 3px solid ${isApproved ? '#10b981' : isCancelled ? '#f97316' : '#ef4444'};
              padding-left: 15px;
            }
            .label {
              font-weight: bold;
              color: #6b7280;
              font-size: 14px;
            }
            .value {
              color: #111827;
              font-size: 16px;
              margin-top: 4px;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              color: #6b7280;
              font-size: 14px;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              background-color: ${isApproved ? '#d1fae5' : isCancelled ? '#fed7aa' : '#fee2e2'};
              color: ${isApproved ? '#065f46' : isCancelled ? '#9a3412' : '#991b1b'};
              border-radius: 20px;
              font-weight: bold;
              margin: 10px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">ImpactOne Booking ${action}</h1>
            </div>
            <div class="content">
              <p>Hello ${booking.requester_name},</p>
              
              <p>Your booking request has been <strong>${action.toLowerCase()}</strong>.</p>
              
              <div class="status-badge">${action.toUpperCase()}</div>
              
              <h3 style="color: #111827; margin-top: 25px;">Booking Details:</h3>
              
              <div class="detail-row">
                <div class="label">Event Title</div>
                <div class="value">${booking.event_title}</div>
              </div>
              
              <div class="detail-row">
                <div class="label">Resource</div>
                <div class="value">${booking.resource_name}${booking.sub_area ? ` - ${booking.sub_area}` : ''}</div>
              </div>
              
              <div class="detail-row">
                <div class="label">Date</div>
                <div class="value">${bookingDate}</div>
              </div>
              
              <div class="detail-row">
                <div class="label">Time</div>
                <div class="value">${booking.start_time} - ${booking.end_time}</div>
              </div>
              
              <div class="detail-row">
                <div class="label">Attendees</div>
                <div class="value">${booking.attendees} people</div>
              </div>
              
              ${booking.event_description ? `
              <div class="detail-row">
                <div class="label">Description</div>
                <div class="value">${booking.event_description}</div>
              </div>
              ` : ''}
              
              ${isApproved ? `
              <div style="margin-top: 25px; padding: 15px; background-color: #d1fae5; border-radius: 8px;">
                <p style="margin: 0; color: #065f46;">
                  ✓ Your booking has been confirmed! Please make sure to arrive on time and follow all venue guidelines.
                </p>
              </div>
              ` : isCancelled ? `
              <div style="margin-top: 25px; padding: 15px; background-color: #fed7aa; border-radius: 8px; border-left: 4px solid #f97316;">
                <p style="margin: 0 0 10px 0; color: #9a3412; font-weight: bold;">
                  ⚠️ This booking has been cancelled by the admin.
                </p>
                <p style="margin: 0; color: #9a3412;">
                  <strong>Reason:</strong> ${cancellationReason || 'No reason provided'}
                </p>
              </div>
              <div style="margin-top: 15px; padding: 15px; background-color: #f3f4f6; border-radius: 8px;">
                <p style="margin: 0; color: #4b5563; font-size: 14px;">
                  If you have questions or would like to submit a new booking request, please contact us at ${gmailUser}.
                </p>
              </div>
              ` : `
              <div style="margin-top: 25px; padding: 15px; background-color: #fee2e2; border-radius: 8px;">
                <p style="margin: 0; color: #991b1b;">
                  Your booking request was not approved. If you have questions, please contact the admin at ${gmailUser}.
                </p>
              </div>
              `}
              
              <div class="footer">
                <p>This is an automated message from ImpactOne Campus Resource Management System.</p>
                <p>If you have any questions, please contact us at ${gmailUser}</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version
    const textContent = `
ImpactOne Booking ${action}

Hello ${booking.requester_name},

Your booking request has been ${action.toLowerCase()}.

Booking Details:
- Event: ${booking.event_title}
- Resource: ${booking.resource_name}${booking.sub_area ? ` - ${booking.sub_area}` : ''}
- Date: ${bookingDate}
- Time: ${booking.start_time} - ${booking.end_time}
- Attendees: ${booking.attendees}
${booking.event_description ? `- Description: ${booking.event_description}` : ''}

${isApproved
        ? 'Your booking has been confirmed! Please make sure to arrive on time and follow all venue guidelines.'
        : isCancelled
          ? `⚠️ This booking has been cancelled by the admin.\n\nReason: ${cancellationReason || 'No reason provided'}\n\nIf you have questions or would like to submit a new booking request, please contact us at ${gmailUser}.`
          : `Your booking request was not approved. If you have questions, please contact the admin at ${gmailUser}.`
      }

---
This is an automated message from ImpactOne Campus Resource Management System.
If you have any questions, please contact us at ${gmailUser}
    `;

    // Send email
    const mailOptions = {
      from: `ImpactOne <${gmailUser}>`,
      to: booking.requester_email,
      subject: subject,
      text: textContent,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
}
