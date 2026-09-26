export default function AdminOverviewPage() {
  const cards = [
    { title: "Users", desc: "Approve staff and interns, promote to admin, reset passwords.", href: "/admin/users" },
    { title: "Location", desc: "Set the branch coordinates and the clock-in radius.", href: "/admin/location" },
    { title: "Excused Days", desc: "Mark public holidays and approved leave.", href: "/admin/excused-days" },
    { title: "Audit", desc: "See who has missed 5 or more working days this month.", href: "/admin/audit" },
    { title: "Today's QR", desc: "Display today's clock-in QR code at the branch.", href: "/admin/qr" },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold mb-5">Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c) => (
          <a
            key={c.href}
            href={c.href}
            className="bg-white rounded-xl shadow-card p-5 hover:ring-2 hover:ring-mtn-yellow transition-all"
          >
            <div className="font-semibold mb-1">{c.title}</div>
            <div className="text-sm text-mtn-grey">{c.desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
