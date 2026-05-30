import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BASE_STYLE = `
  font-family: 'Segoe UI', Arial, sans-serif;
  background: #0f0f14;
  color: #e5e5f0;
  padding: 32px;
  border-radius: 12px;
`;
const ACCENT = '#DC143C';

/**
 * Send the 56-day eligibility reminder to a donor.
 */
export const sendEligibilityReminder = async (donor) => {
  const html = `
    <div style="${BASE_STYLE}">
      <div style="border-left: 4px solid ${ACCENT}; padding-left: 16px; margin-bottom: 24px;">
        <h1 style="color:${ACCENT}; margin:0;">🩸 You're Eligible to Donate Again!</h1>
      </div>
      <p>Hi <strong>${donor.name}</strong>,</p>
      <p>It has been 56 days since your last donation. <strong>You are now eligible to donate blood again.</strong></p>
      <p>Every donation saves up to 3 lives. People in Hyderabad need donors like you right now.</p>
      <a href="${process.env.CLIENT_URL}/donor/dashboard"
         style="display:inline-block; background:${ACCENT}; color:#fff; padding:12px 24px;
                border-radius:8px; text-decoration:none; font-weight:600; margin-top:16px;">
        Schedule a Donation →
      </a>
      <p style="margin-top:32px; color:#999; font-size:12px;">
        Emergency Blood Connector · Hyderabad, India
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Emergency Blood Connector" <${process.env.EMAIL_USER}>`,
    to: donor.email,
    subject: '🩸 You Can Save Lives Again — Donation Eligibility Restored',
    html,
  });
};

/**
 * Notify a donor about an emergency blood request near them.
 */
export const sendEmergencyAlert = async (donor, request) => {
  const urgencyColor = request.urgency === 'critical' ? '#FF0000' : ACCENT;
  const html = `
    <div style="${BASE_STYLE}">
      <div style="background:${urgencyColor}; padding:12px 20px; border-radius:8px; margin-bottom:24px;">
        <h1 style="color:#fff; margin:0; font-size:20px;">
          🚨 URGENT: ${request.urgency.toUpperCase()} Blood Request
        </h1>
      </div>
      <p>Hi <strong>${donor.name}</strong>,</p>
      <p>
        <strong>${request.patientName}</strong> urgently needs 
        <strong>${request.units} unit(s) of ${request.bloodType}</strong> blood at 
        <strong>${request.hospital.name}</strong>.
      </p>
      <p>Your blood type matches and you are near the location. Can you help?</p>
      <a href="${process.env.CLIENT_URL}/donor/dashboard"
         style="display:inline-block; background:${urgencyColor}; color:#fff; padding:12px 24px;
                border-radius:8px; text-decoration:none; font-weight:600; margin-top:16px;">
        Respond Now →
      </a>
      <p style="margin-top:32px; color:#999; font-size:12px;">
        Emergency Blood Connector · Hyderabad, India
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Emergency Blood Connector" <${process.env.EMAIL_USER}>`,
    to: donor.email,
    subject: `🚨 Emergency: ${request.bloodType} Blood Needed at ${request.hospital.name}`,
    html,
  });
};

/**
 * Send request status update to the requester.
 */
export const sendRequestStatusUpdate = async (user, request) => {
  const statusMessages = {
    matched: 'A donor has been matched to your request!',
    fulfilled: 'Your blood request has been fulfilled. We wish the patient a speedy recovery.',
    cancelled: 'Your blood request has been cancelled.',
  };

  const message = statusMessages[request.status] || `Your request status is now: ${request.status}`;

  const html = `
    <div style="${BASE_STYLE}">
      <div style="border-left: 4px solid ${ACCENT}; padding-left: 16px; margin-bottom: 24px;">
        <h1 style="color:${ACCENT}; margin:0;">Request Update</h1>
      </div>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p>${message}</p>
      <p><strong>Patient:</strong> ${request.patientName}</p>
      <p><strong>Blood Type:</strong> ${request.bloodType}</p>
      <a href="${process.env.CLIENT_URL}/recipient/dashboard"
         style="display:inline-block; background:${ACCENT}; color:#fff; padding:12px 24px;
                border-radius:8px; text-decoration:none; font-weight:600; margin-top:16px;">
        View Request →
      </a>
    </div>
  `;

  await transporter.sendMail({
    from: `"Emergency Blood Connector" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Blood Request Update — ${request.status}`,
    html,
  });
};
