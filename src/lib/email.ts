import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "noreply@gharbhada.com";

export const sendKycApprovedEmail = async (name: string, email: string) => {
  if (!email) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "KYC Verification Approved ✓",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Welcome to GharBhada, ${name}!</h2>
          <p>Great news — your KYC verification has been approved.</p>
          <p>You can now:</p>
          <ul>
            <li>List your properties</li>
            <li>Apply for leases</li>
            <li>Access all platform features</li>
          </ul>
          <a href="${process.env.CLIENT_URL}/dashboard" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Go to Dashboard</a>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">GharBhada Team</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send KYC approved email:", err);
  }
};

export const sendKycRejectedEmail = async (name: string, email: string, reason: string) => {
  if (!email) return;
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "KYC Verification - Rejected",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">KYC Verification Status</h2>
          <p>Hello ${name},</p>
          <p>Unfortunately, your KYC verification was not approved.</p>
          <div style="background-color: #fee; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
            <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          <p>Please review the feedback and resubmit your KYC with corrected documents.</p>
          <a href="${process.env.CLIENT_URL}/dashboard/kyc" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Resubmit KYC</a>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">Questions? Contact support.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send KYC rejected email:", err);
  }
};

export const sendLeaseCreatedEmail = async (
  tenantName: string,
  email: string,
  propertyTitle: string,
  startDate: Date,
  endDate: Date,
  monthlyRent: number
) => {
  if (!email) return;
  try {
    const start = new Date(startDate).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" });
    const end = new Date(endDate).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Lease Confirmation — ${propertyTitle}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Lease Agreement Confirmed</h2>
          <p>Hello ${tenantName},</p>
          <p>Your lease has been created. Here are the details:</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Property:</strong> ${propertyTitle}</p>
            <p><strong>Start Date:</strong> ${start}</p>
            <p><strong>End Date:</strong> ${end}</p>
            <p><strong>Monthly Rent:</strong> Rs. ${monthlyRent.toLocaleString()}</p>
          </div>
          <p>Keep this confirmation for your records. You can view and manage your lease in your dashboard.</p>
          <a href="${process.env.CLIENT_URL}/dashboard/leases" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">View Lease</a>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">GharBhada Team</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send lease created email:", err);
  }
};

export const sendPaymentDueEmail = async (
  tenantName: string,
  email: string,
  propertyTitle: string,
  amount: number,
  dueDate: Date
) => {
  if (!email) return;
  try {
    const due = new Date(dueDate).toLocaleDateString("en-NP", { year: "numeric", month: "short", day: "numeric" });

    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Payment Due Reminder — Rs. ${amount.toLocaleString()}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626;">Payment Due Reminder</h2>
          <p>Hello ${tenantName},</p>
          <p>A payment is due for your lease:</p>
          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Property:</strong> ${propertyTitle}</p>
            <p style="margin: 5px 0;"><strong>Amount Due:</strong> Rs. ${amount.toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Due Date:</strong> ${due}</p>
          </div>
          <p>Please submit your payment before the due date to avoid penalties.</p>
          <a href="${process.env.CLIENT_URL}/dashboard/leases" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">Pay Now</a>
          <p style="color: #666; font-size: 12px; margin-top: 40px;">GharBhada Team</p>
        </div>
      `,
    });
  } catch (err) {
    console.error("Failed to send payment due email:", err);
  }
};
