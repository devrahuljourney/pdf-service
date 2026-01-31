export interface BookingData {
  voucherNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  tourTitle: string;
  destination: string | null;
  departureDate: string;
  endDate: string;
  paxAdults: number;
  paxChildren: number;
  paxInfants: number;
  totalAmount: number;
  agencyName: string;
  agencyPhone: string;
  agencyEmail?: string | null;
  agentName?: string | null;
  specialRequests?: string | null;
  inclusions?: string[] | null;
  itinerary?: ItineraryDay[] | null;
  nightAllocations?: NightAllocation[] | null;
  travelers?: TravelerData[];
  paymentInfo?: PaymentInfo;
  bannerImageUrl?: string | null;
  brandTag?: string | null;
  includeTcs?: boolean;
  flightIncluded?: boolean | null;
  departureAirport?: string | null;
  flightDetails?: FlightDetails | null;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  city?: string;
  city_name?: string;
  activities?: string[];
  meals?: string[];
  transfers?: string;
  stay?: {
    label?: string;
    hotel_id?: string;
    icon_name?: string;
    icon_path?: string;
    room_type?: string;
    hotel_name?: string;
  } | null;
  accommodation?: string;
}

export interface NightAllocation {
  city: string;
  nights: number;
}

export interface TravelerData {
  firstName: string;
  lastName: string;
  passportNumber: string | null;
  passportExpiry: string | null;
  nationality: string | null;
  passportPhotoUrl: string | null;
  type: "adult" | "child" | "infant";
}

export interface PaymentInstallment {
  paymentNumber: number;
  amount: number;
  dueDate: string;
  label: string;
}

export interface PaymentInfo {
  paymentType: "one_time" | "installment";
  installments: PaymentInstallment[] | null;
}

export interface FlightDetails {
  outbound?: FlightLeg;
  return?: FlightLeg;
  connecting?: ConnectingFlight[];
  baggage?: BaggageInfo;
  notes?: string;
}

export interface FlightLeg {
  flightNumber?: string;
  airline?: string;
  departureTime?: string;
  departureDate?: string;
  departureTerminal?: string;
  arrivalTime?: string;
  arrivalAirport?: string;
  arrivalTerminal?: string;
}

export interface ConnectingFlight {
  flightNumber?: string;
  airline?: string;
  sector?: string;
  departureTime?: string;
  arrivalTime?: string;
  layoverDuration?: string;
}

export interface BaggageInfo {
  checkin?: string;
  cabin?: string;
}

export interface EmailRecipient {
  email: string;
  name: string;
}

export interface PDFRequest {
  type: 'booking-voucher' | 'quote' | 'invoice';
  data: BookingData | any;
  recipients: {
    customer?: EmailRecipient;
    agent?: EmailRecipient;
  };
}

export interface PDFResponse {
  success: boolean;
  emailsSent: {
    customer: boolean;
    agent: boolean;
  };
  pdfGenerated: boolean;
  messageId?: string;
  error?: string;
}
