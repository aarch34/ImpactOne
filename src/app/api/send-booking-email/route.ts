import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
    try {
        const { type, booking } = await request.json();

        if (!booking || !type) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const { requester_email, requester_name, event_title, resource_name, booking_date } = booking;

        if (!requester_email) {
            return NextResponse.json(
                { error: 'Requester email not found' },
                { status: 400 }
            );
        }

        // Validate Environment Variables
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            console.error('Missing Gmail credentials');
            return NextResponse.json(
                { error: 'Server misconfiguration: Missing email credentials' },
                { status: 500 }
            );
        }

        // Create Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, ''), // Remove spaces if user copied them
            },
        });

        // Email content based on type
        let subject = '';
        let htmlContent = '';

        if (type === 'approved') {
            subject = `✅ Booking Approved: ${event_title}`;
            htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
              .detail-row { margin: 10px 0; }
              .label { font-weight: bold; color: #6b7280; }
              .value { color: #111827; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              .success-badge { display: inline-block; background: #10b981; color: white; padding: 8px 16px; border-radius: 4px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Booking Approved!</h1>
              </div>
              <div class="content">
                <p>Dear ${requester_name},</p>
                <p>Great news! Your booking request has been <span class="success-badge">APPROVED</span></p>
                
                <div class="details">
                  <h3>📅 Booking Details</h3>
                  <div class="detail-row">
                    <span class="label">Event:</span>
                    <span class="value">${event_title}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Resource:</span>
                    <span class="value">${resource_name}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Date:</span>
                    <span class="value">${new Date(booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  ${booking.start_time ? `
                  <div class="detail-row">
                    <span class="label">Time:</span>
                    <span class="value">${booking.start_time} - ${booking.end_time || 'N/A'}</span>
                  </div>
                  ` : ''}
                  ${booking.attendees ? `
                  <div class="detail-row">
                    <span class="label">Attendees:</span>
                    <span class="value">${booking.attendees}</span>
                  </div>
                  ` : ''}
                </div>

                <p>Your booking is now confirmed. Please ensure you arrive on time and follow all facility guidelines.</p>

                <p>If you have any questions or need to make changes, please contact the administrator at <a href="mailto:${process.env.GMAIL_USER}">${process.env.GMAIL_USER}</a></p>

                <div class="footer">
                  <p>This is an automated message from ImpactOne Booking System</p>
                  <p>© ${new Date().getFullYear()} ImpactOne. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
        } else if (type === 'rejected') {
            subject = `❌ Booking Request Update: ${event_title}`;
            htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
              .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; }
              .detail-row { margin: 10px 0; }
              .label { font-weight: bold; color: #6b7280; }
              .value { color: #111827; }
              .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
              .info-box { background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 4px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Booking Request Update</h1>
              </div>
              <div class="content">
                <p>Dear ${requester_name},</p>
                <p>We regret to inform you that your booking request could not be approved at this time.</p>
                
                <div class="details">
                  <h3>📋 Request Details</h3>
                  <div class="detail-row">
                    <span class="label">Event:</span>
                    <span class="value">${event_title}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Resource:</span>
                    <span class="value">${resource_name}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Requested Date:</span>
                    <span class="value">${new Date(booking_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>

                <div class="info-box">
                  <strong>💡 What's Next?</strong>
                  <p style="margin: 10px 0 0 0;">If you believe this decision was made in error or would like to discuss alternative options, please contact the administrator.</p>
                </div>

                <p>You can reach out to us at:</p>
                <p><strong>Email:</strong> <a href="mailto:${process.env.GMAIL_USER}">${process.env.GMAIL_USER}</a></p>

                <p>Thank you for your understanding.</p>

                <div class="footer">
                  <p>This is an automated message from ImpactOne Booking System</p>
                  <p>© ${new Date().getFullYear()} ImpactOne. All rights reserved.</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
        } else {
            return NextResponse.json(
                { error: 'Invalid email type' },
                { status: 400 }
            );
        }

        // Send Email
        const info = await transporter.sendMail({
            from: `"ImpactOne Bookings" <${process.env.GMAIL_USER}>`,
            to: requester_email,
            subject: subject,
            html: htmlContent,
        });

        console.log('Email sent:', info.messageId);
        return NextResponse.json({ success: true, messageId: info.messageId });

    } catch (error: any) {
        console.error('SERVER ERROR sending email:', error);
        return NextResponse.json(
            { 
                error: 'Failed to send email', 
                details: error.message,
                fullError: JSON.stringify(error, Object.getOwnPropertyNames(error))
            },
            { status: 500 }
        );
    }
}
