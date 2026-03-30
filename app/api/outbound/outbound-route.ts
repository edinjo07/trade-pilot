import { NextResponse } from "next/server";

/**
 * DEPRECATED: This endpoint is no longer needed with new Lead schema.
 * Lead is created directly with clickId via POST /api/lead
 * Network click is tracked via clickId in Lead record.
 *
 * This route remains for backward compatibility but should not be used.
 */
export async function POST(req: Request) {
  return NextResponse.json(
    {
      ok: false,
      code: "DEPRECATED",
      message: "Use POST /api/lead with clickId instead. This endpoint is deprecated.",
    },
    { status: 410 }
  );
}
