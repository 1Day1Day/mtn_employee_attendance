const STYLES: Record<string, string> = {
  APPROVED: "bg-status-success/10 text-status-success",
  PENDING: "bg-status-pending/10 text-status-pending",
  DEACTIVATED: "bg-status-error/10 text-status-error",
  ADMIN: "bg-mtn-yellow/20 text-mtn-black font-semibold",
  STAFF: "bg-mtn-grey/10 text-mtn-grey",
};

export default function StatusBadge({ value }: { value: string }) {
  const style = STYLES[value] ?? "bg-mtn-grey/10 text-mtn-grey";
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${style}`}>
      {value.charAt(0) + value.slice(1).toLowerCase()}
    </span>
  );
}
