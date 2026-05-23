import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { searchMooringsSchema, searchMoorings } from './tools/search-moorings.js';
import { getMooringDetailsSchema, getMooringDetails } from './tools/get-mooring-details.js';
import { createConciergeRequestSchema, createConciergeRequest } from './tools/create-concierge-request.js';
import { checkBookingStatusSchema, checkBookingStatus } from './tools/check-booking-status.js';
import { listConciergeBookingsSchema, listConciergeBookings } from './tools/list-concierge-bookings.js';
import { cancelConciergeRequestSchema, cancelConciergeRequest } from './tools/cancel-concierge-request.js';
import { getBookingHistorySchema, getBookingHistory } from './tools/get-booking-history.js';

const server = new McpServer({
  name: 'mooring-booking-concierge',
  version: '1.0.0',
});

// Tool 1: Search concierge moorings
server.tool(
  'search_concierge_moorings',
  'Search for available concierge-level moorings by location, dates, boat specs, and price. Returns moorings that accept booking requests via the concierge flow.',
  searchMooringsSchema.shape,
  async (params) => {
    try {
      const input = searchMooringsSchema.parse(params);
      const result = await searchMoorings(input);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// Tool 2: Get mooring details
server.tool(
  'get_mooring_details',
  'Get full details of a specific mooring by ID, including pricing, amenities, contact info, and physical specs.',
  getMooringDetailsSchema.shape,
  async (params) => {
    try {
      const input = getMooringDetailsSchema.parse(params);
      const result = await getMooringDetails(input);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// Tool 3: Create concierge booking request
server.tool(
  'create_concierge_request',
  'Submit a concierge booking request for a mooring. Creates a Stripe authorization hold and sends a notification email to the marina. The marina has 48 hours to confirm or decline. Use check_booking_status to poll for the response.',
  createConciergeRequestSchema.shape,
  async (params) => {
    try {
      const input = createConciergeRequestSchema.parse(params);
      const result = await createConciergeRequest(input);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// Tool 4: Check booking status
server.tool(
  'check_booking_status',
  'Check the current status of a concierge booking. Returns concierge_status (pending_marina, confirmed, declined, expired), whether it is expired, and whether it is resolved. Use this in a polling loop to wait for the marina response.',
  checkBookingStatusSchema.shape,
  async (params) => {
    try {
      const input = checkBookingStatusSchema.parse(params);
      const result = await checkBookingStatus(input);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// Tool 5: List concierge bookings
server.tool(
  'list_concierge_bookings',
  'List concierge bookings with optional filters: status, user, mooring, date range. Returns bookings with joined mooring details.',
  listConciergeBookingsSchema.shape,
  async (params) => {
    try {
      const input = listConciergeBookingsSchema.parse(params);
      const result = await listConciergeBookings(input);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// Tool 6: Cancel concierge request
server.tool(
  'cancel_concierge_request',
  'Cancel a pending concierge booking request. Releases the Stripe authorization hold and notifies the guest. Only works on bookings with concierge_status = pending_marina.',
  cancelConciergeRequestSchema.shape,
  async (params) => {
    try {
      const input = cancelConciergeRequestSchema.parse(params);
      const result = await cancelConciergeRequest(input);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

// Tool 7: Get customer booking history
server.tool(
  'get_booking_history',
  'Look up a customer\'s past bookings by user ID or email. Useful for checking if a lead is a returning customer.',
  getBookingHistorySchema.shape,
  async (params) => {
    try {
      const input = getBookingHistorySchema.parse(params);
      const result = await getBookingHistory(input);
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    } catch (err) {
      return { content: [{ type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` }], isError: true };
    }
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server fatal error:', err);
  process.exit(1);
});
