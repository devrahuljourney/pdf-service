# Cox & Kings PDF Generation Service

A serverless PDF generation service built for Cox & Kings Partner Network. This service generates professional booking vouchers, quotes, and invoices as PDFs and returns them to your main application for email delivery.

## 🚀 Architecture

**PDF Service (Railway)** → Generates PDF + Email HTML → **Main App** → Sends Email

This separation ensures:

- No SMTP port blocking issues on Railway
- Better separation of concerns
- More flexible email handling in your main app

## Features

- 📄 Generate professional PDF documents (booking vouchers, quotes, invoices)
- 🎨 Professional Cox & Kings branded templates
- 💰 Automatic GST (5%) and TCS calculation (5% up to ₹10L, 20% above)
- ✈️ Flight details and itinerary support
- 👥 Multiple traveler information
- 🖼️ Banner images and package galleries
- 🚀 Deployed on Railway with Docker
- 🔒 CORS-enabled API with origin validation

## Tech Stack

- **Runtime**: Node.js
- **PDF Generation**: Puppeteer Core + Chromium
- **Templates**: Handlebars
- **Validation**: Zod
- **Deployment**: Railway (Docker)

## Installation

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

## API Documentation

See **[API_INTEGRATION.md](API_INTEGRATION.md)** for complete integration guide.

### Endpoint

```
POST /api/generate-pdf
```

### Request Body

```json
{
  "type": "quote",
  "data": {
    "quoteNumber": "B9E30EF3",
    "customerName": "John Doe",
    "tourTitle": "Australia Coast to Outback",
    "totalAmount": 150000
    // ... other fields
  }
}
```

### Response

```json
{
  "success": true,
  "pdf": "JVBERi0xLjQKJeLjz9MK...", // base64 encoded PDF
  "emailHtml": "<html>...</html>", // Rendered email template
  "filename": "quote-B9E30EF3.pdf",
  "metadata": {
    "type": "quote",
    "documentId": "B9E30EF3",
    "size": 424434,
    "tourTitle": "Australia Coast to Outback"
  }
}
```

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
