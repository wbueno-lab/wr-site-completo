import { RealtimeChannel as SupabaseRealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export type RealtimeChannel = SupabaseRealtimeChannel;
export type { RealtimePostgresChangesPayload };

export interface DatabaseErrorDetails {
  code: string;
  message: string;
  details?: string;
}

export interface DatabaseResult<T> {
  data: T | null;
  error: DatabaseErrorDetails | null;
  status: number;
  statusText: string;
  count: number | null;
}

export type ChannelStatus = 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR';

export const CHANNEL_STATES = {
  SUBSCRIBED: 'SUBSCRIBED',
  TIMED_OUT: 'TIMED_OUT',
  CLOSED: 'CLOSED',
  CHANNEL_ERROR: 'CHANNEL_ERROR',
  JOINED: 'joined'
} as const;

export type ChannelStateValues = (typeof CHANNEL_STATES)[keyof typeof CHANNEL_STATES];

export type ChannelState = ChannelStateValues;

export type SubscriptionStatus = ChannelStateValues;

export type ExtendedRealtimeChannel = SupabaseRealtimeChannel;