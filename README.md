# Cox & Kings PDF Generation Service

A serverless PDF generation and email service built for Cox & Kings Partner Network. This service generates professional booking vouchers, quotes, and invoices as PDFs and sends them via email.

## 🚀 Quick Start

**New to this project?** Follow these guides in order:

1. **[SETUP.md](SETUP.md)** - Complete installation and configuration guide
2. **[QUICKSTART.md](QUICKSTART.md)** - Get running in 5 minutes
3. **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deploy to production

## Features

- 📄 Generate professional PDF documents (booking vouchers, quotes, invoices)
- 📧 Automated email delivery with PDF attachments
- 💰 Automatic GST (5%) and TCS calculation (5% up to ₹10L, 20% above)
- ✈️ Flight details and itinerary support
- 👥 Multiple traveler information
- 🎨 Professional Cox & Kings branded templates
- 🚀 Serverless deployment on Vercel
- 🔒 CORS-enabled API with origin validation

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **PDF Generation**: Puppeteer Core + Chromium
- **Email**: Nodemailer (Gmail SMTP)
- **Templates**: Handlebars
- **Validation**: Zod
- **Deployment**: Vercel Serverless Functions

## Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Gmail credentials

# Test locally (no Vercel needed)
npm run test:local
```

See **[SETUP.md](SETUP.md)** for detailed instructions.

## Project Structure

```
pdf-service/
├── api/
│   └── generate-pdf.ts          # Main API endpoint
├── templates/
│   ├── booking-voucher.html     # PDF template
│   ├── booking-voucher-email.html # Email template
│   └── styles/
│       └── common.css           # Shared styles
├── utils/
│   ├── puppeteer.ts            # PDF generation
│   ├── email.ts                # Email sending
│   ├── template-render.ts      # Template rendering
│   └── validator.ts            # Request validation
├── types/
│   └── index.ts                # TypeScript interfaces
├── test-request.json           # Sample API request
├── test-local.js               # Local test script
├── SETUP.md                    # Setup guide
├── QUICKSTART.md               # Quick start guide
└── DEPLOYMENT.md               # Deployment guide
```

## API Documentation

### Endpoint

```
POST /api/generate-pdf
```

### Request Body Example

```json
{
  "type": "booking-voucher",
  "data": {
    "voucherNumber": "CK2024001",
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "customerPhone": "+91 9876543210",
    "tourTitle": "Magical Kashmir - 7 Days",
    "destination": "Kashmir",
    "departureDate": "2024-06-15",
    "endDate": "2024-06-22",
    "paxAdults": 2,
    "paxChildren": 1,
    "paxInfants": 0,
    "totalAmount": 150000,
    "agencyName": "Travel World",
    "agencyPhone": "+91 9876543210",
    "includeTcs": true,
    "flightIncluded": true
  },
  "recipients": {
    "customer": {
      "email": "john@example.com",
      "name": "John Doe"
    },
    "agent": {
      "email": "agent@travelworld.com",
      "name": "Jane Smith"
    }
  }
}
```

See `test-request.json` for a complete example with all optional fields.

### Response

```json
{
  "success": true,
  "emailsSent": {
    "customer": true,
    "agent": true
  },
  "pdfGenerated": true,
  "messageId": "abc123@gmail.com"
}
```

## Testing

### Local Test (No Vercel Required)

```bash
npm run test:local
```

This directly tests PDF generation and email sending.

### API Test (With Vercel Dev Server)

```bash
# Terminal 1: Start server
npm start

# Terminal 2: Test API
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d @test-request.json
```

## Deployment

```bash
# Login to Vercel
npm run login

# Deploy to production
npm run deploy
```

Then add environment variables in Vercel Dashboard:

- `GMAIL_USER`
- `GMAIL_APP_PASSWORD`
- `ALLOWED_ORIGINS`
- `NODE_ENV`

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment guide.

## Tax Calculations

### GST (Goods and Services Tax)

- Fixed rate: **5%** of package amount

### TCS (Tax Collected at Source)

- Up to ₹10,00,000: **5%**
- Above ₹10,00,000: **5%** on first ₹10L + **20%** on amount above ₹10L

## Customization

### Templates

- `templates/booking-voucher.html` - PDF design
- `templates/booking-voucher-email.html` - Email design
- `templates/styles/common.css` - Shared styles

### Brand Colors

- Navy: `#0f2942`
- Accent Orange: `#c65a11`

### Handlebars Helpers

- `{{formatINR amount}}` - Format as Indian Rupees
- `{{eq a b}}` - Check equality
- `{{gt a b}}` - Check if a > b
- `{{add a b}}` - Add two numbers

## Troubleshooting

### Common Issues

**Email not sending?**

- Verify Gmail App Password is correct
- Check 2-Step Verification is enabled
- See [SETUP.md](SETUP.md#troubleshooting)

**PDF generation fails?**

- Ensure templates exist in `templates/` folder
- Check memory allocation in `vercel.json`
- Run `npm run test:local` for detailed errors

**CORS errors?**

- Add your domain to `ALLOWED_ORIGINS` in `.env`
- Restart the server after changes

See **[SETUP.md](SETUP.md#troubleshooting)** for more solutions.

## Scripts

```bash
npm install          # Install dependencies
npm run test:local   # Test without Vercel
npm run login        # Login to Vercel
npm start            # Start dev server
npm run build        # Build TypeScript
npm run deploy       # Deploy to production
```

## Documentation

- **[SETUP.md](SETUP.md)** - Complete setup and configuration
- **[QUICKSTART.md](QUICKSTART.md)** - 5-minute quick start
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment checklist
- **test-request.json** - Sample API request

## Security

- Never commit `.env` file
- Keep Gmail App Password secure
- Restrict `ALLOWED_ORIGINS` to known domains
- Rotate credentials regularly
- Run `npm audit` to check for vulnerabilities

## License

Proprietary - Cox & Kings Partner Network

## Support

For issues or questions:

1. Check the troubleshooting sections in guides
2. Review Vercel function logs
3. Contact the development team
