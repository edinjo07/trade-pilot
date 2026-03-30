"use client";

import { useState } from "react";
import { Card, Button } from "./ui";

export default function Section7GateLead(props: {
  onBack: () => void;
  onDone: () => void;
}) {
  const [accepted, setAccepted] = useState(false);

  if (!accepted) {
    return (
      <Card>
        <h2 className="text-2xl font-semibold">Final gate before the next step</h2>
        <p className="text-sm text-neutral-500 mt-2">
          This is a filter. If you pass it, the next page will ask for contact details.
        </p>
        <p className="text-neutral-300 mt-2">
          The next step is only for people willing to proceed with honest information.
        </p>

        <div className="mt-4 rounded-2xl border border-neutral-800 bg-neutral-950 p-4">
          <div className="text-sm text-neutral-400">What this means</div>
          <div className="mt-1 text-neutral-200">
            This flow screens out casual clicks. If you continue, you’ll be asked to verify
            your contact details on the next page.
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-neutral-200 text-sm">
          <li>• No guarantees or promises.</li>
          <li>• You’ll see a pressure test and a justification step.</li>
          <li>• Then you’ll submit your contact details.</li>
        </ul>

        <div className="mt-5 flex gap-3">
          <Button onClick={() => setAccepted(true)}>Continue to the next step</Button>
          <button className="text-sm text-neutral-400 hover:text-neutral-200 underline" onClick={props.onBack}>
            Back
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-2xl font-semibold">Ready to proceed?</h2>
      <p className="text-neutral-300 mt-2">
        You’ll complete a pressure test, a short justification, and then submit your details.
      </p>
      <div className="mt-5 flex gap-3">
        <Button onClick={props.onDone}>Go to continue</Button>
        <button className="text-sm text-neutral-400 hover:text-neutral-200 underline" onClick={props.onBack}>
          Back
        </button>
      </div>
    </Card>
  );
}
