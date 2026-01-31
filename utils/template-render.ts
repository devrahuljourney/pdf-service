import Handlebars from 'handlebars';
import { readFileSync } from 'fs';
import { join } from 'path';

// Register Handlebars helpers
Handlebars.registerHelper('formatINR', function(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
});

Handlebars.registerHelper('eq', function(a: any, b: any) {
  return a === b;
});

Handlebars.registerHelper('gt', function(a: number, b: number) {
  return a > b;
});

Handlebars.registerHelper('add', function(a: number, b: number) {
  return a + b;
});

export function renderTemplate(templateName: string, data: any): string {
  console.log(`[Template] Rendering: ${templateName}`);
  
  const templatePath = join(process.cwd(), 'templates', `${templateName}.html`);
  const templateContent = readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateContent);
  
  return template(data);
}
