"use client";

export default function Panel3CostOfWaiting(props: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="text-sm text-neutral-500">Continue · Step 3/4</div>
        <div className="text-2xl md:text-3xl font-semibold">The cost of waiting</div>
        <p className="text-neutral-300 leading-relaxed">
          There’s another option you haven’t chosen yet.
        </p>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
        <div className="text-neutral-300 leading-relaxed">
          You can keep waiting. Not because you’re careless  but because you want to feel ready.
        </div>
        <div className="text-neutral-300 leading-relaxed">
          Most people do this. They watch markets. They read news. They replay scenarios in their head.
        </div>
        <div className="h-2" />
        <div className="text-neutral-300 leading-relaxed">
          Nothing compounds. Not experience. Not judgment. Not emotional control.
        </div>
        <div className="text-neutral-300 leading-relaxed">
          The same questions return. The same hesitation repeats. Just later.
        </div>
        <div className="h-2" />
        <div className="text-neutral-300 leading-relaxed">
          Waiting doesn’t remove risk. It only postpones learning how to handle it.
        </div>
        <div className="text-neutral-300 leading-relaxed">
          When action finally happens, it happens without structure  and the patterns you just recognized
          show up again.
        </div>
        <div className="h-2" />
        <div className="text-neutral-300 leading-relaxed">
          You don’t have to trade today. But at some point, you will decide to try  or to stop thinking
          about it entirely.
        </div>
        <div className="text-neutral-300 leading-relaxed">
          Doing nothing keeps you exactly where you are.
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button className="text-sm text-neutral-500 hover:text-neutral-300 transition" onClick={props.onBack}>
          Back
        </button>
        <button
          className="rounded-xl bg-neutral-100 text-neutral-950 px-5 py-3 hover:bg-neutral-200 transition"
          onClick={props.onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
