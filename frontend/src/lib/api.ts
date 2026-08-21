const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export type UserRole = "BUYER_RENTER" | "LANDLORD" | "DEVELOPER" | "AGENT";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body: ApiEnvelope<T> = await res.json();

  if (!res.ok || !body.success) {
    throw new ApiError(body.message ?? "Something went wrong", res.status);
  }

  return body.data as T;
}

export function login(input: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function register(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
}) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export type PropertyListingType = "SALE" | "RENT";
export type PropertyStatus =
  | "AVAILABLE"
  | "UNDER_REVIEW"
  | "MATCHED"
  | "UNAVAILABLE";
export type RegistryStatus = "CLEAN" | "FLAGGED" | "DISPUTED" | "NOT_FOUND";
export type CommunityReportType = "CONFIRMATION" | "DISPUTE" | "FRAUD_FLAG";

export interface TrustScore {
  id: string;
  propertyId: string;
  score: number;
  registryStatus: RegistryStatus;
  communityAdjustment: number;
  explanationText: string;
  computedAt: string;
}

// Prisma's Decimal fields serialize to strings over JSON, not numbers.
export interface Property {
  id: string;
  ownerId: string;
  owner?: User | null;
  title: string;
  description?: string | null;
  listingType: PropertyListingType;
  price: string;
  bedrooms: number;
  address: string;
  lat: number;
  lng: number;
  areaKey: string;
  status: PropertyStatus;
  imageUrl?: string | null;
  galleryImages?: string[];
  createdAt: string;
  updatedAt: string;
  trustScore?: TrustScore | null;
}

export interface PropertyDocument {
  id: string;
  propertyId: string;
  plotNumber: string;
  surveyNumber: string;
  attestedOwnerName: string;
  documentType: string;
  photoUrl: string | null;
}

export interface CommunityReport {
  id: string;
  propertyId: string;
  reporterId: string;
  type: CommunityReportType;
  description: string | null;
  createdAt: string;
}

export interface PropertyDetail extends Property {
  document: PropertyDocument | null;
  communityReports: CommunityReport[];
}

export interface LandlordProfile extends User {
  totalListings: number;
  propertiesSoldOrRented: number;
  availableListings: number;
}

export function fetchUser(id: string) {
  return apiFetch<User>(`/users/${id}`);
}

export function updateProfile(
  id: string,
  token: string,
  input: { name?: string; phone?: string },
) {
  return apiFetch<User>(`/users/${id}`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(input),
  });
}

export function changePassword(
  id: string,
  token: string,
  input: { currentPassword: string; newPassword: string },
) {
  return apiFetch<{ success: boolean }>(`/users/${id}/password`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify(input),
  });
}

export function fetchLandlordProfile(id: string) {
  return apiFetch<LandlordProfile>(`/users/${id}/profile`);
}

export function fetchProperties() {
  return apiFetch<Property[]>("/properties");
}

export function fetchProperty(id: string) {
  return apiFetch<PropertyDetail>(`/properties/${id}`);
}

export function createProperty(
  token: string,
  input: {
    title: string;
    description?: string;
    listingType: PropertyListingType;
    price: number;
    bedrooms: number;
    address: string;
    lat: number;
    lng: number;
    areaKey: string;
    imageUrl?: string;
    galleryImages?: string[];
  },
) {
  return apiFetch<Property>("/properties", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(input),
  });
}

export function computeTrustScore(propertyId: string) {
  return apiFetch<TrustScore>(`/properties/${propertyId}/trust-score`, {
    method: "POST",
  });
}

export interface Cooperative {
  id: string;
  name: string;
  targetAreaKey: string;
  targetPropertyType: string;
  createdAt: string;
  _count?: { memberships: number };
}

export interface Contribution {
  id: string;
  membershipId: string;
  amount: string;
  month: string;
  createdAt: string;
}

export interface CooperativeMembership {
  id: string;
  cooperativeId: string;
  userId: string;
  monthlyContributionAmount: string;
  joinedAt: string;
  cooperative: Cooperative;
  contributions: Contribution[];
}

export interface DemandCluster {
  cooperativeId: string;
  name: string;
  targetAreaKey: string;
  targetPropertyType: string;
  memberCount: number;
  totalMonthlySavings: number;
}

function authHeader(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

export function fetchCooperatives(token: string) {
  return apiFetch<Cooperative[]>("/cooperatives", {
    headers: authHeader(token),
  });
}

export function fetchMyMemberships(token: string) {
  return apiFetch<CooperativeMembership[]>("/cooperatives/my-memberships", {
    headers: authHeader(token),
  });
}

export function joinCooperative(
  cooperativeId: string,
  token: string,
  input: { monthlyContributionAmount: number },
) {
  return apiFetch<CooperativeMembership>(
    `/cooperatives/${cooperativeId}/join`,
    {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify(input),
    },
  );
}

export function fetchDemandClusters(token: string) {
  return apiFetch<DemandCluster[]>("/cooperatives/demand-clusters", {
    headers: authHeader(token),
  });
}

export type RentToOwnStatus = "PROPOSED" | "ACCEPTED" | "DECLINED";

export interface RentToOwnMatch {
  id: string;
  cooperativeId: string;
  propertyId: string;
  status: RentToOwnStatus;
  matchedAt: string;
  property: Property;
}

export function fetchRentToOwnMatches(cooperativeId: string, token: string) {
  return apiFetch<RentToOwnMatch[]>(`/cooperatives/${cooperativeId}/matches`, {
    headers: authHeader(token),
  });
}

export function respondToRentToOwnMatch(
  matchId: string,
  token: string,
  status: "ACCEPTED" | "DECLINED",
) {
  return apiFetch<RentToOwnMatch>(`/cooperatives/matches/${matchId}/respond`, {
    method: "PATCH",
    headers: authHeader(token),
    body: JSON.stringify({ status }),
  });
}

export interface LandlordRating {
  id: string;
  landlordId: string;
  raterId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface LandlordRatingsSummary {
  ratings: LandlordRating[];
  averageRating: number | null;
  ratingCount: number;
}

export function fetchLandlordRatings(landlordId: string) {
  return apiFetch<LandlordRatingsSummary>(`/users/${landlordId}/ratings`);
}

export function rateLandlord(
  landlordId: string,
  token: string,
  input: { rating: number; comment?: string },
) {
  return apiFetch<LandlordRating>(`/users/${landlordId}/ratings`, {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(input),
  });
}

export interface NeighbourhoodData {
  id: string;
  areaKey: string;
  floodRiskScore: number;
  powerScore: number;
  securityScore: number;
  updatedAt: string;
}

export function fetchNeighbourhood(areaKey: string) {
  return apiFetch<NeighbourhoodData>(`/neighbourhood/${areaKey}`);
}

// ── Payments (Flutterwave) ────────────────────────────────────────────────────

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface Payment {
  id: string;
  userId: string;
  membershipId: string;
  amount: string;
  currency: string;
  provider: string;
  providerTxId: string | null;
  txRef: string;
  status: PaymentStatus;
  checkoutUrl: string | null;
  contributionId: string | null;
  createdAt: string;
  updatedAt: string;
  membership: CooperativeMembership;
  contribution: Contribution | null;
}

export interface PaymentInitResponse {
  paymentId: string;
  checkoutUrl: string;
  txRef: string;
}

export function initializePayment(
  token: string,
  input: { membershipId: string; amount: number },
) {
  return apiFetch<PaymentInitResponse>("/payments/initialize", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(input),
  });
}

export function verifyPayment(
  token: string,
  input: { transactionId: string; txRef: string },
) {
  return apiFetch<Payment>("/payments/verify", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(input),
  });
}

export function cancelPayment(token: string, input: { txRef: string }) {
  return apiFetch<Payment>("/payments/cancel", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify(input),
  });
}

export function fetchPaymentHistory(token: string) {
  return apiFetch<Payment[]>("/payments/history", {
    headers: authHeader(token),
  });
}

export function fetchAllNeighbourhoods() {
  return apiFetch<NeighbourhoodData[]>("/neighbourhood");
}

export interface ConversationParticipant {
  id: string;
  conversationId: string;
  userId: string;
  user: User;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender: User;
}

export interface Conversation {
  id: string;
  propertyId: string | null;
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    address: string;
    imageUrl: string | null;
  } | null;
  participants: ConversationParticipant[];
  messages: ConversationMessage[];
}

export function createConversation(propertyId: string, token: string) {
  return apiFetch<Conversation>("/conversations", {
    method: "POST",
    headers: authHeader(token),
    body: JSON.stringify({ propertyId }),
  });
}

export function fetchMyConversations(token: string) {
  return apiFetch<Conversation[]>("/conversations", {
    headers: authHeader(token),
  });
}

export function fetchConversationMessages(
  conversationId: string,
  token: string,
) {
  return apiFetch<ConversationMessage[]>(
    `/conversations/${conversationId}/messages`,
    {
      headers: authHeader(token),
    },
  );
}

export function sendConversationMessage(
  conversationId: string,
  token: string,
  body: string,
) {
  return apiFetch<ConversationMessage>(
    `/conversations/${conversationId}/messages`,
    {
      method: "POST",
      headers: authHeader(token),
      body: JSON.stringify({ body }),
    },
  );
}

export type NotificationType =
  | "MATCH_ACCEPTED"
  | "MATCH_DECLINED"
  | "RATING_RECEIVED"
  | "COMMUNITY_REPORT_FILED"
  | "NEW_MESSAGE";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export function fetchNotifications(token: string) {
  return apiFetch<AppNotification[]>("/notifications", {
    headers: authHeader(token),
  });
}

export function markNotificationRead(id: string, token: string) {
  return apiFetch<AppNotification>(`/notifications/${id}/read`, {
    method: "PATCH",
    headers: authHeader(token),
  });
}

export function markAllNotificationsRead(token: string) {
  return apiFetch<{ success: boolean }>("/notifications/read-all", {
    method: "PATCH",
    headers: authHeader(token),
  });
}

// ── Saved Properties (localStorage) ─────────────────────────────────────────
const SAVED_KEY = "homepath_saved_properties";

export function getSavedPropertyIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function toggleSavedProperty(id: string): boolean {
  const saved = getSavedPropertyIds();
  const idx = saved.indexOf(id);
  if (idx === -1) {
    saved.push(id);
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    return true;
  } else {
    saved.splice(idx, 1);
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    return false;
  }
}
