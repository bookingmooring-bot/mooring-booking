import fs from 'fs';

const htmlContent = fs.readFileSync('./email-templates/04-invitation-to-collaborate-en.html', 'utf8');

async function sendEmail() {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer re_ETh4NvHK_33biLGqhagatNog3SZC5hX4F',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Mooring Booking Team <info@mooring-booking.com>',
      to: ['mb.smartmatrix@gmail.com', 'dlazukic@motovunvillas.com'],
      subject: 'INVITATION FOR COLLABORATION – Mooring Booking, a new AI-powered nautical platform',
      html: htmlContent
    })
  });

  const data = await response.json();
  console.log('Resend Response:', data);
}

sendEmail().catch(console.error);
