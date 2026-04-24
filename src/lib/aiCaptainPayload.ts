// Single source of truth for AI Captain request payload shape.
// 3 clients call this: AIChatWidget (web full), MiniCaptainWidget (web mini),
// and MooringBookingApp/app/(tabs)/ai-captain.tsx (mobile RN mirror).

export interface ChatMessage {
    role: "user" | "assistant";
    content: string;
    isWelcome?: boolean;
}

export interface UserProfileContext {
    tier: "basic" | "premium-monthly" | "premium-annual";
    boatName?: string;
    boatLength?: number;
}

// FAZA 2 — structured vessel data read from user_vessel_profiles.
// Optional so the edge function works for users who haven't set up a vessel yet.
export interface VesselProfileContext {
    name?: string;
    boatType?: "sailboat" | "motorboat" | "rib" | "catamaran" | "yacht" | "other";
    lengthM?: number;
    beamM?: number;
    draftM?: number;
    mmsi?: string;
    callSign?: string;
    insuranceExpiry?: string | null;
    engineMake?: string;
    engineModel?: string;
    engineHours?: number;
}

export interface SearchDates {
    checkIn: string;
    checkOut: string;
}

export interface AiCaptainRequest {
    messages: ChatMessage[];
    location: { lat: number; lng: number };
    userProfile: UserProfileContext;
    vesselProfile?: VesselProfileContext;
    searchDates?: SearchDates | null;
    isProviderContext?: boolean;
    conversationId?: string;
}

export interface AiCaptainResponse {
    reply: string;
    confidence?: number;
    flags?: string[];
    sources?: SourceCitation[];
    intent?: Intent;
    weather?: WeatherData | null;
    mayday?: MaydayPayload | null;
    remaining?: number | null;
    resetAt?: string | null;
    paywall?: boolean;
    qualityId?: string | null;
    conversationId?: string | null;
}

export interface WeatherData {
    windKnots: number;
    gustKnots: number;
    beaufort: number;
    tempC: number;
    dewpointC: number;
    pressurehPa: number;
    waveM: number;
    swellM: number;
    ok: boolean;
}

export type Intent =
    | "SEARCH_MOORING"
    | "DIAGNOSE_ENGINE"
    | "CHECK_WEATHER"
    | "EMERGENCY"
    | "BOOKING_HELP"
    | "NAVIGATION_ROUTE"
    | "GENERAL_CHAT";

export interface SourceCitation {
    type: "rpc" | "kb" | "windy" | "system";
    title: string;
    url?: string;
    detail?: string;
}

export interface MaydayPayload {
    country: string;
    countryCode: string;
    mrccPhone: string;
    mrccAltPhone?: string | null;
    vhfChannel: number;
    coastGuard?: string | null;
    coastGuardUrl?: string | null;
}

export function buildAiCaptainPayload(args: {
    messages: ChatMessage[];
    location: { lat: number; lng: number };
    profile: { subscription_tier?: string | null; boat_name?: string | null; boat_length?: number | null } | null | undefined;
    tier: UserProfileContext["tier"];
    vessel?: {
        name?: string | null;
        boat_type?: string | null;
        length_m?: number | null;
        beam_m?: number | null;
        draft_m?: number | null;
        mmsi?: string | null;
        call_sign?: string | null;
        insurance_expiry?: string | null;
        engine_make?: string | null;
        engine_model?: string | null;
        engine_hours?: number | null;
    } | null;
    searchDates?: SearchDates | null;
    isProviderContext?: boolean;
    conversationId?: string;
}): AiCaptainRequest {
    const userProfile: UserProfileContext = {
        tier: args.tier,
        boatName: args.profile?.boat_name ?? undefined,
        boatLength: args.profile?.boat_length ?? undefined,
    };

    const v = args.vessel;
    const vesselProfile: VesselProfileContext | undefined = v
        ? {
            name: v.name ?? undefined,
            boatType: (v.boat_type ?? undefined) as VesselProfileContext["boatType"],
            lengthM: v.length_m ?? undefined,
            beamM: v.beam_m ?? undefined,
            draftM: v.draft_m ?? undefined,
            mmsi: v.mmsi ?? undefined,
            callSign: v.call_sign ?? undefined,
            insuranceExpiry: v.insurance_expiry,
            engineMake: v.engine_make ?? undefined,
            engineModel: v.engine_model ?? undefined,
            engineHours: v.engine_hours ?? undefined,
        }
        : undefined;

    return {
        messages: args.messages,
        location: args.location,
        userProfile,
        vesselProfile,
        searchDates: args.searchDates ?? null,
        isProviderContext: args.isProviderContext ?? false,
        conversationId: args.conversationId,
    };
}
