export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 shadow">
      {children}
    </div>
  );
}

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = "", ...rest } = props;
  return (
    <button
      {...rest}
      className={
        "rounded-xl px-4 py-2 font-medium bg-neutral-100 text-neutral-900 hover:bg-neutral-200 disabled:opacity-50 disabled:hover:bg-neutral-100 " +
        className
      }
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={
        "w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-neutral-100 outline-none focus:border-neutral-600 " +
        className
      }
    />
  );
}
